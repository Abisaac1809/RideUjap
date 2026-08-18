import cors from "@fastify/cors";
import { ilike, sql } from "drizzle-orm";
import Fastify from "fastify";
import type { BuscarViajesQuery, Viaje } from "@rideujap/shared";

import { db } from "./db/index";
import { viajes } from "./db/schema";

const app = Fastify({ logger: true });

// La app móvil corre en Expo Go (origen nativo, sin CORS) pero también en el
// target web de react-native-web, que sí lo exige. En desarrollo se acepta
// cualquier origen; al desplegar (Fase 4) hay que restringirlo.
await app.register(cors, { origin: true });

/**
 * Convierte una fila de Postgres al DTO público.
 *
 * Drizzle entrega las columnas `numeric` como string para no perder precisión;
 * el contrato de `@rideujap/shared` las expone como número para que mobile no
 * tenga que parsear.
 */
function aDto(fila: typeof viajes.$inferSelect): Viaje {
  return {
    id: fila.id,
    origen: fila.origen,
    destino: fila.destino,
    hora: fila.hora,
    cuposDisponibles: fila.cuposDisponibles,
    precioBs: fila.precioBs === null ? null : Number(fila.precioBs),
    precioUsd: fila.precioUsd === null ? null : Number(fila.precioUsd),
  };
}

app.get("/health", async (_request, reply) => {
  try {
    await db.execute(sql`select 1`);
    return { status: "ok", db: "ok" };
  } catch (err) {
    app.log.error(err, "Health check: la base de datos no responde");
    reply.code(503);
    return { status: "degraded", db: "error" };
  }
});

const viajesSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      destino: { type: "string", minLength: 1, maxLength: 100 },
    },
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "origen", "destino", "hora", "cuposDisponibles", "precioBs", "precioUsd"],
        properties: {
          id: { type: "integer" },
          origen: { type: "string" },
          destino: { type: "string" },
          hora: { type: "string" },
          cuposDisponibles: { type: "integer" },
          precioBs: { type: ["number", "null"] },
          precioUsd: { type: ["number", "null"] },
        },
      },
    },
  },
};

app.get<{ Querystring: BuscarViajesQuery }>(
  "/viajes",
  { schema: viajesSchema },
  async (request): Promise<Viaje[]> => {
    const { destino } = request.query;

    const filas = await db
      .select()
      .from(viajes)
      // Búsqueda parcial e insensible a mayúsculas: "san" encuentra "San Diego".
      .where(destino ? ilike(viajes.destino, `%${destino}%`) : undefined)
      .orderBy(viajes.hora);

    return filas.map(aDto);
  },
);

const port = Number(process.env.PORT ?? 3000);

app
  .listen({ port, host: "0.0.0.0" })
  .then((address) => {
    app.log.info(`API listening on ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
