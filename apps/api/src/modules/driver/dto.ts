import type { DriverProfile, Vehicle, VehiclePublic } from "@rideujap/shared";

import type { DriverProfile as DriverProfileRow, Vehicle as VehicleRow } from "../../db/schema";

export function toDriverProfileDto(row: DriverProfileRow): DriverProfile {
  return {
    id: row.id,
    licenseNumber: row.licenseNumber,
    licenseExpiry: row.licenseExpiry,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toVehicleDto(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    plate: row.plate,
    seats: row.seats,
  };
}

export function toVehiclePublic(row: VehicleRow | Vehicle): VehiclePublic {
  return {
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    plate: row.plate,
  };
}
