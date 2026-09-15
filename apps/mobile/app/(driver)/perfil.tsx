import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Car, GraduationCap, LogOut, Mail, Phone, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DriverStatusResponse } from "@rideujap/shared";

import { Avatar, Button, Card, IconBadge, Input, Stepper, Text } from "../../src/components/ui";
import { ApiError, updateDriverProfile } from "../../src/lib/api";
import { signOut, useSession } from "../../src/lib/auth-client";
import { usePortal } from "../../src/lib/portal";
import { colores } from "../../src/lib/tokens";

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

  async function onSave() {
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < 1980 || yearNum > 2100) {
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
          onPress={() => setEditing((v) => !v)}
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
              <Stepper value={seats} onChange={setSeats} min={1} max={8} />
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
              valor={driverStatus.driverProfile.licenseNumber}
            />
            <DatoPerfil
              icono={<Car size={18} color={colores.primary} />}
              etiqueta="Vehículo"
              valor={`${driverStatus.vehicle.make} ${driverStatus.vehicle.model} · ${driverStatus.vehicle.plate}`}
            />
          </>
        )}
      </Card>
    </View>
  );
}
