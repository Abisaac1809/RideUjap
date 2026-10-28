import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { Mail, Phone, User } from "lucide-react-native";
import { PHONE_PATTERN } from "@rideujap/shared";

import { ApiError, updateMe } from "../lib/api";
import { useSession } from "../lib/auth-client";
import { usePortalColors } from "../lib/portal";
import { Button, Card, IconBadge, Input, Text } from "./ui";

const PHONE_RE = new RegExp(PHONE_PATTERN);

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export function DatoPerfil({
  icono,
  etiqueta,
  valor,
}: {
  icono: ReactNode;
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

export function AccountCard() {
  const { data: session, refetch } = useSession();
  const palette = usePortalColors();
  const user = session?.user;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function toggle() {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setStatus({ kind: "idle" });
    setEditing((v) => !v);
  }

  async function onSave() {
    const body = { name: name.trim(), phone: phone.trim() };
    if (!body.name) return setStatus({ kind: "error", message: "Escribe tu nombre." });
    if (!PHONE_RE.test(body.phone)) {
      return setStatus({ kind: "error", message: "Escribe un teléfono válido, ej. 0412 1234567." });
    }
    if (body.name === user?.name && body.phone === user?.phone) return setEditing(false);

    setStatus({ kind: "loading" });
    try {
      await updateMe(body);
      await refetch();
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
        <Text variant="label">Datos de la cuenta</Text>
        <Button
          size="sm"
          variant="ghost"
          label={editing ? "Cancelar" : "Editar"}
          disabled={status.kind === "loading"}
          onPress={toggle}
        />
      </View>

      <Card elevated className="gap-5">
        {editing ? (
          <>
            <Input
              label="Nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              maxLength={255}
            />
            <Input
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={32}
            />
            <DatoPerfil
              icono={<Mail size={18} color={palette.primary} />}
              etiqueta="Correo"
              valor={user?.email}
            />
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
              icono={<User size={18} color={palette.primary} />}
              etiqueta="Nombre"
              valor={user?.name}
            />
            <DatoPerfil
              icono={<Mail size={18} color={palette.primary} />}
              etiqueta="Correo"
              valor={user?.email}
            />
            <DatoPerfil
              icono={<Phone size={18} color={palette.primary} />}
              etiqueta="Teléfono"
              valor={user?.phone}
            />
          </>
        )}
      </Card>
    </View>
  );
}
