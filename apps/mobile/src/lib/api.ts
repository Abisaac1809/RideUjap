import Constants from "expo-constants";
import type { Trip } from "@rideujap/shared";

const API_PORT = 3000;

const TIMEOUT_MS = 10_000;

function defaultBaseUrl(): string {
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? `http://${host}:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl();

export class ApiError extends Error {}

export async function searchTrips(destination: string): Promise<Trip[]> {
  const filter = destination.trim();
  const query = filter ? `?destination=${encodeURIComponent(filter)}` : "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/trips${query}`, { signal: controller.signal });

    if (!response.ok) {
      throw new ApiError(`El servidor respondió ${response.status}. Intenta de nuevo.`);
    }

    return (await response.json()) as Trip[];
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La búsqueda tardó demasiado. Revisa tu conexión e intenta de nuevo.");
    }

    throw new ApiError("No pudimos conectar con el servidor. Revisa tu conexión.");
  } finally {
    clearTimeout(timer);
  }
}
