export interface Trip {
  id: string;
  direction: "outbound" | "inbound";
  pointText: string;
  pointLat: number;
  pointLng: number;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  admissionMode: "auto" | "request";
  farePerPassenger: number | null;
  status: "active" | "completed" | "cancelled";
  driver: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface SearchTripsQuery {
  destination?: string;
}
