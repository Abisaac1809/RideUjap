import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import { Lock, Mail, Phone, TriangleAlert, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input, Text } from "../../src/components/ui";
import { signUp } from "../../src/lib/auth-client";
import { colores } from "../../src/lib/tokens";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

const MIN_PASSWORD = 8;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  function validate(): string | null {
    if (!name.trim()) return "Ingresa tu nombre.";
    if (!email.trim()) return "Ingresa tu correo.";
    if (!phone.trim()) return "Ingresa tu teléfono.";
    if (password.length < MIN_PASSWORD)
      return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    return null;
  }

  async function onSubmit() {
    const message = validate();
    if (message) {
      setState({ kind: "error", message });
      return;
    }

    setState({ kind: "loading" });
    const { error } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });

    if (error) {
      setState({
        kind: "error",
        message: error.message ?? "No pudimos crear tu cuenta. Intenta de nuevo.",
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1.5">
          <Text variant="label" className="text-primary">
            RideUJAP
          </Text>
          <Text variant="display">Crea tu cuenta</Text>
          <Text variant="muted">Únete a la comunidad y comparte el viaje.</Text>
        </View>

        <View className="gap-3">
          <Input
            label="Nombre"
            placeholder="Tu nombre y apellido"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            leftIcon={<User size={18} color={colores.muted} />}
          />
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
            label="Teléfono"
            placeholder="0412 1234567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colores.muted} />}
          />
          <Input
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
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
            label="Crear cuenta"
            fullWidth
            loading={state.kind === "loading"}
            onPress={onSubmit}
          />
        </View>

        <View className="flex-row justify-center gap-1">
          <Text variant="muted">¿Ya tienes cuenta?</Text>
          <Link href="/login" replace>
            <Text className="font-sora-semibold text-primary">Inicia sesión</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
