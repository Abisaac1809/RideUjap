import type {
  CreateTripBody,
  MyTripsResponse,
  PlaceDetails,
  PlaceSuggestion,
  ReservationDecision,
  ReservationResponse,
  Trip,
  TripDirection,
} from "@rideujap/shared";

import { authRequestInit } from "./auth-client";
import { API_URL } from "./config";

export { API_URL };

const TIMEOUT_MS = 10_000;

export class ApiError extends Error {}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const auth = await authRequestInit();
    const response = await fetch(`${API_URL}${path}`, {
      ...auth,
      ...init,
      headers: {
        ...(auth.headers as Record<string, string> | undefined),
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers as Record<string, string> | undefined),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `El servidor respondió ${response.status}. Intenta de nuevo.`;
      try {
        const data = (await response.json()) as { error?: string; message?: string };
        message = data.message ?? data.error ?? message;
      } catch {
        // El cuerpo no era JSON; nos quedamos con el mensaje por defecto.
      }
      throw new ApiError(message);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La solicitud tardó demasiado. Revisa tu conexión e intenta de nuevo.");
    }
    throw new ApiError("No pudimos conectar con el servidor. Revisa tu conexión.");
  } finally {
    clearTimeout(timer);
  }
}

export interface TripSearchParams {
  direction?: TripDirection;
  destination?: string;
}

export function searchTrips(params: TripSearchParams): Promise<Trip[]> {
  const query = new URLSearchParams();
  if (params.direction) query.set("direction", params.direction);

  const destination = params.destination?.trim();
  if (destination) query.set("destination", destination);

  const suffix = query.toString() ? `?${query}` : "";
  return apiFetch<Trip[]>(`/trips${suffix}`);
}

export function suggestPlaces(q: string, session: string): Promise<PlaceSuggestion[]> {
  const query = new URLSearchParams({ q, session });
  return apiFetch<PlaceSuggestion[]>(`/places/suggest?${query}`);
}

export function retrievePlace(id: string, session: string): Promise<PlaceDetails> {
  const query = new URLSearchParams({ session });
  return apiFetch<PlaceDetails>(`/places/retrieve/${encodeURIComponent(id)}?${query}`);
}

export interface FareEstimateParams {
  lat: number;
  lng: number;
  seats: number;
}

export async function estimateFare(params: FareEstimateParams): Promise<number> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    seats: String(params.seats),
  });
  const { suggestedFare } = await apiFetch<{ suggestedFare: number }>(
    `/trips/fare-estimate?${query}`,
  );
  return suggestedFare;
}

export function createTrip(body: CreateTripBody): Promise<Trip> {
  return apiFetch<Trip>("/trips", { method: "POST", body: JSON.stringify(body) });
}

export function getMyTrips(): Promise<MyTripsResponse> {
  return apiFetch<MyTripsResponse>("/my-trips");
}

export function createReservation(tripId: string): Promise<ReservationResponse> {
  return apiFetch<ReservationResponse>(`/trips/${tripId}/reservations`, { method: "POST" });
}

export function decideReservation(
  id: string,
  status: ReservationDecision,
): Promise<ReservationResponse> {
  return apiFetch<ReservationResponse>(`/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
