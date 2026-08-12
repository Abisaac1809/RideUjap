import { Vehiculo } from "./vehiculo";

interface Conductor{
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    vehiculo: Vehiculo;
    disponible: boolean;
}