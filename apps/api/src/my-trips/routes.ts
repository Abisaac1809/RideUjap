import { eq, inArray } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { MyTripItem, MyTripsResponse, TripReservation } from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../db/index";
import { reservations, trips, user } from "../db/schema";
import { canRevealPhone, classifyMyTrip } from "../reservations/rules";
import { toDto, tripColumns } from "../trips/dto";
import { myTripsSchema } from "./schemas";

function departureOf(item: MyTripItem): number {
  return new Date(item.trip.departureTime).getTime();
}

export async function myTripsRoutes(app: FastifyInstance) {
  app.get(
    "/my-trips",
    { preHandler: requireAuth, schema: myTripsSchema },
    async (request): Promise<MyTripsResponse> => {
      const actorId = request.user!.id;
      const now = new Date();

      // Lado conductor: los viajes que publiqué, con sus reservas dentro.
      const driverRows = await db
        .select(tripColumns)
        .from(trips)
        .innerJoin(user, eq(trips.driverId, user.id))
        .where(eq(trips.driverId, actorId));

      const tripIds = driverRows.map((row) => row.id);

      const reservationRows = tripIds.length
        ? await db
            .select({
              id: reservations.id,
              tripId: reservations.tripId,
              status: reservations.status,
              createdAt: reservations.createdAt,
              passengerId: user.id,
              passengerName: user.name,
              passengerImage: user.image,
              passengerPhone: user.phone,
            })
            .from(reservations)
            .innerJoin(user, eq(reservations.passengerId, user.id))
            .where(inArray(reservations.tripId, tripIds))
            .orderBy(reservations.createdAt)
        : [];

      const reservationsByTrip = new Map<string, TripReservation[]>();

      for (const row of reservationRows) {
        const list = reservationsByTrip.get(row.tripId) ?? [];

        list.push({
          id: row.id,
          status: row.status,
          createdAt: row.createdAt.toISOString(),
          passenger: {
            id: row.passengerId,
            name: row.passengerName,
            image: row.passengerImage,
            phone: canRevealPhone(row.status) ? row.passengerPhone : null,
          },
        });

        reservationsByTrip.set(row.tripId, list);
      }

      // Lado pasajero: los viajes en los que reservé, con el teléfono del conductor.
      const passengerRows = await db
        .select({
          ...tripColumns,
          reservationId: reservations.id,
          reservationStatus: reservations.status,
          reservationCreatedAt: reservations.createdAt,
          driverPhone: user.phone,
        })
        .from(reservations)
        .innerJoin(trips, eq(reservations.tripId, trips.id))
        .innerJoin(user, eq(trips.driverId, user.id))
        .where(eq(reservations.passengerId, actorId));

      const upcoming: MyTripItem[] = [];
      const history: MyTripItem[] = [];

      for (const row of driverRows) {
        const bucket = classifyMyTrip({
          tripStatus: row.status,
          departureTime: row.departureTime,
          now,
        });

        (bucket === "upcoming" ? upcoming : history).push({
          role: "driver",
          trip: toDto(row),
          reservations: reservationsByTrip.get(row.id) ?? [],
        });
      }

      for (const row of passengerRows) {
        const bucket = classifyMyTrip({
          tripStatus: row.status,
          departureTime: row.departureTime,
          reservationStatus: row.reservationStatus,
          now,
        });

        (bucket === "upcoming" ? upcoming : history).push({
          role: "passenger",
          trip: toDto(row),
          reservation: {
            id: row.reservationId,
            status: row.reservationStatus,
            createdAt: row.reservationCreatedAt.toISOString(),
          },
          driverPhone: canRevealPhone(row.reservationStatus) ? row.driverPhone : null,
        });
      }

      upcoming.sort((a, b) => departureOf(a) - departureOf(b));
      history.sort((a, b) => departureOf(b) - departureOf(a));

      return { upcoming, history };
    },
  );
}
