import type { Vehiculo } from "./vehiculo";

export interface Conductor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  vehiculo: Vehiculo;
  disponible: boolean;
}
