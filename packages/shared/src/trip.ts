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
  direction?: TripDirection;
  lat?: number;
  lng?: number;
  time?: string;
  destination?: string;
}

export interface FareEstimateQuery {
  lat: number;
  lng: number;
  seats: number;
}

export interface FareEstimateResponse {
  suggestedFare: number;
}

export interface CreateTripBody {
  direction: TripDirection;
  pointLat: number;
  pointLng: number;
  pointText: string;
  departureTime: string;
  totalSeats: number;
  admissionMode: AdmissionMode;
  fare: number;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
}

export interface PlaceDetails {
  lat: number;
  lng: number;
  text: string;
}
