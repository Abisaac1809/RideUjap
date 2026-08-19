import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { MeResponse, UpdateMeBody } from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../../db/index";
import { user } from "../../db/schema";
import { getMeSchema, updateMeSchema } from "./schemas";

type HttpError = { code: number; error: string };

type UpdateError = "no_changes" | "email_taken" | "phone_taken" | "user_not_found" | "empty_name";

const updateErrors: Record<UpdateError, HttpError> = {
  no_changes: { code: 400, error: "No hay cambios para aplicar" },
  email_taken: { code: 409, error: "Ese correo ya está registrado" },
  phone_taken: { code: 409, error: "Ese teléfono ya está registrado" },
  user_not_found: { code: 404, error: "Usuario no encontrado" },
  empty_name: { code: 400, error: "El nombre no puede estar vacío" },
};

export async function meRoutes(app: FastifyInstance) {
  app.get<Record<string, never>>(
    "/me",
    { preHandler: requireAuth, schema: getMeSchema },
    async (request, reply) => {
      const userId = request.user!.id;

      const [row] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
        })
        .from(user)
        .where(eq(user.id, userId));

      if (!row) {
        const { code, error } = updateErrors.user_not_found;
        return reply.code(code).send({ error });
      }

      const body: MeResponse = {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        phone: row.phone,
      };

      return body;
    },
  );

  app.patch<{ Body: UpdateMeBody }>(
    "/me",
    { preHandler: requireAuth, schema: updateMeSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const patch = request.body;

      const updates: Partial<{ name: string; image: string | null; phone: string }> = {};

      if (patch.name !== undefined) {
        const name = patch.name.trim();
        if (name.length === 0) {
          const { code, error } = updateErrors.empty_name;
          return reply.code(code).send({ error });
        }
        updates.name = name;
      }

      if (patch.image !== undefined) {
        updates.image = patch.image.trim().length === 0 ? null : patch.image.trim();
      }

      if (patch.phone !== undefined) {
        updates.phone = patch.phone.trim();
      }

      if (Object.keys(updates).length === 0) {
        const { code, error } = updateErrors.no_changes;
        return reply.code(code).send({ error });
      }

      const [updated] = await db.update(user).set(updates).where(eq(user.id, userId)).returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
      });

      if (!updated) {
        const { code, error } = updateErrors.user_not_found;
        return reply.code(code).send({ error });
      }

      const body: MeResponse = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        phone: updated.phone,
      };

      return body;
    },
  );
}
