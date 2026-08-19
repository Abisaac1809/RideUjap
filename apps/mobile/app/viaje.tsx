import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, CheckCircle2, Clock, MapPin, TriangleAlert, Users, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type {
  AdmissionMode,
  MyDriverTrip,
  MyPassengerTrip,
  ReservationResponse,
  ReservationStatus,
  Trip,
} from "@rideujap/shared";

import { ContactButton, StatusBadge } from "../src/components/StatusBadge";
import { Button, Card, Text } from "../src/components/ui";
import { ApiError, createReservation } from "../src/lib/api";
import { useSession } from "../src/lib/auth-client";
import { formatFare, formatWhen } from "../src/lib/format";
import { colores } from "../src/lib/tokens";

type DetailParam =
  | { mode: "reserve"; trip: Trip }
  | { mode: "passenger"; item: MyPassengerTrip }
  | { mode: "driver"; item: MyDriverTrip };

type ReserveState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; result: ReservationResponse };

const ADMISSION_COPY: Record<AdmissionMode, string> = {
  auto: "Te unes al instante al reservar.",
  request: "El conductor revisa tu solicitud antes de aceptarte.",
};

const PASSENGER_HINT: Partial<Record<ReservationStatus, string>> = {
  requested: "Te avisaremos cuando el conductor responda.",
  rejected: "El conductor no pudo aceptarte esta vez.",
};

function parseParam(data?: string): DetailParam | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as DetailParam;
  } catch {
    return null;
  }
}

export default function ViajeScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const { data: session } = useSession();
  const [reserve, setReserve] = useState<ReserveState>({ kind: "idle" });

  const parsed = parseParam(data);

  async function onReserve(trip: Trip) {
    setReserve({ kind: "loading" });
    try {
      const result = await createReservation(trip.id);
      setReserve({ kind: "done", result });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No pudimos completar la reserva.";
      setReserve({ kind: "error", message });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text variant="label" className="uppercase tracking-widest text-primary">
          Detalle del viaje
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <X size={22} color={colores.muted} />
        </Pressable>
      </View>

      {parsed === null ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <TriangleAlert size={32} color={colores.muted} />
          <Text variant="muted" className="text-center">
            No pudimos abrir este viaje.
          </Text>
          <Button label="Volver" variant="outline" onPress={() => router.back()} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-5 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <TripSummary trip={parsed.mode === "reserve" ? parsed.trip : parsed.item.trip} />

          {parsed.mode === "reserve" ? (
            <ReserveSection
              trip={parsed.trip}
              state={reserve}
              isOwnTrip={session?.user?.id === parsed.trip.driver.id}
              onReserve={() => onReserve(parsed.trip)}
              onGoToTrips={() => router.replace("/viajes")}
            />
          ) : parsed.mode === "passenger" ? (
            <PassengerSection item={parsed.item} />
          ) : (
            <DriverSection item={parsed.item} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TripSummary({ trip }: { trip: Trip }) {
  const [origin, destination] =
    trip.direction === "outbound" ? ["UJAP", trip.pointText] : [trip.pointText, "UJAP"];

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-2">
        <Text variant="subtitle" className="flex-1" numberOfLines={1}>
          {origin}
        </Text>
        <ArrowRight size={16} color={colores.muted} />
        <Text variant="subtitle" className="flex-1 text-right" numberOfLines={1}>
          {destination}
        </Text>
      </View>

      <View className="gap-2">
        <Row icon={<Clock size={16} color={colores.muted} />} text={formatWhen(trip.departureTime)} />
        <Row
          icon={<MapPin size={16} color={colores.muted} />}
          text={trip.direction === "outbound" ? `Destino: ${trip.pointText}` : `Punto de encuentro: ${trip.pointText}`}
        />
        <Row
          icon={<Users size={16} color={colores.muted} />}
          text={`${trip.availableSeats} de ${trip.totalSeats} cupos libres`}
        />
      </View>

      <View className="flex-row items-center justify-between border-t border-line pt-3">
        <Text variant="muted">Aporte por pasajero</Text>
        <Text className="text-lg font-semibold text-primary">
          {formatFare(trip.farePerPassenger)}
        </Text>
      </View>
    </Card>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text variant="muted" className="flex-1">
        {text}
      </Text>
    </View>
  );
}

function DriverInfo({ name }: { name: string }) {
  return (
    <View className="gap-0.5">
      <Text variant="label">Conductor</Text>
      <Text variant="subtitle">{name}</Text>
    </View>
  );
}

function ReserveSection({
  trip,
  state,
  isOwnTrip,
  onReserve,
  onGoToTrips,
}: {
  trip: Trip;
  state: ReserveState;
  isOwnTrip: boolean;
  onReserve: () => void;
  onGoToTrips: () => void;
}) {
  if (state.kind === "done") {
    const enrolled = state.result.status === "enrolled";
    return (
      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          <CheckCircle2 size={24} color={colores.primary} />
          <Text variant="subtitle" className="flex-1">
            {enrolled ? "¡Listo, vas en este viaje!" : "Solicitud enviada"}
          </Text>
        </View>
        <Text variant="muted">
          {enrolled
            ? "Coordina el punto de encuentro con el conductor por WhatsApp."
            : "El conductor revisará tu solicitud. Te avisaremos cuando responda."}
        </Text>
        {enrolled && state.result.contactPhone ? (
          <ContactButton phone={state.result.contactPhone} />
        ) : null}
        <Button label="Ir a Mis viajes" fullWidth onPress={onGoToTrips} />
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <DriverInfo name={trip.driver.name} />

      <View className="flex-row items-center gap-2 rounded-control bg-surface px-3 py-2">
        <TriangleAlert size={16} color={colores.muted} />
        <Text variant="muted" className="flex-1 text-xs">
          {ADMISSION_COPY[trip.admissionMode]}
        </Text>
      </View>

      {state.kind === "error" ? (
        <View className="flex-row items-center gap-2">
          <TriangleAlert size={16} color={colores.muted} />
          <Text variant="muted" className="flex-1">
            {state.message}
          </Text>
        </View>
      ) : null}

      {isOwnTrip ? (
        <Text variant="muted" className="text-center">
          Este es tu viaje.
        </Text>
      ) : (
        <Button
          label="Reservar cupo"
          fullWidth
          loading={state.kind === "loading"}
          onPress={onReserve}
        />
      )}
    </Card>
  );
}

function PassengerSection({ item }: { item: MyPassengerTrip }) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <DriverInfo name={item.trip.driver.name} />
        <StatusBadge status={item.reservation.status} />
      </View>

      {item.driverPhone ? (
        <ContactButton phone={item.driverPhone} />
      ) : (
        <Text variant="muted" className="text-xs">
          {PASSENGER_HINT[item.reservation.status] ?? "Aún no puedes contactar al conductor."}
        </Text>
      )}
    </Card>
  );
}

function DriverSection({ item }: { item: MyDriverTrip }) {
  return (
    <Card className="gap-4">
      <Text variant="label">Pasajeros</Text>

      {item.reservations.length === 0 ? (
        <Text variant="muted">Aún no hay reservas en este viaje.</Text>
      ) : (
        <View className="gap-3">
          {item.reservations.map((reservation, index) => (
            <View
              key={reservation.id}
              className={index > 0 ? "gap-2 border-t border-line pt-3" : "gap-2"}
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1" numberOfLines={1}>
                  {reservation.passenger.name}
                </Text>
                <StatusBadge status={reservation.status} />
              </View>
              {reservation.passenger.phone ? (
                <ContactButton phone={reservation.passenger.phone} />
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
