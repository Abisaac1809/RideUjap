import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { TriangleAlert, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input, Stepper, Text } from "../../src/components/ui";
import { ApiError, createDriverProfile } from "../../src/lib/api";
import { usePortal } from "../../src/lib/portal";
import { useDismiss } from "../../src/lib/useDismiss";
import { colores } from "../../src/lib/tokens";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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

  async function onSubmit() {
    if (!licenseNumber.trim()) {
      setStatus({ kind: "error", message: "Escribe tu número de licencia." });
      return;
    }
    if (!DATE_RE.test(licenseExpiry.trim())) {
      setStatus({ kind: "error", message: "La fecha de vencimiento debe ser AAAA-MM-DD." });
      return;
    }
    const yearNum = Number(year);
    if (!make.trim() || !model.trim() || !color.trim() || !plate.trim()) {
      setStatus({ kind: "error", message: "Completa todos los datos del vehículo." });
      return;
    }
    if (!Number.isInteger(yearNum) || yearNum < 1980 || yearNum > 2100) {
      setStatus({ kind: "error", message: "Indica un año de vehículo válido." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      await createDriverProfile({
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: licenseExpiry.trim(),
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
            onChangeText={setLicenseNumber}
            autoCapitalize="characters"
          />
          <Input
            label="Vencimiento"
            placeholder="AAAA-MM-DD"
            value={licenseExpiry}
            onChangeText={setLicenseExpiry}
            keyboardType="numbers-and-punctuation"
            helperText="Formato AAAA-MM-DD."
          />
        </View>

        <View className="gap-3">
          <Text variant="label">Vehículo</Text>
          <Input label="Marca" placeholder="Toyota" value={make} onChangeText={setMake} />
          <Input label="Modelo" placeholder="Corolla" value={model} onChangeText={setModel} />
          <Input
            label="Año"
            placeholder="2019"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Input label="Color" placeholder="Blanco" value={color} onChangeText={setColor} />
          <Input
            label="Placa"
            placeholder="AB123CD"
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
          />
          <View className="gap-2">
            <Text variant="label">Cupos del vehículo</Text>
            <Stepper value={seats} onChange={setSeats} min={1} max={8} />
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
          label="Guardar y publicar"
          fullWidth
          loading={status.kind === "loading"}
          onPress={onSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
