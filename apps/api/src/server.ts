import cors from "@fastify/cors";
import { and, eq, ilike, sql } from "drizzle-orm";
import Fastify from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import type { SearchTripsQuery, Trip } from "@rideujap/shared";

import { auth } from "./auth/auth";
import { db } from "./db/index";
import { trips, user } from "./db/schema";
import { myTripsRoutes } from "./my-trips/routes";
import { reservationsRoutes } from "./reservations/routes";
import { toDto, tripColumns, tripJsonSchema } from "./trips/dto";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const req = new Request(url, {
        method: request.method,
        headers: fromNodeHeaders(request.headers),
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      const res = await auth.handler(req);

      reply.status(res.status);
      res.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(res.body ? await res.text() : null);
    } catch (err) {
      app.log.error(err, "Better Auth handler error");
      return reply.status(500).send({ error: "Authentication error" });
    }
  },
});

app.get("/health", async (_request, reply) => {
  try {
    await db.execute(sql`select 1`);
    return { status: "ok", db: "ok" };
  } catch (err) {
    app.log.error(err, "Health check: database is not responding");
    reply.code(503);
    return { status: "degraded", db: "error" };
  }
});

const tripsSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      destination: { type: "string", minLength: 1, maxLength: 100 },
    },
  },
  response: {
    200: {
      type: "array",
      items: tripJsonSchema,
    },
  },
};

app.get<{ Querystring: SearchTripsQuery }>(
  "/trips",
  { schema: tripsSchema },
  async (request): Promise<Trip[]> => {
    const { destination } = request.query;

    const textFilter = destination ? ilike(trips.pointText, `%${destination}%`) : undefined;

    const rows = await db
      .select(tripColumns)
      .from(trips)
      .innerJoin(user, eq(trips.driverId, user.id))
      .where(and(eq(trips.status, "active"), textFilter))
      .orderBy(trips.departureTime);

    return rows.map(toDto);
  },
);

await app.register(reservationsRoutes);
await app.register(myTripsRoutes);

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
