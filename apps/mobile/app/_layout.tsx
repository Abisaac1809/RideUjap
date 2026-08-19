import "../global.css";

import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useSession } from "../src/lib/auth-client";
import { colores } from "../src/lib/tokens";

export default function RootLayout() {
  const { data: session, isPending } = useSession();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isPending ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator color={colores.primary} />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      )}
    </SafeAreaProvider>
  );
}
