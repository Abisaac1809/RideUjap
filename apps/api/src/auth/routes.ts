import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";

import { auth } from "./auth";

export async function authRoutes(app: FastifyInstance) {
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
}
