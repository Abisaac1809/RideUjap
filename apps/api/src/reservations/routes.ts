import { and, eq, gt, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { FastifyInstance } from "fastify";
import type { ContactResponse, DecideReservationBody, ReservationResponse } from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../db/index";
import { isUniqueViolation } from "../db/errors";
import { reservations, trips, user } from "../db/schema";
import {
  canDecide,
  canReserve,
  canRevealPhone,
  type DecideError,
  type ReserveError,
} from "./rules";
import { contactSchema, createReservationSchema, decideReservationSchema } from "./schemas";

type HttpError = { code: number; error: string };

const reserveErrors: Record<ReserveError, HttpError> = {
  own_trip: { code: 403, error: "No puedes reservar tu propio viaje" },
  closed: { code: 409, error: "El viaje ya no acepta reservas" },
  duplicate: { code: 409, error: "Ya tienes una reserva en este viaje" },
  full: { code: 409, error: "El viaje está lleno" },
};

const decideErrors: Record<DecideError, HttpError> = {
  forbidden: { code: 403, error: "No eres el conductor de este viaje" },
  already_handled: { code: 409, error: "La reserva ya fue gestionada" },
  closed: { code: 409, error: "El viaje ya no acepta reservas" },
  full: { code: 409, error: "El viaje está lleno" },
};

/**
 * Se lanza dentro de una transacción cuando otra request ganó la carrera:
 * propagarla revierte lo que ya se hubiera escrito.
 */
class ConflictError extends Error {
  constructor(readonly detail: HttpError) {
    super(detail.error);
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Decremento atómico: la condición viaja en el `WHERE` del propio `UPDATE`, así
 * que dos reservas simultáneas no pueden leer el mismo cupo y sobrevenderlo.
 */
async function takeSeat(tx: Tx, tripId: string): Promise<number> {
  const [updated] = await tx
    .update(trips)
    .set({ availableSeats: sql`${trips.availableSeats} - 1` })
    .where(and(eq(trips.id, tripId), eq(trips.status, "active"), gt(trips.availableSeats, 0)))
    .returning({ availableSeats: trips.availableSeats });

  if (!updated) throw new ConflictError(reserveErrors.full);

  return updated.availableSeats;
}

export async function reservationsRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>(
    "/trips/:id/reservations",
    { preHandler: requireAuth, schema: createReservationSchema },
    async (request, reply) => {
      const passengerId = request.user!.id;
      const tripId = request.params.id;

      const [trip] = await db
        .select({
          driverId: trips.driverId,
          status: trips.status,
          departureTime: trips.departureTime,
          availableSeats: trips.availableSeats,
          admissionMode: trips.admissionMode,
          driverPhone: user.phone,
        })
        .from(trips)
        .innerJoin(user, eq(trips.driverId, user.id))
        .where(eq(trips.id, tripId));

      if (!trip) return reply.code(404).send({ error: "Viaje no encontrado" });

      const [live] = await db
        .select({ status: reservations.status })
        .from(reservations)
        .where(
          and(
            eq(reservations.tripId, tripId),
            eq(reservations.passengerId, passengerId),
            ne(reservations.status, "rejected"),
          ),
        )
        .limit(1);

      const decision = canReserve({
        trip,
        passengerId,
        existingStatus: live?.status ?? null,
        now: new Date(),
      });

      if (!decision.ok) {
        const { code, error } = reserveErrors[decision.reason];
        return reply.code(code).send({ error });
      }

      try {
        const created = await db.transaction(async (tx) => {
          const availableSeats = decision.consumesSeat
            ? await takeSeat(tx, tripId)
            : trip.availableSeats;

          const [reservation] = await tx
            .insert(reservations)
            .values({ tripId, passengerId, status: decision.status })
            .returning();

          return { reservation: reservation!, availableSeats };
        });

        const body: ReservationResponse = {
          id: created.reservation.id,
          tripId,
          status: created.reservation.status,
          createdAt: created.reservation.createdAt.toISOString(),
          availableSeats: created.availableSeats,
          contactPhone: canRevealPhone(created.reservation.status) ? trip.driverPhone : null,
        };

        return reply.code(201).send(body);
      } catch (err) {
        if (err instanceof ConflictError) {
          return reply.code(err.detail.code).send({ error: err.detail.error });
        }

        // El índice único parcial atrapa la doble reserva simultánea.
        if (isUniqueViolation(err)) {
          const { code, error } = reserveErrors.duplicate;
          return reply.code(code).send({ error });
        }

        throw err;
      }
    },
  );

  app.patch<{ Params: { id: string }; Body: DecideReservationBody }>(
    "/reservations/:id",
    { preHandler: requireAuth, schema: decideReservationSchema },
    async (request, reply) => {
      const actorId = request.user!.id;
      const reservationId = request.params.id;

      const [row] = await db
        .select({
          status: reservations.status,
          tripId: trips.id,
          driverId: trips.driverId,
          tripStatus: trips.status,
          departureTime: trips.departureTime,
          availableSeats: trips.availableSeats,
          admissionMode: trips.admissionMode,
          passengerPhone: user.phone,
        })
        .from(reservations)
        .innerJoin(trips, eq(reservations.tripId, trips.id))
        .innerJoin(user, eq(reservations.passengerId, user.id))
        .where(eq(reservations.id, reservationId));

      if (!row) return reply.code(404).send({ error: "Reserva no encontrada" });

      const decision = canDecide({
        trip: {
          driverId: row.driverId,
          status: row.tripStatus,
          departureTime: row.departureTime,
          availableSeats: row.availableSeats,
          admissionMode: row.admissionMode,
        },
        reservationStatus: row.status,
        actorId,
        decision: request.body.status,
        now: new Date(),
      });

      if (!decision.ok) {
        const { code, error } = decideErrors[decision.reason];
        return reply.code(code).send({ error });
      }

      try {
        const result = await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(reservations)
            .set({ status: decision.status })
            .where(and(eq(reservations.id, reservationId), eq(reservations.status, "requested")))
            .returning();

          // Otro PATCH simultáneo la gestionó primero: no se toca el cupo.
          if (!updated) throw new ConflictError(decideErrors.already_handled);

          const availableSeats = decision.consumesSeat
            ? await takeSeat(tx, row.tripId)
            : row.availableSeats;

          return { reservation: updated, availableSeats };
        });

        const body: ReservationResponse = {
          id: result.reservation.id,
          tripId: row.tripId,
          status: result.reservation.status,
          createdAt: result.reservation.createdAt.toISOString(),
          availableSeats: result.availableSeats,
          contactPhone: canRevealPhone(result.reservation.status) ? row.passengerPhone : null,
        };

        return reply.send(body);
      } catch (err) {
        if (err instanceof ConflictError) {
          return reply.code(err.detail.code).send({ error: err.detail.error });
        }

        throw err;
      }
    },
  );

  const passengerUser = alias(user, "passenger_user");
  const driverUser = alias(user, "driver_user");

  app.get<{ Params: { id: string } }>(
    "/reservations/:id/contact",
    { preHandler: requireAuth, schema: contactSchema },
    async (request, reply) => {
      const actorId = request.user!.id;
      const reservationId = request.params.id;

      const [row] = await db
        .select({
          status: reservations.status,
          passengerId: reservations.passengerId,
          driverId: trips.driverId,
          passenger: {
            id: passengerUser.id,
            name: passengerUser.name,
            image: passengerUser.image,
            phone: passengerUser.phone,
          },
          driver: {
            id: driverUser.id,
            name: driverUser.name,
            image: driverUser.image,
            phone: driverUser.phone,
          },
        })
        .from(reservations)
        .innerJoin(trips, eq(reservations.tripId, trips.id))
        .innerJoin(passengerUser, eq(reservations.passengerId, passengerUser.id))
        .innerJoin(driverUser, eq(trips.driverId, driverUser.id))
        .where(eq(reservations.id, reservationId));

      if (!row) return reply.code(404).send({ error: "Reserva no encontrada" });

      const isDriver = actorId === row.driverId;
      const isPassenger = actorId === row.passengerId;

      if (!isDriver && !isPassenger) {
        return reply.code(403).send({ error: "No tienes acceso a esta reserva" });
      }

      // Revelado bidireccional: cada lado ve al otro, y solo si está confirmada.
      const counterpart = isDriver ? row.passenger : row.driver;

      const body: ContactResponse = {
        reservationId,
        status: row.status,
        counterpart: {
          ...counterpart,
          phone: canRevealPhone(row.status) ? counterpart.phone : null,
        },
      };

      return body;
    },
  );
}
