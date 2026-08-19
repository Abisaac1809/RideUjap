import cors from "@fastify/cors";
import { and, eq, ilike, sql } from "drizzle-orm";
import Fastify from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import type { SearchTripsQuery, Trip } from "@rideujap/shared";

import { auth } from "./auth/auth";
import { db } from "./db/index";
import { trips, user } from "./db/schema";

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

type TripRow = {
  id: string;
  direction: (typeof trips.direction.enumValues)[number];
  pointText: string;
  pointLat: number;
  pointLng: number;
  departureTime: Date;
  availableSeats: number;
  totalSeats: number;
  admissionMode: (typeof trips.admissionMode.enumValues)[number];
  farePerPassenger: string | null;
  status: (typeof trips.status.enumValues)[number];
  driverId: string;
  driverName: string;
  driverImage: string | null;
};

function toDto(row: TripRow): Trip {
  return {
    id: row.id,
    direction: row.direction,
    pointText: row.pointText,
    pointLat: row.pointLat,
    pointLng: row.pointLng,
    departureTime: row.departureTime.toISOString(),
    availableSeats: row.availableSeats,
    totalSeats: row.totalSeats,
    admissionMode: row.admissionMode,
    farePerPassenger: row.farePerPassenger === null ? null : Number(row.farePerPassenger),
    status: row.status,
    driver: {
      id: row.driverId,
      name: row.driverName,
      image: row.driverImage,
    },
  };
}

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
      items: {
        type: "object",
        required: [
          "id",
          "direction",
          "pointText",
          "pointLat",
          "pointLng",
          "departureTime",
          "availableSeats",
          "totalSeats",
          "admissionMode",
          "farePerPassenger",
          "status",
          "driver",
        ],
        properties: {
          id: { type: "string" },
          direction: { type: "string", enum: ["outbound", "inbound"] },
          pointText: { type: "string" },
          pointLat: { type: "number" },
          pointLng: { type: "number" },
          departureTime: { type: "string" },
          availableSeats: { type: "integer" },
          totalSeats: { type: "integer" },
          admissionMode: { type: "string", enum: ["auto", "request"] },
          farePerPassenger: { type: ["number", "null"] },
          status: { type: "string", enum: ["active", "completed", "cancelled"] },
          driver: {
            type: "object",
            required: ["id", "name", "image"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              image: { type: ["string", "null"] },
            },
          },
        },
      },
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
      .select({
        id: trips.id,
        direction: trips.direction,
        pointText: trips.pointText,
        pointLat: trips.pointLat,
        pointLng: trips.pointLng,
        departureTime: trips.departureTime,
        availableSeats: trips.availableSeats,
        totalSeats: trips.totalSeats,
        admissionMode: trips.admissionMode,
        farePerPassenger: trips.farePerPassenger,
        status: trips.status,
        driverId: user.id,
        driverName: user.name,
        driverImage: user.image,
      })
      .from(trips)
      .innerJoin(user, eq(trips.driverId, user.id))
      .where(and(eq(trips.status, "active"), textFilter))
      .orderBy(trips.departureTime);

    return rows.map(toDto);
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
