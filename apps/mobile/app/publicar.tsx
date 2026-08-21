import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Coins, TriangleAlert, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AdmissionMode, PlaceDetails, TripDirection } from "@rideujap/shared";

import { DIRECTION_COPY, RouteHint } from "../src/components/RouteHint";
import { PlacePicker } from "../src/components/PlacePicker";
import { Button, Card, Input, Segmented, Stepper, Text } from "../src/components/ui";
import { ApiError, createTrip, estimateFare } from "../src/lib/api";
import { useDismiss } from "../src/lib/useDismiss";
import { formatFare } from "../src/lib/format";
import { colores } from "../src/lib/tokens";

const ADMISSION_COPY: Record<AdmissionMode, string> = {
  request: "Revisas cada solicitud antes de aceptar a bordo.",
  auto: "Los pasajeros con cupo se unen al instante.",
};

interface Day {
  date: Date;
  label: string;
}

function buildDays(): Day[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const label =
      i === 0
        ? "Hoy"
        : i === 1
          ? "Mañana"
          : date.toLocaleDateString("es-VE", { weekday: "short", day: "2-digit" });

    return { date, label };
  });
}

function parseTime(value: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function PublicarScreen() {
  const router = useRouter();
  const dismiss = useDismiss();
  const [days] = useState(buildDays);

  const [direction, setDirection] = useState<TripDirection>("inbound");
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState("07:00");
  const [seats, setSeats] = useState(3);
  const [admission, setAdmission] = useState<AdmissionMode>("request");
  const [fare, setFare] = useState("");
  const [suggested, setSuggested] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (!place) {
      setSuggested(null);
      return;
    }

    let active = true;
    estimateFare({ lat: place.lat, lng: place.lng, seats })
      .then((value) => {
        if (!active) return;
        setSuggested(value);
        setFare((current) => (current.trim() ? current : String(value)));
      })
      .catch(() => active && setSuggested(null));

    return () => {
      active = false;
    };
  }, [place, seats]);

  function departureFromForm(): Date | null {
    const parsed = parseTime(time);
    if (!parsed) return null;
    const date = new Date(days[dayIndex]!.date);
    date.setHours(parsed.h, parsed.m, 0, 0);
    return date;
  }

  async function onSubmit() {
    if (!place) {
      setStatus({ kind: "error", message: "Selecciona el lugar de encuentro." });
      return;
    }

    const departure = departureFromForm();
    if (!departure) {
      setStatus({ kind: "error", message: "Escribe la hora en formato 24h, ej. 07:30." });
      return;
    }
    if (departure.getTime() <= Date.now()) {
      setStatus({ kind: "error", message: "La hora de salida debe ser futura." });
      return;
    }

    const fareNum = Number(fare.replace(",", "."));
    if (!fare.trim() || Number.isNaN(fareNum) || fareNum < 0) {
      setStatus({ kind: "error", message: "Indica un aporte válido (0 o más)." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      await createTrip({
        direction,
        pointLat: place.lat,
        pointLng: place.lng,
        pointText: place.text,
        departureTime: departure.toISOString(),
        totalSeats: seats,
        admissionMode: admission,
        fare: fareNum,
      });
      router.replace("/viajes");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No pudimos publicar el viaje.";
      setStatus({ kind: "error", message });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text variant="label" className="text-primary">
          Publicar viaje
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={dismiss}
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
            Ofrece tus cupos
          </Text>
          <Text variant="muted">Comparte tu ruta con la comunidad y divide los gastos.</Text>
        </View>

        <View className="gap-3">
          <Segmented
            value={direction}
            onChange={setDirection}
            options={[
              { value: "inbound", label: "Ida" },
              { value: "outbound", label: "Vuelta" },
            ]}
          />
          <RouteHint direction={direction} place={place?.text ?? ""} />
        </View>

        <PlacePicker
          label={DIRECTION_COPY[direction].inputLabel}
          value={place}
          onChange={setPlace}
        />

        <View className="gap-2">
          <Text variant="label">¿Cuándo sales?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-2"
          >
            {days.map((day, index) => {
              const active = index === dayIndex;
              return (
                <Pressable
                  key={day.date.toISOString()}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setDayIndex(index)}
                  className={
                    active
                      ? "rounded-control bg-primary px-4 py-2"
                      : "rounded-control border border-line bg-surface px-4 py-2"
                  }
                >
                  <Text className={active ? "font-sora-semibold text-primary-ink" : "text-ink"}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Input
            label="Hora de salida"
            placeholder="07:30"
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            helperText="Formato 24h."
          />
        </View>

        <View className="gap-2">
          <Text variant="label">Cupos disponibles</Text>
          <Stepper value={seats} onChange={setSeats} min={1} max={8} />
        </View>

        <View className="gap-2">
          <Text variant="label">¿Cómo aceptas pasajeros?</Text>
          <Segmented
            value={admission}
            onChange={setAdmission}
            options={[
              { value: "request", label: "Con aprobación" },
              { value: "auto", label: "Automática" },
            ]}
          />
          <Text variant="muted" className="text-xs">
            {ADMISSION_COPY[admission]}
          </Text>
        </View>

        <View className="gap-2">
          <Text variant="label">Aporte por pasajero</Text>
          <Input
            placeholder="0,00"
            value={fare}
            onChangeText={setFare}
            keyboardType="decimal-pad"
            leftIcon={<Coins size={18} color={colores.muted} />}
          />
          {suggested !== null ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setFare(String(suggested))}
              className="flex-row items-center justify-between rounded-control bg-primary/10 px-3 py-2"
            >
              <Text className="text-primary">Sugerido: {formatFare(suggested)}</Text>
              <Text className="font-sora-semibold text-primary">Usar</Text>
            </Pressable>
          ) : null}
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
          label="Publicar viaje"
          fullWidth
          loading={status.kind === "loading"}
          onPress={onSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
