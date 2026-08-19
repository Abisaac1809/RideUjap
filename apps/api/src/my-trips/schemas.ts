import { counterpartSchema, reservationStatusSchema } from "../reservations/schemas";
import { tripJsonSchema } from "../trips/dto";

const tripReservationSchema = {
  type: "object",
  required: ["id", "status", "createdAt", "passenger"],
  properties: {
    id: { type: "string" },
    status: reservationStatusSchema,
    createdAt: { type: "string" },
    passenger: counterpartSchema,
  },
};

/**
 * Los dos roles comparten un solo schema con las claves propias de cada uno
 * marcadas como opcionales: el serializador de Fastify no maneja uniones con
 * la fiabilidad suficiente como para arriesgar campos silenciosamente vacíos.
 */
const myTripItemSchema = {
  type: "object",
  required: ["role", "trip"],
  properties: {
    role: { type: "string", enum: ["driver", "passenger"] },
    trip: tripJsonSchema,
    reservations: { type: "array", items: tripReservationSchema },
    reservation: {
      type: "object",
      required: ["id", "status", "createdAt"],
      properties: {
        id: { type: "string" },
        status: reservationStatusSchema,
        createdAt: { type: "string" },
      },
    },
    driverPhone: { type: ["string", "null"] },
  },
};

export const myTripsSchema = {
  response: {
    200: {
      type: "object",
      required: ["upcoming", "history"],
      properties: {
        upcoming: { type: "array", items: myTripItemSchema },
        history: { type: "array", items: myTripItemSchema },
      },
    },
  },
};
