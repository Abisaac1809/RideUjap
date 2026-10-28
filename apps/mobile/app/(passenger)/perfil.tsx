import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Car, GraduationCap, LogOut } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountCard } from "../../src/components/AccountCard";
import { Avatar, Button, Text } from "../../src/components/ui";
import { signOut, useSession } from "../../src/lib/auth-client";
import { usePortal, usePortalColors } from "../../src/lib/portal";
import { colores } from "../../src/lib/tokens";

export default function PerfilScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDriver, setPortal } = usePortal();
  const palette = usePortalColors();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;

  async function onSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-8 pt-6">
        {/* Cabecera: avatar centrado, nombre y badge de comunidad. */}
        <View className="items-center gap-3">
          <Avatar uri={user?.image} name={user?.name} size={96} />
          <View className="items-center gap-1">
            <Text variant="title">{user?.name ?? "Perfil"}</Text>
            <Text variant="muted">{user?.email}</Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1">
            <GraduationCap size={14} color={palette.primary} />
            <Text className="font-sora-semibold text-xs text-primary">Comunidad UJAP</Text>
          </View>
        </View>

        <AccountCard />

        {isDriver ? (
          <Button
            label="Cambiar a modo conductor"
            variant="outline"
            fullWidth
            leftIcon={<Car size={18} color={colores.ink} />}
            onPress={() => setPortal("driver")}
          />
        ) : (
          <Button
            label="Conviértete en conductor"
            variant="outline"
            fullWidth
            leftIcon={<Car size={18} color={colores.ink} />}
            onPress={() => router.push("/(driver)/onboarding")}
          />
        )}

        <Button
          label="Cerrar sesión"
          variant="outline"
          fullWidth
          loading={signingOut}
          leftIcon={<LogOut size={18} color={colores.ink} />}
          onPress={onSignOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
