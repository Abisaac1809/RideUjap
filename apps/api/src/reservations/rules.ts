import type {
  AdmissionMode,
  ReservationDecision,
  ReservationStatus,
  TripStatus,
} from "@rideujap/shared";

/**
 * Reglas de negocio del módulo de reservas. Todo lo de este archivo es puro:
 * ni base de datos ni Fastify, para poder probarlo en aislamiento.
 */

export type ReserveError = "own_trip" | "closed" | "duplicate" | "full";
export type DecideError = "forbidden" | "already_handled" | "closed" | "full";

export type TripState = {
  driverId: string;
  status: TripStatus;
  departureTime: Date;
  availableSeats: number;
  admissionMode: AdmissionMode;
};

export type ReserveResult =
  | {
      ok: true;
      status: Extract<ReservationStatus, "enrolled" | "requested">;
      consumesSeat: boolean;
    }
  | { ok: false; reason: ReserveError };

export type DecideResult =
  | { ok: true; status: ReservationDecision; consumesSeat: boolean }
  | { ok: false; reason: DecideError };

/** Un viaje acepta reservas mientras siga activo y no haya salido. */
function isOpen(trip: Pick<TripState, "status" | "departureTime">, now: Date): boolean {
  return trip.status === "active" && trip.departureTime.getTime() >= now.getTime();
}

/**
 * Una reserva `rejected` no ocupa lugar: el pasajero puede volver a solicitar.
 * Cualquier otro estado bloquea una segunda reserva sobre el mismo viaje.
 */
function isLive(status: ReservationStatus): boolean {
  return status !== "rejected";
}

export function canReserve(input: {
  trip: TripState;
  passengerId: string;
  existingStatus: ReservationStatus | null;
  now: Date;
}): ReserveResult {
  const { trip, passengerId, existingStatus, now } = input;

  if (trip.driverId === passengerId) return { ok: false, reason: "own_trip" };
  if (!isOpen(trip, now)) return { ok: false, reason: "closed" };
  if (existingStatus !== null && isLive(existingStatus)) return { ok: false, reason: "duplicate" };
  if (trip.availableSeats <= 0) return { ok: false, reason: "full" };

  // En modo `auto` el pasajero queda inscrito y ocupa el puesto de una vez; en
  // modo `request` la solicitud no descuenta nada hasta que el conductor acepta.
  return trip.admissionMode === "auto"
    ? { ok: true, status: "enrolled", consumesSeat: true }
    : { ok: true, status: "requested", consumesSeat: false };
}

export function canDecide(input: {
  trip: TripState;
  reservationStatus: ReservationStatus;
  actorId: string;
  decision: ReservationDecision;
  now: Date;
}): DecideResult {
  const { trip, reservationStatus, actorId, decision, now } = input;

  if (trip.driverId !== actorId) return { ok: false, reason: "forbidden" };
  if (reservationStatus !== "requested") return { ok: false, reason: "already_handled" };

  // Rechazar no consume puestos, así que se permite aunque el viaje esté lleno
  // o ya haya salido: el conductor siempre puede cerrar una solicitud vieja.
  if (decision === "rejected") return { ok: true, status: "rejected", consumesSeat: false };

  if (!isOpen(trip, now)) return { ok: false, reason: "closed" };
  if (trip.availableSeats <= 0) return { ok: false, reason: "full" };

  return { ok: true, status: "accepted", consumesSeat: true };
}

/** Única definición de "reserva confirmada" para el revelado de teléfono. */
export function canRevealPhone(status: ReservationStatus): boolean {
  return status === "enrolled" || status === "accepted";
}

/**
 * Nada marca los viajes como `completed` en el MVP, así que un viaje activo
 * cuya hora ya pasó también cuenta como historial.
 */
export function classifyMyTrip(input: {
  tripStatus: TripStatus;
  departureTime: Date;
  reservationStatus?: ReservationStatus | null;
  now: Date;
}): "upcoming" | "history" {
  const { tripStatus, departureTime, reservationStatus, now } = input;

  if (reservationStatus === "rejected") return "history";
  if (!isOpen({ status: tripStatus, departureTime }, now)) return "history";

  return "upcoming";
}
