import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Coins, TriangleAlert, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MAX_SEATS,
  type AdmissionMode,
  type Money,
  type PlaceDetails,
  type TripDirection,
} from "@rideujap/shared";

import { DIRECTION_COPY, DIRECTION_OPTIONS, RouteHint } from "../src/components/RouteHint";
import { PlacePicker } from "../src/components/PlacePicker";
import { Button, Card, Input, Segmented, Stepper, Text } from "../src/components/ui";
import { ApiError, createTrip, estimateFare } from "../src/lib/api";
import { usePortal } from "../src/lib/portal";
import { useDismiss } from "../src/lib/useDismiss";
import { formatBs, formatFare } from "../src/lib/format";
import { maskTime, nextFullHour, parseTime, type FieldErrors } from "../src/lib/form";
import { notify } from "../src/lib/notify";
import { colores } from "../src/lib/tokens";

const ADMISSION_COPY: Record<AdmissionMode, string> = {
  request: "Revisas cada solicitud antes de aceptar a bordo.",
  auto: "Los pasajeros con cupo se unen al instante.",
};

function parseFare(text: string): number | null {
  const value = Number(text.replace(",", "."));
  return text.trim() && !Number.isNaN(value) && value >= 0 ? value : null;
}

function impliedRate(fare: Money | null): number | null {
  if (!fare || fare.ves === null || fare.usd <= 0) return null;
  return fare.ves / fare.usd;
}

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

const QUICK_TIMES = ["06:00", "07:00", "08:00", "12:00", "15:00", "17:00"];

type Field = "place" | "time" | "fare";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function PublicarScreen() {
  const router = useRouter();
  const dismiss = useDismiss();
  const { isDriver, driverStatus } = usePortal();
  const [days] = useState(buildDays);
  const [initial] = useState(() => nextFullHour(new Date()));

  const maxSeats = driverStatus?.vehicle?.seats ?? MAX_SEATS;

  const [direction, setDirection] = useState<TripDirection>("inbound");
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [dayIndex, setDayIndex] = useState(initial.dayOffset);
  const [time, setTime] = useState(initial.time);
  const [seats, setSeats] = useState(() => Math.min(3, driverStatus?.vehicle?.seats ?? 3));
  const [admission, setAdmission] = useState<AdmissionMode>("request");
  const [fare, setFare] = useState("");
  const [suggested, setSuggested] = useState<Money | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  function clearError(field: Field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  const nowTime = new Date().toTimeString().slice(0, 5);
  const quickTimes = dayIndex === 0 ? QUICK_TIMES.filter((value) => value > nowTime) : QUICK_TIMES;

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
        setFare((current) => (current.trim() ? current : String(value.usd)));
      })
      .catch(() => active && setSuggested(null));

    return () => {
      active = false;
    };
  }, [place, seats]);

  const rate = impliedRate(suggested);
  const typedFare = parseFare(fare);
  const fareInBs = rate !== null && typedFare !== null ? typedFare * rate : null;

  function departureFromForm(): Date | null {
    const parsed = parseTime(time);
    if (!parsed) return null;
    const date = new Date(days[dayIndex]!.date);
    date.setHours(parsed.h, parsed.m, 0, 0);
    return date;
  }

  async function onSubmit() {
    const next: FieldErrors<Field> = {};
    if (!place) next.place = "Selecciona el lugar en la lista.";

    const departure = departureFromForm();
    if (!departure) next.time = "Escribe la hora en formato 24h, ej. 07:30.";
    else if (departure.getTime() <= Date.now()) next.time = "La hora de salida debe ser futura.";

    const fareNum = parseFare(fare);
    if (fareNum === null) {
      next.fare = "Indica un aporte válido (0 o más).";
    }

    setErrors(next);
    if (!place || !departure || fareNum === null || Object.keys(next).length > 0) {
      setStatus({ kind: "idle" });
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
      router.replace("/(driver)/viajes");
      notify("Viaje publicado", "Los pasajeros ya pueden encontrarlo y reservar un cupo.");
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

      {!isDriver ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <TriangleAlert size={32} color={colores.muted} />
          <Text variant="muted" className="text-center">
            Necesitas un perfil de conductor para publicar viajes.
          </Text>
          <Button
            label="Conviértete en conductor"
            onPress={() => router.replace("/(driver)/onboarding")}
          />
        </View>
      ) : (
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
            <Segmented value={direction} onChange={setDirection} options={DIRECTION_OPTIONS} />
            <RouteHint direction={direction} place={place?.text ?? ""} viewer="driver" />
          </View>

          <PlacePicker
            label={DIRECTION_COPY.driver[direction].inputLabel}
            value={place}
            onChange={(next) => {
              setPlace(next);
              clearError("place");
            }}
            error={errors.place}
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
                    onPress={() => {
                      setDayIndex(index);
                      clearError("time");
                    }}
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
            <Text variant="label">Hora de salida</Text>
            {quickTimes.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {quickTimes.map((value) => {
                  const active = value === time;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => {
                        setTime(value);
                        clearError("time");
                      }}
                      className={
                        active
                          ? "rounded-control bg-primary px-3 py-1.5"
                          : "rounded-control border border-line bg-surface px-3 py-1.5"
                      }
                    >
                      <Text className={active ? "font-sora-semibold text-primary-ink" : "text-ink"}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            <Input
              placeholder="07:30"
              value={time}
              onChangeText={(text) => {
                setTime(maskTime(text));
                clearError("time");
              }}
              keyboardType="number-pad"
              maxLength={5}
              error={errors.time}
              helperText="Formato 24h, ej. 07:30."
            />
          </View>

          <View className="gap-2">
            <Text variant="label">Cupos disponibles</Text>
            <Stepper value={seats} onChange={setSeats} min={1} max={maxSeats} />
            <Text variant="muted" className="text-xs">
              Tu vehículo tiene {maxSeats} {maxSeats === 1 ? "cupo" : "cupos"}.
            </Text>
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
            <Text variant="label">Aporte por pasajero (USD)</Text>
            <Input
              placeholder="0,00"
              value={fare}
              onChangeText={(text) => {
                setFare(text);
                clearError("fare");
              }}
              error={errors.fare}
              keyboardType="decimal-pad"
              leftIcon={<Coins size={18} color={colores.muted} />}
            />
            {fareInBs !== null ? (
              <Text variant="muted" className="text-xs">
                ≈ {formatBs(fareInBs)}
              </Text>
            ) : null}
            {suggested !== null ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setFare(String(suggested.usd));
                  clearError("fare");
                }}
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
      )}
    </SafeAreaView>
  );
}
