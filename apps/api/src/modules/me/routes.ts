import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { MeResponse, UpdateMeBody } from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../../db/index";
import { user } from "../../db/schema";
import { toUserUpdates, type UpdateError } from "./rules";
import { getMeSchema, updateMeSchema } from "./schemas";

const updateErrors: Record<UpdateError, string> = {
  no_changes: "No hay cambios para aplicar",
  empty_name: "El nombre no puede estar vacío",
  empty_phone: "El teléfono no puede estar vacío",
};

const USER_NOT_FOUND = "Usuario no encontrado";

const meColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  phone: user.phone,
};

export async function meRoutes(app: FastifyInstance) {
  app.get<{ Reply: MeResponse | { error: string } }>(
    "/me",
    { preHandler: requireAuth, schema: getMeSchema },
    async (request, reply) => {
      const [row] = await db.select(meColumns).from(user).where(eq(user.id, request.user!.id));

      if (!row) return reply.code(404).send({ error: USER_NOT_FOUND });

      return row satisfies MeResponse;
    },
  );

  app.patch<{ Body: UpdateMeBody }>(
    "/me",
    { preHandler: requireAuth, schema: updateMeSchema },
    async (request, reply) => {
      const result = toUserUpdates(request.body);

      if (!result.ok) return reply.code(400).send({ error: updateErrors[result.error] });

      const [row] = await db
        .update(user)
        .set(result.updates)
        .where(eq(user.id, request.user!.id))
        .returning(meColumns);

      if (!row) return reply.code(404).send({ error: USER_NOT_FOUND });

      return row satisfies MeResponse;
    },
  );
}
