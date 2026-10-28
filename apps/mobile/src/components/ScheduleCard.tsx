import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { TIME_PATTERN, type ScheduleDay } from "@rideujap/shared";

import { ApiError, getSchedule, saveSchedule } from "../lib/api";
import { Button, Card, Input, Text, Toggle } from "./ui";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const TIME_RE = new RegExp(TIME_PATTERN);

type Draft = { enabled: boolean; startTime: string; endTime: string };

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

function toDrafts(schedule: ScheduleDay[]): Draft[] {
  return DAYS.map((_, index) => {
    const day = schedule.find((d) => d.weekday === index + 1);
    return {
      enabled: day !== undefined,
      startTime: day?.startTime ?? "07:00",
      endTime: day?.endTime ?? "12:00",
    };
  });
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function ScheduleCard() {
  const [schedule, setSchedule] = useState<ScheduleDay[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setSchedule(await getSchedule());
    } catch (error) {
      setLoadError(errorMessage(error, "No pudimos cargar tu horario."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleEdit() {
    setStatus({ kind: "idle" });
    setDrafts(drafts ? null : toDrafts(schedule ?? []));
  }

  function update(index: number, patch: Partial<Draft>) {
    setDrafts(
      (current) => current && current.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  }

  async function onSave() {
    if (!drafts) return;

    const days = drafts.flatMap((draft, index) =>
      draft.enabled
        ? [{ weekday: index + 1, startTime: draft.startTime.trim(), endTime: draft.endTime.trim() }]
        : [],
    );

    const badFormat = days.find((d) => !TIME_RE.test(d.startTime) || !TIME_RE.test(d.endTime));
    if (badFormat) {
      return setStatus({
        kind: "error",
        message: `${DAYS[badFormat.weekday - 1]}: escribe las horas en formato 24h, ej. 07:30.`,
      });
    }

    const badRange = days.find((d) => d.startTime >= d.endTime);
    if (badRange) {
      return setStatus({
        kind: "error",
        message: `${DAYS[badRange.weekday - 1]}: la entrada debe ser antes de la salida.`,
      });
    }

    setStatus({ kind: "saving" });
    try {
      setSchedule(await saveSchedule(days));
      setDrafts(null);
      setStatus({ kind: "idle" });
    } catch (error) {
      setStatus({ kind: "error", message: errorMessage(error, "No pudimos guardar tu horario.") });
    }
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-1">
        <Text variant="label">Mi horario</Text>
        {schedule ? (
          <Button
            size="sm"
            variant="ghost"
            label={drafts ? "Cancelar" : "Editar"}
            disabled={status.kind === "saving"}
            onPress={toggleEdit}
          />
        ) : null}
      </View>

      <Card elevated className="gap-4">
        {loadError ? (
          <>
            <Text variant="muted">{loadError}</Text>
            <Button label="Reintentar" variant="outline" onPress={load} />
          </>
        ) : !schedule ? (
          <Text variant="muted">Cargando tu horario…</Text>
        ) : drafts ? (
          <>
            {drafts.map((draft, index) => (
              <View key={DAYS[index]} className="gap-2">
                <Toggle
                  label={DAYS[index]}
                  value={draft.enabled}
                  onValueChange={(enabled) => update(index, { enabled })}
                />
                {draft.enabled ? (
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Input
                        label="Entrada"
                        value={draft.startTime}
                        onChangeText={(startTime) => update(index, { startTime })}
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>
                    <View className="flex-1">
                      <Input
                        label="Salida"
                        value={draft.endTime}
                        onChangeText={(endTime) => update(index, { endTime })}
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            ))}
            {status.kind === "error" ? (
              <Text className="text-xs text-red-500">{status.message}</Text>
            ) : null}
            <Button
              label="Guardar horario"
              fullWidth
              loading={status.kind === "saving"}
              onPress={onSave}
            />
          </>
        ) : schedule.length === 0 ? (
          <Text variant="muted">Aún no registras tu horario.</Text>
        ) : (
          schedule.map((day) => (
            <View key={day.weekday} className="flex-row items-center justify-between">
              <Text>{DAYS[day.weekday - 1]}</Text>
              <Text variant="muted">
                {day.startTime} – {day.endTime}
              </Text>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}
