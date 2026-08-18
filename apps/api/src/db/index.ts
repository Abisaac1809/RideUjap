import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida. Copia apps/api/.env.example a apps/api/.env");
}

const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });

// `client` se exporta para que los scripts puntuales (p. ej. seed) puedan cerrar
// la conexión y terminar; el servidor la mantiene abierta durante toda su vida.
export { schema, client };
