import { Platform } from "react-native";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

import { API_URL } from "./config";

const isWeb = Platform.OS === "web";

const additionalFields = inferAdditionalFields({ user: { phone: { type: "string" } } });

/**
 * En web dependemos de las cookies del navegador (`credentials: "include"`),
 * porque `expo-secure-store` y el plugin de Expo solo existen en nativo.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: isWeb ? { credentials: "include" } : undefined,
  plugins: isWeb
    ? [additionalFields]
    : [
        expoClient({ scheme: "rideujap", storagePrefix: "rideujap", storage: SecureStore }),
        additionalFields,
      ],
});

export const { signUp, signIn, signOut, useSession } = authClient;

/**
 * Opciones de `fetch` para llamar al API autenticado desde ambas plataformas:
 * en web basta con enviar las cookies; en nativo adjuntamos la cookie guardada.
 */
export async function authRequestInit(): Promise<RequestInit> {
  if (isWeb) return { credentials: "include" };
  const cookie = await (authClient as unknown as { getCookie: () => Promise<string> }).getCookie();
  return cookie ? { headers: { Cookie: cookie } } : {};
}
