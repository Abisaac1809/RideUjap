import type { VehiclePublic } from "./driver";
import type { Trip } from "./trip";

export type ReservationStatus = "enrolled" | "requested" | "accepted" | "rejected";

/** Estados en los que la reserva está confirmada y los teléfonos se revelan. */
export type ReservationDecision = "accepted" | "rejected";

/** Respuesta de crear una reserva y de aceptarla/rechazarla. */
export interface ReservationResponse {
  id: string;
  tripId: string;
  status: ReservationStatus;
  createdAt: string;
  availableSeats: number;
  contactPhone: string | null;
  /** Vehículo del conductor, `null` mientras la reserva no esté confirmada. */
  vehicle: VehiclePublic | null;
}

export interface DecideReservationBody {
  status: ReservationDecision;
}

export interface Counterpart {
  id: string;
  name: string;
  image: string | null;
  /** `null` mientras la reserva no esté confirmada. */
  phone: string | null;
}

export interface ContactResponse {
  reservationId: string;
  status: ReservationStatus;
  counterpart: Counterpart;
  /** Vehículo del conductor, `null` cuando la contraparte es pasajera o la reserva no está confirmada. */
  vehicle: VehiclePublic | null;
}

/** Reserva vista por el conductor, dentro de uno de sus viajes. */
export interface TripReservation {
  id: string;
  status: ReservationStatus;
  createdAt: string;
  passenger: Counterpart;
}

export interface MyDriverTrip {
  role: "driver";
  trip: Trip;
  reservations: TripReservation[];
}

export interface MyPassengerTrip {
  role: "passenger";
  trip: Trip;
  reservation: {
    id: string;
    status: ReservationStatus;
    createdAt: string;
  };
  /** `null` mientras la reserva no esté confirmada. */
  driverPhone: string | null;
  /** Vehículo del conductor, `null` mientras la reserva no esté confirmada. */
  vehicle: VehiclePublic | null;
}

export type MyTripItem = MyDriverTrip | MyPassengerTrip;

export interface MyTripsResponse {
  upcoming: MyTripItem[];
  history: MyTripItem[];
}
