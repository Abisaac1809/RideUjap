import { asc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ScheduleDay, UpdateScheduleBody } from "@rideujap/shared";

import { requireAuth } from "../auth/require-auth";
import { db } from "../../db/index";
import { isUniqueViolation } from "../../db/errors";
import { schedules } from "../../db/schema";
import { validateSchedule, type ScheduleError } from "./rules";
import { getScheduleSchema, updateScheduleSchema } from "./schemas";

const scheduleErrors: Record<ScheduleError, string> = {
  duplicate_day: "No puedes repetir un día en el horario",
  invalid_range: "La hora de entrada debe ser anterior a la de salida",
};

async function loadSchedule(userId: string): Promise<ScheduleDay[]> {
  const rows = await db
    .select({
      weekday: schedules.weekday,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
    })
    .from(schedules)
    .where(eq(schedules.userId, userId))
    .orderBy(asc(schedules.weekday));

  return rows.map((row) => ({
    weekday: row.weekday,
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
  }));
}

export async function scheduleRoutes(app: FastifyInstance) {
  app.get(
    "/schedule",
    { preHandler: requireAuth, schema: getScheduleSchema },
    async (request): Promise<ScheduleDay[]> => loadSchedule(request.user!.id),
  );

  app.put<{ Body: UpdateScheduleBody }>(
    "/schedule",
    { preHandler: requireAuth, schema: updateScheduleSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { days } = request.body;

      const error = validateSchedule(days);
      if (error) return reply.code(400).send({ error: scheduleErrors[error] });

      try {
        await db.transaction(async (tx) => {
          await tx.delete(schedules).where(eq(schedules.userId, userId));
          if (days.length) {
            await tx.insert(schedules).values(days.map((day) => ({ ...day, userId })));
          }
        });
      } catch (err) {
        if (isUniqueViolation(err)) {
          return reply
            .code(409)
            .send({ error: "El horario cambió mientras guardabas, intenta de nuevo" });
        }
        throw err;
      }

      return loadSchedule(userId);
    },
  );
}
