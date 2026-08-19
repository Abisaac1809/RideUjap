import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../db/index";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      phone: { type: "string", required: true, input: true, returned: true },
    },
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:8081"],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = (typeof auth.$Infer.Session)["user"];
