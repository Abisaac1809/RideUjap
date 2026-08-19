import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

import { API_URL } from "./api";

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({ scheme: "rideujap", storagePrefix: "rideujap", storage: SecureStore }),
    inferAdditionalFields({ user: { phone: { type: "string" } } }),
  ],
});

export const { signUp, signIn, signOut, useSession } = authClient;
