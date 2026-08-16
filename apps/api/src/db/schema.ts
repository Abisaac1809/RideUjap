import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, numeric, pgTable, serial, text } from "drizzle-orm/pg-core";

/**
 * Esquema de base de datos (solo servidor).
 *
 * Esta es la representación en Postgres, NO el contrato de la API. El endpoint
 * mapea estas filas al DTO de `@rideujap/shared` antes de responder, para que
 * mobile nunca dependa del esquema de la BD.
 */
export const viajes = pgTable("viajes", {
  id: serial("id").primaryKey(),
  origen: text("origen").notNull(),
  destino: text("destino").notNull(),
  hora: text("hora").notNull(),
  cuposDisponibles: integer("cupos_disponibles").notNull().default(0),
  // Tarifas: se muestran en Bs con referencia en USD (tasa BCV). Ver Fase 3.
  precioBs: numeric("precio_bs", { precision: 12, scale: 2 }),
  precioUsd: numeric("precio_usd", { precision: 10, scale: 2 }),
});

export type Viaje = InferSelectModel<typeof viajes>;
export type NewViaje = InferInsertModel<typeof viajes>;
