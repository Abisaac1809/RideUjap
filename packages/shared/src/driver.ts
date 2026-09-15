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
