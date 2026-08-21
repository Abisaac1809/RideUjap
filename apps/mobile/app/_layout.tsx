import "../global.css";

import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useSession } from "../src/lib/auth-client";
import { colores } from "../src/lib/tokens";

// Mantener el splash hasta que las fuentes carguen, para evitar el "flash" de
// texto con la tipografía del sistema antes de que entre Sora.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { data: session, isPending } = useSession();
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && !isPending) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isPending]);

  if (!fontsLoaded) return null;

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
            <Stack.Screen name="publicar" options={{ presentation: "modal" }} />
            <Stack.Screen name="viaje" options={{ presentation: "modal" }} />
          </Stack.Protected>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      )}
    </SafeAreaProvider>
  );
}
