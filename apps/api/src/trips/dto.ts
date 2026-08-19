import type { Trip } from "@rideujap/shared";

import { trips, user } from "../db/schema";

/**
 * Columnas que componen el DTO de viaje. Se comparte entre `GET /trips` y
 * `GET /my-trips` para que ambos devuelvan exactamente la misma forma.
 */
export const tripColumns = {
  id: trips.id,
  direction: trips.direction,
  pointText: trips.pointText,
  pointLat: trips.pointLat,
  pointLng: trips.pointLng,
  departureTime: trips.departureTime,
  availableSeats: trips.availableSeats,
  totalSeats: trips.totalSeats,
  admissionMode: trips.admissionMode,
  farePerPassenger: trips.farePerPassenger,
  status: trips.status,
  driverId: user.id,
  driverName: user.name,
  driverImage: user.image,
};

export type TripRow = {
  id: string;
  direction: (typeof trips.direction.enumValues)[number];
  pointText: string;
  pointLat: number;
  pointLng: number;
  departureTime: Date;
  availableSeats: number;
  totalSeats: number;
  admissionMode: (typeof trips.admissionMode.enumValues)[number];
  farePerPassenger: string | null;
  status: (typeof trips.status.enumValues)[number];
  driverId: string;
  driverName: string;
  driverImage: string | null;
};

export function toDto(row: TripRow): Trip {
  return {
    id: row.id,
    direction: row.direction,
    pointText: row.pointText,
    pointLat: row.pointLat,
    pointLng: row.pointLng,
    departureTime: row.departureTime.toISOString(),
    availableSeats: row.availableSeats,
    totalSeats: row.totalSeats,
    admissionMode: row.admissionMode,
    farePerPassenger: row.farePerPassenger === null ? null : Number(row.farePerPassenger),
    status: row.status,
    driver: {
      id: row.driverId,
      name: row.driverName,
      image: row.driverImage,
    },
  };
}

/** Schema de respuesta de un viaje, reutilizado por las rutas que lo devuelven. */
export const tripJsonSchema = {
  type: "object",
  required: [
    "id",
    "direction",
    "pointText",
    "pointLat",
    "pointLng",
    "departureTime",
    "availableSeats",
    "totalSeats",
    "admissionMode",
    "farePerPassenger",
    "status",
    "driver",
  ],
  properties: {
    id: { type: "string" },
    direction: { type: "string", enum: ["outbound", "inbound"] },
    pointText: { type: "string" },
    pointLat: { type: "number" },
    pointLng: { type: "number" },
    departureTime: { type: "string" },
    availableSeats: { type: "integer" },
    totalSeats: { type: "integer" },
    admissionMode: { type: "string", enum: ["auto", "request"] },
    farePerPassenger: { type: ["number", "null"] },
    status: { type: "string", enum: ["active", "completed", "cancelled"] },
    driver: {
      type: "object",
      required: ["id", "name", "image"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        image: { type: ["string", "null"] },
      },
    },
  },
};
