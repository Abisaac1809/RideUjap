import { Users } from "lucide-react-native";
import { View } from "react-native";
import type { Trip } from "@rideujap/shared";

import { formatFare, formatSeats } from "../lib/format";
import { colores } from "../lib/tokens";
import { TripRoute } from "./TripRoute";
import { Card, Text } from "./ui";

export interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Card className="gap-3">
      <TripRoute trip={trip} viewer="passenger" />

      <View className="flex-row items-center gap-1.5">
        <Users size={14} color={colores.muted} />
        <Text variant="muted">{formatSeats(trip.availableSeats)} libres</Text>
      </View>

      <View className="flex-row items-center justify-between border-t border-line pt-3">
        <Text
          className="rounded-full bg-primary-tint px-3 py-1 font-sora-bold text-sm text-primary"
          numberOfLines={1}
        >
          {formatFare(trip.farePerPassenger)}
        </Text>
        <Text variant="muted" numberOfLines={1}>
          {trip.driver.name}
        </Text>
      </View>
    </Card>
  );
}
