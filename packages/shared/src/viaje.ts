/**
 * Contrato de un viaje tal como lo expone el API (DTO), no la fila de Postgres.
 *
 * Las tarifas viajan como números ya convertidos: el API traduce el `numeric`
 * de la BD (que el driver entrega como string) antes de responder, para que
 * mobile no tenga que parsear nada.
 */
export interface Viaje {
  id: number;
  origen: string;
  destino: string;
  /** Hora de salida en formato 24h, "HH:MM". */
  hora: string;
  cuposDisponibles: number;
  /** Tarifa en bolívares. `null` cuando el viaje queda a convenir entre las partes. */
  precioBs: number | null;
  /** Referencia en dólares de la tarifa, según la tasa oficial del BCV. */
  precioUsd: number | null;
}

/** Parámetros aceptados por `GET /viajes`. */
export interface BuscarViajesQuery {
  /** Filtro parcial e insensible a mayúsculas sobre el destino. */
  destino?: string;
}
