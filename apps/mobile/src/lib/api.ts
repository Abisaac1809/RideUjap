import Constants from "expo-constants";
import type { Viaje } from "@rideujap/shared";

const PUERTO_API = 3000;

/** Corta la espera: con datos móviles intermitentes un fetch puede colgarse. */
const TIMEOUT_MS = 10_000;

/**
 * Deduce la URL del API cuando no se configuró `EXPO_PUBLIC_API_URL`.
 *
 * En un teléfono físico "localhost" apunta al propio teléfono, no a la máquina
 * de desarrollo, así que la demo fallaría. Expo expone el host donde corre
 * Metro (p. ej. "192.168.0.12:8081"); se reutiliza esa IP porque el API corre
 * en la misma máquina. Así la demo funciona en un Android real sin configurar
 * nada a mano.
 */
function urlBasePorDefecto(): string {
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? `http://${host}:${PUERTO_API}` : `http://localhost:${PUERTO_API}`;
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? urlBasePorDefecto();

/** Error cuyo mensaje ya está redactado para mostrarse tal cual en pantalla. */
export class ApiError extends Error {}

/**
 * Consulta `GET /viajes`. Sin destino devuelve todos los viajes disponibles.
 */
export async function buscarViajes(destino: string): Promise<Viaje[]> {
  const filtro = destino.trim();
  // Se arma la query a mano: el `URL` de React Native no implementa
  // `searchParams`, así que construirla con esa API fallaría en el dispositivo.
  const query = filtro ? `?destino=${encodeURIComponent(filtro)}` : "";

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const respuesta = await fetch(`${API_URL}/viajes${query}`, { signal: controlador.signal });

    if (!respuesta.ok) {
      throw new ApiError(`El servidor respondió ${respuesta.status}. Intenta de nuevo.`);
    }

    return (await respuesta.json()) as Viaje[];
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La búsqueda tardó demasiado. Revisa tu conexión e intenta de nuevo.");
    }

    throw new ApiError("No pudimos conectar con el servidor. Revisa tu conexión.");
  } finally {
    clearTimeout(temporizador);
  }
}
