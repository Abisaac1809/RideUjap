import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type {
  DriverOnboardingBody,
  DriverProfileUpdateBody,
  DriverStatusResponse,
} from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../../db/index";
import { isUniqueViolation } from "../../db/errors";
import { driverProfile, vehicle } from "../../db/schema";
import { toDriverProfileDto, toVehicleDto } from "./dto";
import { requireDriver } from "./require-driver";
import {
  driverOnboardingSchema,
  driverProfileGetSchema,
  driverProfileUpdateSchema,
} from "./schemas";

export async function driverRoutes(app: FastifyInstance) {
  app.get(
    "/driver/profile",
    { preHandler: requireAuth, schema: driverProfileGetSchema },
    async (request): Promise<DriverStatusResponse> => {
      const userId = request.user!.id;

      const [row] = await db
        .select({ profile: driverProfile, vehicle })
        .from(driverProfile)
        .leftJoin(vehicle, eq(vehicle.driverProfileId, driverProfile.id))
        .where(eq(driverProfile.userId, userId));

      if (!row) return { driverProfile: null, vehicle: null };

      return {
        driverProfile: toDriverProfileDto(row.profile),
        vehicle: row.vehicle ? toVehicleDto(row.vehicle) : null,
      };
    },
  );

  app.post<{ Body: DriverOnboardingBody }>(
    "/driver/onboarding",
    { preHandler: requireAuth, schema: driverOnboardingSchema },
    async (request, reply): Promise<DriverStatusResponse> => {
      const userId = request.user!.id;
      const body = request.body;

      const [existing] = await db
        .select({ id: driverProfile.id })
        .from(driverProfile)
        .where(eq(driverProfile.userId, userId));

      if (existing) {
        return reply.code(409).send({ error: "Ya tienes un perfil de conductor" });
      }

      try {
        const created = await db.transaction(async (tx) => {
          const [profile] = await tx
            .insert(driverProfile)
            .values({
              userId,
              licenseNumber: body.licenseNumber,
              licenseExpiry: body.licenseExpiry,
            })
            .returning();

          const [veh] = await tx
            .insert(vehicle)
            .values({ driverProfileId: profile!.id, ...body.vehicle })
            .returning();

          return { profile: profile!, vehicle: veh! };
        });

        reply.code(201);
        return {
          driverProfile: toDriverProfileDto(created.profile),
          vehicle: toVehicleDto(created.vehicle),
        };
      } catch (err) {
        if (isUniqueViolation(err)) {
          return reply.code(409).send({ error: "Ya tienes un perfil de conductor" });
        }
        throw err;
      }
    },
  );

  app.patch<{ Body: DriverProfileUpdateBody }>(
    "/driver/profile",
    { preHandler: [requireAuth, requireDriver], schema: driverProfileUpdateSchema },
    async (request): Promise<DriverStatusResponse> => {
      const { profile, vehicle: currentVehicle } = request.driver!;
      const body = request.body;

      const [updatedProfile] = await db
        .update(driverProfile)
        .set({ licenseNumber: body.licenseNumber, licenseExpiry: body.licenseExpiry })
        .where(eq(driverProfile.id, profile.id))
        .returning();

      const [updatedVehicle] = await db
        .update(vehicle)
        .set({ ...body.vehicle })
        .where(eq(vehicle.id, currentVehicle.id))
        .returning();

      return {
        driverProfile: toDriverProfileDto(updatedProfile!),
        vehicle: toVehicleDto(updatedVehicle!),
      };
    },
  );
}
