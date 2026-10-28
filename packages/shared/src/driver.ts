/** Tope de cupos de un vehículo y de un viaje en la plataforma. */
export const MAX_SEATS = 8;

/** Rango de años de vehículo aceptado al registrar o editar el perfil de conductor. */
export const MIN_VEHICLE_YEAR = 1980;
export const MAX_VEHICLE_YEAR = 2100;

export interface DriverProfile {
  id: string;
  licenseNumber: string;
  licenseExpiry: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  seats: number;
}

export interface VehiclePublic {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
}

export interface DriverStatusResponse {
  driverProfile: DriverProfile | null;
  vehicle: Vehicle | null;
}

export interface DriverOnboardingBody {
  licenseNumber: string;
  licenseExpiry: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    seats: number;
  };
}

export type DriverProfileUpdateBody = DriverOnboardingBody;
