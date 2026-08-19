export type TripDirection = "outbound" | "inbound";
export type TripStatus = "active" | "completed" | "cancelled";
export type AdmissionMode = "auto" | "request";

export interface Trip {
  id: string;
  direction: TripDirection;
  pointText: string;
  pointLat: number;
  pointLng: number;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  admissionMode: AdmissionMode;
  farePerPassenger: number | null;
  status: TripStatus;
  driver: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface SearchTripsQuery {
  destination?: string;
}
