import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Clock, Users } from "lucide-react-native";
import type { MyTripItem, ReservationDecision, ReservationStatus } from "@rideujap/shared";

import { cn } from "../lib/cn";
import { formatFare, formatSeats, formatWhen } from "../lib/format";
import { colores } from "../lib/tokens";
import { ContactButton, StatusBadge } from "./StatusBadge";
import { Button, Card, Text } from "./ui";

export interface MyTripCardProps {
  item: MyTripItem;
  onDecide: (reservationId: string, status: ReservationDecision) => void;
  decidingId: string | null;
}

const PASSENGER_HINT: Partial<Record<ReservationStatus, string>> = {
  requested: "Te avisaremos cuando el conductor responda.",
  rejected: "El conductor no pudo aceptarte esta vez.",
};

export function MyTripCard({ item, onDecide, decidingId }: MyTripCardProps) {
  const router = useRouter();
  const { trip } = item;
  const [origin, destination] =
    trip.direction === "outbound" ? ["UJAP", trip.pointText] : [trip.pointText, "UJAP"];

  function openDetail() {
    router.push({
      pathname: "/viaje",
      params: { data: JSON.stringify({ mode: item.role, item }) },
    });
  }

  return (
    <Card className="gap-3">
      <Pressable accessibilityRole="button" onPress={openDetail} className="gap-3">
        <View className="flex-row items-center justify-between">
          <RoleBadge role={item.role} />
          {item.role === "passenger" ? <StatusBadge status={item.reservation.status} /> : null}
        </View>

        <View className="flex-row items-center gap-2">
          <Text variant="subtitle" className="flex-1" numberOfLines={1}>
            {origin}
          </Text>
          <ArrowRight size={16} color={colores.muted} />
          <Text variant="subtitle" className="flex-1 text-right" numberOfLines={1}>
            {destination}
          </Text>
        </View>

        <View className="gap-1">
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color={colores.muted} />
            <Text variant="muted">{formatWhen(trip.departureTime)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Users size={14} color={colores.muted} />
              <Text variant="muted">{formatSeats(trip.availableSeats)} libres</Text>
            </View>
            <Text className="font-semibold text-primary">{formatFare(trip.farePerPassenger)}</Text>
          </View>
        </View>
      </Pressable>

      <View className="h-px bg-line" />

      {item.role === "passenger" ? (
        <View className="gap-2">
          <Text variant="muted">Conductor: {trip.driver.name}</Text>
          {item.driverPhone ? (
            <ContactButton phone={item.driverPhone} />
          ) : (
            <Text variant="muted" className="text-xs">
              {PASSENGER_HINT[item.reservation.status] ?? ""}
            </Text>
          )}
        </View>
      ) : item.reservations.length === 0 ? (
        <Text variant="muted">Aún no hay reservas en este viaje.</Text>
      ) : (
        <View className="gap-3">
          {item.reservations.map((reservation, index) => (
            <View
              key={reservation.id}
              className={cn("gap-2", index > 0 && "border-t border-line pt-3")}
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1" numberOfLines={1}>
                  {reservation.passenger.name}
                </Text>
                <StatusBadge status={reservation.status} />
              </View>

              {reservation.status === "requested" ? (
                <View className="flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    label="Rechazar"
                    className="flex-1"
                    disabled={decidingId !== null}
                    loading={decidingId === reservation.id}
                    onPress={() => onDecide(reservation.id, "rejected")}
                  />
                  <Button
                    size="sm"
                    label="Aceptar"
                    className="flex-1"
                    disabled={decidingId !== null}
                    loading={decidingId === reservation.id}
                    onPress={() => onDecide(reservation.id, "accepted")}
                  />
                </View>
              ) : reservation.passenger.phone ? (
                <ContactButton phone={reservation.passenger.phone} />
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function RoleBadge({ role }: { role: MyTripItem["role"] }) {
  return (
    <View className="self-start rounded-full bg-surface px-2.5 py-0.5">
      <Text className="text-xs font-semibold text-ink">
        {role === "driver" ? "Conductor" : "Pasajero"}
      </Text>
    </View>
  );
}
