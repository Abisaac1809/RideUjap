export interface Coord {
  lat: number;
  lng: number;
}

export const UJAP: Coord = { lat: 10.2589, lng: -68.0179 };

export const FUEL_COST_PER_KM = 0.05;
export const ROAD_FACTOR = 1.3;
export const SUGGESTED_COMMISSION = 0.5;

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeSuggestedFare({ lat, lng, seats }: Coord & { seats: number }): number {
  if (!Number.isInteger(seats) || seats < 1) {
    throw new Error("seats must be an integer >= 1");
  }

  const roadKm = haversineKm({ lat, lng }, UJAP) * ROAD_FACTOR;
  const fuelCost = roadKm * FUEL_COST_PER_KM;
  const fare = fuelCost / seats + SUGGESTED_COMMISSION;

  return roundToCents(fare);
}
