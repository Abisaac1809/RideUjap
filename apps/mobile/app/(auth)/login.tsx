import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import { Lock, Mail, TriangleAlert } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input, Text } from "../../src/components/ui";
import { signIn } from "../../src/lib/auth-client";
import { colores } from "../../src/lib/tokens";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit() {
    if (!email.trim() || !password) {
      setState({ kind: "error", message: "Ingresa tu correo y contraseña." });
      return;
    }

    setState({ kind: "loading" });
    const { error } = await signIn.email({ email: email.trim(), password });

    if (error) {
      setState({ kind: "error", message: "Correo o contraseña incorrectos." });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text variant="label" className="uppercase tracking-widest text-primary">
            RideUJAP
          </Text>
          <Text variant="title" className="text-3xl">
            Bienvenido de vuelta
          </Text>
          <Text variant="muted">Inicia sesión para compartir viajes con tu comunidad.</Text>
        </View>

        <View className="gap-3">
          <Input
            label="Correo"
            placeholder="tucorreo@ujap.edu.ve"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Mail size={18} color={colores.muted} />}
          />
          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color={colores.muted} />}
          />

          {state.kind === "error" ? (
            <Card className="flex-row items-center gap-3">
              <TriangleAlert size={20} color={colores.muted} />
              <Text variant="muted" className="flex-1">
                {state.message}
              </Text>
            </Card>
          ) : null}

          <Button
            label="Iniciar sesión"
            fullWidth
            loading={state.kind === "loading"}
            onPress={onSubmit}
          />
        </View>

        <View className="flex-row justify-center gap-1">
          <Text variant="muted">¿No tienes cuenta?</Text>
          <Link href="/register" replace>
            <Text className="font-semibold text-primary">Regístrate</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
