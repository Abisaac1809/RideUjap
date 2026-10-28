import { useRef, useState } from "react";
import { ScrollView, View, type TextInput } from "react-native";
import { Link } from "expo-router";
import { Mail, Phone, TriangleAlert, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "../../src/components/Logo";
import { Button, Card, Input, PasswordInput, Text } from "../../src/components/ui";
import { signUp } from "../../src/lib/auth-client";
import { isValidEmail, normalizeVePhone, type FieldErrors } from "../../src/lib/form";
import { colores } from "../../src/lib/tokens";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

type Field = "name" | "email" | "phone" | "password" | "confirmPassword";

const MIN_PASSWORD = 8;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  function update(field: Field, setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };
  }

  function validate(): FieldErrors<Field> {
    const next: FieldErrors<Field> = {};
    if (!name.trim()) next.name = "Ingresa tu nombre.";
    if (!email.trim()) next.email = "Ingresa tu correo.";
    else if (!isValidEmail(email)) next.email = "Revisa el formato del correo.";
    if (!phone.trim()) next.phone = "Ingresa tu teléfono.";
    else if (!normalizeVePhone(phone)) next.phone = "Usa un número válido, ej. 0412 1234567.";
    if (password.length < MIN_PASSWORD)
      next.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    if (password !== confirmPassword) next.confirmPassword = "Las contraseñas no coinciden.";
    return next;
  }

  async function onSubmit() {
    const next = validate();
    setErrors(next);
    const normalizedPhone = normalizeVePhone(phone);
    if (Object.keys(next).length > 0 || !normalizedPhone) {
      setState({ kind: "idle" });
      return;
    }

    setState({ kind: "loading" });
    const { error } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      phone: normalizedPhone,
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
          <Logo height={26} />
          <Text variant="display">Crea tu cuenta</Text>
          <Text variant="muted">Únete a la comunidad y comparte el viaje.</Text>
        </View>

        <View className="gap-3">
          <Input
            label="Nombre"
            placeholder="Tu nombre y apellido"
            value={name}
            onChangeText={update("name", setName)}
            error={errors.name}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
            leftIcon={<User size={18} color={colores.muted} />}
          />
          <Input
            ref={emailRef}
            label="Correo"
            placeholder="tucorreo@ujap.edu.ve"
            value={email}
            onChangeText={update("email", setEmail)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => phoneRef.current?.focus()}
            leftIcon={<Mail size={18} color={colores.muted} />}
          />
          <Input
            ref={phoneRef}
            label="Teléfono"
            placeholder="0412 1234567"
            value={phone}
            onChangeText={update("phone", setPhone)}
            error={errors.phone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            leftIcon={<Phone size={18} color={colores.muted} />}
          />
          <PasswordInput
            ref={passwordRef}
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={update("password", setPassword)}
            error={errors.password}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <PasswordInput
            ref={confirmRef}
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={update("confirmPassword", setConfirmPassword)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            textContentType="newPassword"
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
