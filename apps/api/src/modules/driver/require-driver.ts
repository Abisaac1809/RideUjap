import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

import { db } from "../../db/index";
import { driverProfile, vehicle, type DriverProfile, type Vehicle } from "../../db/schema";

declare module "fastify" {
  interface FastifyRequest {
    driver?: { profile: DriverProfile; vehicle: Vehicle };
  }
}

export async function requireDriver(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!.id;

  const [row] = await db
    .select({ profile: driverProfile, vehicle })
    .from(driverProfile)
    .leftJoin(vehicle, eq(vehicle.driverProfileId, driverProfile.id))
    .where(eq(driverProfile.userId, userId));

  if (!row || !row.vehicle) {
    reply.code(403).send({ error: "Solo conductores" });
    return reply;
  }

  request.driver = { profile: row.profile, vehicle: row.vehicle };
}
