import Constants from "expo-constants";

const API_PORT = 3000;

function defaultBaseUrl(): string {
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? `http://${host}:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl();
