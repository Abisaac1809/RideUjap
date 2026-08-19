import { and, asc, eq, gt, gte, ilike, lte, sql, type SQL } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type {
  CreateTripBody,
  FareEstimateQuery,
  FareEstimateResponse,
  SearchTripsQuery,
  Trip,
} from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../../db/index";
import { trips, user } from "../../db/schema";
import { httpError } from "../../lib/http-error";
import { tripColumns, toDto } from "./dto";
import { computeSuggestedFare } from "./fare";
import { createTripSchema, fareEstimateSchema, searchTripsSchema } from "./schemas";

const TIME_WINDOW_MS = 30 * 60 * 1000;
const MAX_DISTANCE_KM = 5;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function distanceKm(lat: number, lng: number): SQL<number> {
  return sql<number>`(6371 * acos(least(1, greatest(-1,
    cos(radians(${lat})) * cos(radians(${trips.pointLat})) *
    cos(radians(${trips.pointLng}) - radians(${lng})) +
    sin(radians(${lat})) * sin(radians(${trips.pointLat}))))))`;
}

export async function tripRoutes(app: FastifyInstance) {
  app.get<{ Querystring: SearchTripsQuery }>(
    "/trips",
    { preHandler: requireAuth, schema: searchTripsSchema },
    async (request): Promise<Trip[]> => {
      const { direction, lat, lng, time, destination } = request.query;

      if ((lat === undefined) !== (lng === undefined)) {
        throw httpError(400, "lat and lng must be provided together");
      }

      const conditions: SQL[] = [
        eq(trips.status, "active"),
        gt(trips.availableSeats, 0),
        gte(trips.departureTime, new Date()),
      ];

      if (direction) conditions.push(eq(trips.direction, direction));
      if (destination) conditions.push(ilike(trips.pointText, `%${escapeLike(destination)}%`));

      if (time) {
        const at = new Date(time);
        if (Number.isNaN(at.getTime())) {
          throw httpError(400, "time must be a valid ISO date-time");
        }
        const from = new Date(at.getTime() - TIME_WINDOW_MS);
        const to = new Date(at.getTime() + TIME_WINDOW_MS);
        conditions.push(gte(trips.departureTime, from), lte(trips.departureTime, to));
      }

      const hasPoint = lat !== undefined && lng !== undefined;
      const distance = hasPoint ? distanceKm(lat, lng) : undefined;
      if (distance) conditions.push(sql`${distance} < ${MAX_DISTANCE_KM}`);

      const rows = await db
        .select(tripColumns)
        .from(trips)
        .innerJoin(user, eq(trips.driverId, user.id))
        .where(and(...conditions))
        .orderBy(distance ? asc(distance) : asc(trips.departureTime));

      return rows.map(toDto);
    },
  );

  app.get<{ Querystring: FareEstimateQuery }>(
    "/trips/fare-estimate",
    { preHandler: requireAuth, schema: fareEstimateSchema },
    async (request): Promise<FareEstimateResponse> => {
      const { lat, lng, seats } = request.query;
      return { suggestedFare: computeSuggestedFare({ lat, lng, seats }) };
    },
  );

  app.post<{ Body: CreateTripBody }>(
    "/trips",
    { preHandler: requireAuth, schema: createTripSchema },
    async (request, reply): Promise<Trip> => {
      const driver = request.user!;

      const body = request.body;
      const departureTime = new Date(body.departureTime);
      if (Number.isNaN(departureTime.getTime())) {
        throw httpError(400, "departureTime must be a valid ISO date-time");
      }
      if (departureTime.getTime() <= Date.now()) {
        throw httpError(400, "departureTime must be in the future");
      }

      const [row] = await db
        .insert(trips)
        .values({
          driverId: driver.id,
          direction: body.direction,
          pointLat: body.pointLat,
          pointLng: body.pointLng,
          pointText: body.pointText,
          departureTime,
          totalSeats: body.totalSeats,
          availableSeats: body.totalSeats,
          admissionMode: body.admissionMode,
          farePerPassenger: body.fare.toFixed(2),
        })
        .returning();

      if (!row) {
        throw httpError(500, "Failed to create trip");
      }

      reply.code(201);
      return toDto({
        ...row,
        driverName: driver.name,
        driverImage: driver.image ?? null,
      });
    },
  );
}
