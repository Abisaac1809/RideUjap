import { sql } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const tripDirectionEnum = pgEnum("trip_direction", ["outbound", "inbound"]);
export const admissionModeEnum = pgEnum("admission_mode", ["auto", "request"]);
export const tripStatusEnum = pgEnum("trip_status", ["active", "completed", "cancelled"]);
export const reservationStatusEnum = pgEnum("reservation_status", [
  "enrolled",
  "requested",
  "accepted",
  "rejected",
]);

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    driverId: text("driver_id")
      .notNull()
      .references(() => user.id),
    direction: tripDirectionEnum("direction").notNull(),
    pointLat: doublePrecision("point_lat").notNull(),
    pointLng: doublePrecision("point_lng").notNull(),
    pointText: text("point_text").notNull(),
    departureTime: timestamp("departure_time", { withTimezone: true }).notNull(),
    totalSeats: integer("total_seats").notNull(),
    availableSeats: integer("available_seats").notNull(),
    admissionMode: admissionModeEnum("admission_mode").notNull(),
    farePerPassenger: numeric("fare_per_passenger", { precision: 10, scale: 2 }),
    status: tripStatusEnum("status").notNull().default("active"),
  },
  (table) => [index("trips_driver_idx").on(table.driverId)],
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id),
    passengerId: text("passenger_id")
      .notNull()
      .references(() => user.id),
    status: reservationStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Un pasajero no puede tener dos reservas vivas sobre el mismo viaje. Se
    // excluye `rejected` para dejarlo solicitar de nuevo tras un rechazo.
    uniqueIndex("reservations_trip_passenger_active_uidx")
      .on(table.tripId, table.passengerId)
      .where(sql`${table.status} <> 'rejected'`),
    index("reservations_passenger_idx").on(table.passengerId),
    index("reservations_trip_idx").on(table.tripId),
  ],
);

export * from "./auth-schema";

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
