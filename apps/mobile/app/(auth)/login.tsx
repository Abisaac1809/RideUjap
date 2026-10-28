import { useRef, useState } from "react";
import { ScrollView, View, type TextInput } from "react-native";
import { Link } from "expo-router";
import { Mail, TriangleAlert } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "../../src/components/Logo";
import { Button, Card, Input, PasswordInput, Text } from "../../src/components/ui";
import { signIn } from "../../src/lib/auth-client";
import { isValidEmail, type FieldErrors } from "../../src/lib/form";
import { colores } from "../../src/lib/tokens";

type Field = "email" | "password";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const passwordRef = useRef<TextInput>(null);

  async function onSubmit() {
    const next: FieldErrors<Field> = {};
    if (!email.trim()) next.email = "Ingresa tu correo.";
    else if (!isValidEmail(email)) next.email = "Revisa el formato del correo.";
    if (!password) next.password = "Ingresa tu contraseña.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setState({ kind: "idle" });
      return;
    }

    setState({ kind: "loading" });
    const { error } = await signIn.email({ email: email.trim(), password });

    if (error) {
      setState({ kind: "error", message: "Correo o contraseña incorrectos." });
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
          <Logo height={26} />
          <Text variant="display">Bienvenido de vuelta</Text>
          <Text variant="muted">Inicia sesión para compartir viajes con tu comunidad.</Text>
        </View>

        <View className="gap-3">
          <Input
            label="Correo"
            placeholder="tucorreo@ujap.edu.ve"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            leftIcon={<Mail size={18} color={colores.muted} />}
          />
          <PasswordInput
            ref={passwordRef}
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
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
            <Text className="font-sora-semibold text-primary">Regístrate</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
