import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";

import { auth, type AuthUser } from "./auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    reply.code(401).send({ error: "Tu sesión expiró. Inicia sesión de nuevo" });
    return reply;
  }

  request.user = session.user;
}
