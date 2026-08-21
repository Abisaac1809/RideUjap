import type { FastifyInstance } from "fastify";
import type { PlaceDetails, PlaceSuggestion } from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { UJAP } from "../trips/fare";
import { httpError } from "../../lib/http-error";

const SEARCH_BOX_URL = "https://api.mapbox.com/search/searchbox/v1";
const UPSTREAM_TIMEOUT_MS = 8_000;

// Restrict autocomplete to the greater Valencia + San Diego metro area
// (min_lon,min_lat,max_lon,max_lat). Widen or remove when opening to more cities.
const VALENCIA_BBOX = "-68.12,10.05,-67.82,10.38";
const PROXIMITY = `${UJAP.lng},${UJAP.lat}`;

// Prioritise specific places (malls, businesses, landmarks) and addresses over
// administrative areas, so results like "Sambil" or "Big Low" show up instead
// of just city names.
const SUGGEST_TYPES = "poi,address,street,neighborhood,place,locality";

type MapboxSuggestion = {
  mapbox_id: string;
  name?: string;
  place_formatted?: string;
  full_address?: string;
};

type MapboxFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: { name?: string; place_formatted?: string; full_address?: string };
};

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`Mapbox responded ${res.status}`);
  }
  return res.json();
}

export async function placesRoutes(app: FastifyInstance) {
  const accessToken = process.env.MAPBOX_ACCESS_TOKEN;

  app.get<{ Querystring: { q: string; session: string } }>(
    "/places/suggest",
    {
      preHandler: requireAuth,
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          required: ["q", "session"],
          properties: {
            q: { type: "string", minLength: 1, maxLength: 256 },
            session: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request): Promise<PlaceSuggestion[]> => {
      if (!accessToken) {
        throw httpError(500, "MAPBOX_ACCESS_TOKEN is not configured");
      }

      const params = new URLSearchParams({
        q: request.query.q,
        session_token: request.query.session,
        access_token: accessToken,
        language: "es",
        country: "ve",
        limit: "10",
        types: SUGGEST_TYPES,
        proximity: PROXIMITY,
        bbox: VALENCIA_BBOX,
      });

      try {
        const data = (await fetchJson(`${SEARCH_BOX_URL}/suggest?${params}`)) as {
          suggestions?: MapboxSuggestion[];
        };
        return (data.suggestions ?? []).map((s) => ({
          id: s.mapbox_id,
          name: s.name ?? "",
          address: s.place_formatted ?? s.full_address ?? "",
        }));
      } catch (err) {
        throw upstreamError(app, err, "suggest");
      }
    },
  );

  app.get<{ Params: { id: string }; Querystring: { session: string } }>(
    "/places/retrieve/:id",
    {
      preHandler: requireAuth,
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", minLength: 1 } },
        },
        querystring: {
          type: "object",
          additionalProperties: false,
          required: ["session"],
          properties: { session: { type: "string", minLength: 1 } },
        },
      },
    },
    async (request): Promise<PlaceDetails> => {
      if (!accessToken) {
        throw httpError(500, "MAPBOX_ACCESS_TOKEN is not configured");
      }

      const params = new URLSearchParams({
        session_token: request.query.session,
        access_token: accessToken,
      });

      let data: { features?: MapboxFeature[] };
      try {
        data = (await fetchJson(
          `${SEARCH_BOX_URL}/retrieve/${encodeURIComponent(request.params.id)}?${params}`,
        )) as { features?: MapboxFeature[] };
      } catch (err) {
        throw upstreamError(app, err, "retrieve");
      }

      const feature = data.features?.[0];
      const coordinates = feature?.geometry?.coordinates;
      if (!feature || !coordinates) {
        throw httpError(404, "Place not found");
      }

      const [lng, lat] = coordinates;
      return {
        lat,
        lng,
        text: feature.properties?.name ?? feature.properties?.place_formatted ?? "",
      };
    },
  );
}

function upstreamError(app: FastifyInstance, err: unknown, op: string) {
  app.log.error(err, `Mapbox ${op} failed`);
  const timedOut = err instanceof Error && err.name === "TimeoutError";
  return httpError(timedOut ? 504 : 502, "Location service is unavailable");
}
