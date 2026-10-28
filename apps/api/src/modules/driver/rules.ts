import { MAX_SEATS } from "@rideujap/shared";

/**
 * Reglas de negocio del módulo de conductor. Todo lo de este archivo es puro:
 * ni base de datos ni Fastify, para poder probarlo en aislamiento.
 */

/**
 * Los cupos ofrecidos no pueden superar los asientos reales del vehículo ni
 * el tope global de la plataforma.
 */
export function effectiveSeats(requested: number, vehicleSeats: number): number {
  return Math.min(requested, vehicleSeats, MAX_SEATS);
}
