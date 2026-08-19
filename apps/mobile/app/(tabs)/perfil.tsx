import { useState } from "react";
import { ScrollView, View } from "react-native";
import { LogOut, Mail, Phone, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Text } from "../../src/components/ui";
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="gap-1">
          <Text variant="title" className="text-3xl">
            {user?.name ?? "Perfil"}
          </Text>
          <Text variant="muted">Tus datos como miembro de la comunidad UJAP.</Text>
        </View>

        <Card className="gap-4">
          <DatoPerfil
            icono={<User size={18} color={colores.muted} />}
            etiqueta="Nombre"
            valor={user?.name}
          />
          <DatoPerfil
            icono={<Mail size={18} color={colores.muted} />}
            etiqueta="Correo"
            valor={user?.email}
          />
          <DatoPerfil
            icono={<Phone size={18} color={colores.muted} />}
            etiqueta="Teléfono"
            valor={user?.phone}
          />
        </Card>

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
      {icono}
      <View className="flex-1">
        <Text variant="label">{etiqueta}</Text>
        <Text>{valor ?? "—"}</Text>
      </View>
    </View>
  );
}
