import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../../db/index";

export async function healthRoutes(app: FastifyInstance) {
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
}
