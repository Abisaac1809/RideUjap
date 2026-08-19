import { useState } from "react";
import { ScrollView, View } from "react-native";
import { GraduationCap, LogOut, Mail, Phone, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card, IconBadge, Text } from "../../src/components/ui";
import { signOut, useSession } from "../../src/lib/auth-client";
import { colores } from "../../src/lib/tokens";

export default function PerfilScreen() {
  const { data: session } = useSession();
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
            <GraduationCap size={14} color={colores.primary} />
            <Text className="font-sora-semibold text-xs text-primary">Comunidad UJAP</Text>
          </View>
        </View>

        {/* Datos de la cuenta. */}
        <View className="gap-2">
          <Text variant="label" className="px-1">
            Datos de la cuenta
          </Text>
          <Card elevated className="gap-5">
            <DatoPerfil
              icono={<User size={18} color={colores.primary} />}
              etiqueta="Nombre"
              valor={user?.name}
            />
            <DatoPerfil
              icono={<Mail size={18} color={colores.primary} />}
              etiqueta="Correo"
              valor={user?.email}
            />
            <DatoPerfil
              icono={<Phone size={18} color={colores.primary} />}
              etiqueta="Teléfono"
              valor={user?.phone}
            />
          </Card>
        </View>

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

function DatoPerfil({
  icono,
  etiqueta,
  valor,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  valor?: string | null;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <IconBadge tone="primary" size="md">
        {icono}
      </IconBadge>
      <View className="flex-1">
        <Text variant="label">{etiqueta}</Text>
        <Text>{valor ?? "—"}</Text>
      </View>
    </View>
  );
}
