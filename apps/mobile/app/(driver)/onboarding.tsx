import { useRef, useState } from "react";
import { Pressable, ScrollView, View, type TextInput } from "react-native";
import { useRouter } from "expo-router";
import { TriangleAlert, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MAX_SEATS, MAX_VEHICLE_YEAR, MIN_VEHICLE_YEAR } from "@rideujap/shared";

import { Button, Card, Input, Stepper, Text } from "../../src/components/ui";
import { ApiError, createDriverProfile } from "../../src/lib/api";
import { maskDate, validateFutureDate, type FieldErrors } from "../../src/lib/form";
import { usePortal } from "../../src/lib/portal";
import { useDismiss } from "../../src/lib/useDismiss";
import { colores } from "../../src/lib/tokens";

type Field = "licenseNumber" | "licenseExpiry" | "make" | "model" | "year" | "color" | "plate";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function DriverOnboardingScreen() {
  const router = useRouter();
  const dismiss = useDismiss();
  const { setPortal, refreshDriverStatus } = usePortal();

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [seats, setSeats] = useState(4);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const expiryRef = useRef<TextInput>(null);
  const makeRef = useRef<TextInput>(null);
  const modelRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const colorRef = useRef<TextInput>(null);
  const plateRef = useRef<TextInput>(null);

  function update(field: Field, setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };
  }

  async function onSubmit() {
    const next: FieldErrors<Field> = {};
    if (!licenseNumber.trim()) next.licenseNumber = "Escribe tu número de licencia.";
    const expiry = validateFutureDate(licenseExpiry);
    if (!expiry.ok) next.licenseExpiry = expiry.error;
    if (!make.trim()) next.make = "Indica la marca.";
    if (!model.trim()) next.model = "Indica el modelo.";
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < MIN_VEHICLE_YEAR || yearNum > MAX_VEHICLE_YEAR) {
      next.year = "Indica un año válido.";
    }
    if (!color.trim()) next.color = "Indica el color.";
    if (!plate.trim()) next.plate = "Indica la placa.";

    setErrors(next);
    if (!expiry.ok || Object.keys(next).length > 0) {
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      await createDriverProfile({
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: expiry.iso,
        vehicle: {
          make: make.trim(),
          model: model.trim(),
          year: yearNum,
          color: color.trim(),
          plate: plate.trim(),
          seats,
        },
      });
      await refreshDriverStatus();
      setPortal("driver");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "No pudimos crear tu perfil de conductor.";
      setStatus({ kind: "error", message });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text variant="label" className="text-primary">
          Conviértete en conductor
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={() => (router.canDismiss() ? dismiss() : router.replace("/(passenger)"))}
          hitSlop={8}
        >
          <X size={22} color={colores.muted} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text variant="title" className="text-2xl">
            Tus datos de conductor
          </Text>
          <Text variant="muted">Los necesitamos una sola vez para publicar viajes.</Text>
        </View>

        <View className="gap-3">
          <Text variant="label">Licencia de conducir</Text>
          <Input
            label="Número de licencia"
            placeholder="V-12345678"
            value={licenseNumber}
            onChangeText={update("licenseNumber", setLicenseNumber)}
            error={errors.licenseNumber}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => expiryRef.current?.focus()}
          />
          <Input
            ref={expiryRef}
            label="Vencimiento"
            placeholder="DD/MM/AAAA"
            value={licenseExpiry}
            onChangeText={update("licenseExpiry", (text) => setLicenseExpiry(maskDate(text)))}
            error={errors.licenseExpiry}
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => makeRef.current?.focus()}
          />
        </View>

        <View className="gap-3">
          <Text variant="label">Vehículo</Text>
          <Input
            ref={makeRef}
            label="Marca"
            placeholder="Toyota"
            value={make}
            onChangeText={update("make", setMake)}
            error={errors.make}
            autoCapitalize="words"
            autoComplete="off"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => modelRef.current?.focus()}
          />
          <Input
            ref={modelRef}
            label="Modelo"
            placeholder="Corolla"
            value={model}
            onChangeText={update("model", setModel)}
            error={errors.model}
            autoCapitalize="words"
            autoComplete="off"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => yearRef.current?.focus()}
          />
          <Input
            ref={yearRef}
            label="Año"
            placeholder="2019"
            value={year}
            onChangeText={update("year", setYear)}
            error={errors.year}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => colorRef.current?.focus()}
          />
          <Input
            ref={colorRef}
            label="Color"
            placeholder="Blanco"
            value={color}
            onChangeText={update("color", setColor)}
            error={errors.color}
            autoComplete="off"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => plateRef.current?.focus()}
          />
          <Input
            ref={plateRef}
            label="Placa"
            placeholder="AB123CD"
            value={plate}
            onChangeText={update("plate", setPlate)}
            error={errors.plate}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            returnKeyType="done"
          />
          <View className="gap-2">
            <Text variant="label">Cupos del vehículo</Text>
            <Stepper value={seats} onChange={setSeats} min={1} max={MAX_SEATS} />
          </View>
        </View>

        {status.kind === "error" ? (
          <Card className="flex-row items-center gap-3">
            <TriangleAlert size={20} color={colores.muted} />
            <Text variant="muted" className="flex-1">
              {status.message}
            </Text>
          </Card>
        ) : null}

        <Button
          label="Guardar y continuar"
          fullWidth
          loading={status.kind === "loading"}
          onPress={onSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
