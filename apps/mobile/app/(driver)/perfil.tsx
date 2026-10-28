import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Car, GraduationCap, LogOut, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MAX_SEATS,
  MAX_VEHICLE_YEAR,
  MIN_VEHICLE_YEAR,
  type DriverStatusResponse,
} from "@rideujap/shared";

import { AccountCard, DatoPerfil } from "../../src/components/AccountCard";
import { Avatar, Button, Card, Input, Stepper, Text } from "../../src/components/ui";
import { ApiError, updateDriverProfile } from "../../src/lib/api";
import { signOut, useSession } from "../../src/lib/auth-client";
import { usePortal } from "../../src/lib/portal";
import { colores } from "../../src/lib/tokens";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type EditStatus = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function DriverPerfilScreen() {
  const { data: session } = useSession();
  const { driverStatus, refreshDriverStatus } = usePortal();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;

  async function onSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-8 pt-6">
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

        <AccountCard />

        <VehicleSection driverStatus={driverStatus} onSaved={refreshDriverStatus} />

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

function VehicleSection({
  driverStatus,
  onSaved,
}: {
  driverStatus: DriverStatusResponse | null;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState(
    driverStatus?.driverProfile?.licenseNumber ?? "",
  );
  const [licenseExpiry, setLicenseExpiry] = useState(
    driverStatus?.driverProfile?.licenseExpiry ?? "",
  );
  const [make, setMake] = useState(driverStatus?.vehicle?.make ?? "");
  const [model, setModel] = useState(driverStatus?.vehicle?.model ?? "");
  const [year, setYear] = useState(String(driverStatus?.vehicle?.year ?? ""));
  const [color, setColor] = useState(driverStatus?.vehicle?.color ?? "");
  const [plate, setPlate] = useState(driverStatus?.vehicle?.plate ?? "");
  const [seats, setSeats] = useState(driverStatus?.vehicle?.seats ?? 4);
  const [status, setStatus] = useState<EditStatus>({ kind: "idle" });

  if (!driverStatus?.driverProfile || !driverStatus.vehicle) return null;
  const { driverProfile, vehicle } = driverStatus;

  function toggle() {
    setLicenseNumber(driverProfile.licenseNumber);
    setLicenseExpiry(driverProfile.licenseExpiry);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(String(vehicle.year));
    setColor(vehicle.color);
    setPlate(vehicle.plate);
    setSeats(vehicle.seats);
    setStatus({ kind: "idle" });
    setEditing((v) => !v);
  }

  async function onSave() {
    if (!licenseNumber.trim()) {
      setStatus({ kind: "error", message: "Escribe tu número de licencia." });
      return;
    }
    if (!DATE_RE.test(licenseExpiry.trim())) {
      setStatus({ kind: "error", message: "La fecha de vencimiento debe ser AAAA-MM-DD." });
      return;
    }
    if (!make.trim() || !model.trim() || !color.trim() || !plate.trim()) {
      setStatus({ kind: "error", message: "Completa todos los datos del vehículo." });
      return;
    }
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < MIN_VEHICLE_YEAR || yearNum > MAX_VEHICLE_YEAR) {
      setStatus({ kind: "error", message: "Indica un año de vehículo válido." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      await updateDriverProfile({
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
      await onSaved();
      setStatus({ kind: "idle" });
      setEditing(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No pudimos guardar los cambios.";
      setStatus({ kind: "error", message });
    }
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-1">
        <Text variant="label">Licencia y vehículo</Text>
        <Button
          size="sm"
          variant="ghost"
          label={editing ? "Cancelar" : "Editar"}
          disabled={status.kind === "loading"}
          onPress={toggle}
        />
      </View>

      <Card elevated className="gap-4">
        {editing ? (
          <>
            <Input
              label="Número de licencia"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
            <Input
              label="Vencimiento"
              value={licenseExpiry}
              onChangeText={setLicenseExpiry}
              helperText="Formato AAAA-MM-DD."
            />
            <Input label="Marca" value={make} onChangeText={setMake} />
            <Input label="Modelo" value={model} onChangeText={setModel} />
            <Input
              label="Año"
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Input label="Color" value={color} onChangeText={setColor} />
            <Input
              label="Placa"
              value={plate}
              onChangeText={setPlate}
              autoCapitalize="characters"
            />
            <View className="gap-2">
              <Text variant="label">Cupos del vehículo</Text>
              <Stepper value={seats} onChange={setSeats} min={1} max={MAX_SEATS} />
            </View>
            {status.kind === "error" ? (
              <Text className="text-xs text-red-500">{status.message}</Text>
            ) : null}
            <Button
              label="Guardar cambios"
              fullWidth
              loading={status.kind === "loading"}
              onPress={onSave}
            />
          </>
        ) : (
          <>
            <DatoPerfil
              icono={<User size={18} color={colores.primary} />}
              etiqueta="Licencia"
              valor={driverProfile.licenseNumber}
            />
            <DatoPerfil
              icono={<Car size={18} color={colores.primary} />}
              etiqueta="Vehículo"
              valor={`${vehicle.make} ${vehicle.model} · ${vehicle.plate}`}
            />
          </>
        )}
      </Card>
    </View>
  );
}
