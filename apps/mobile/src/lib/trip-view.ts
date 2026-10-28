import type { Trip, VehiclePublic } from "@rideujap/shared";

export type TripViewer = "driver" | "passenger";

export interface TripDescription {
  start: string;
  end: string;
}

export function describeTrip(
  trip: Pick<Trip, "direction" | "pointText">,
  viewer: TripViewer,
): TripDescription {
  const point = trip.pointText;
  const inbound = trip.direction === "inbound";

  if (viewer === "passenger") {
    return inbound
      ? { start: `Te recogen en ${point}`, end: "Llegas a la UJAP" }
      : { start: "Te recogen en la UJAP", end: `Te dejan en ${point}` };
  }

  return inbound
    ? { start: `Sales de ${point}`, end: "Llegas a la UJAP" }
    : { start: "Sales de la UJAP", end: `Llegas a ${point}` };
}

export function formatOccupancy(trip: Pick<Trip, "availableSeats" | "totalSeats">): string {
  return `${trip.totalSeats - trip.availableSeats} de ${trip.totalSeats} cupos ocupados`;
}

export function formatVehicle(vehicle: VehiclePublic): string {
  return `${vehicle.make} ${vehicle.model} ${vehicle.color.toLowerCase()} · ${vehicle.plate}`;
}
