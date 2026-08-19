import { ArrowRight, Clock, Users } from "lucide-react-native";
import { View } from "react-native";
import type { Trip } from "@rideujap/shared";

import { formatFare, formatSeats, formatTime } from "../lib/format";
import { colores } from "../lib/tokens";
import { Card, Text } from "./ui";

export interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const [origin, destination] =
    trip.direction === "outbound" ? ["UJAP", trip.pointText] : [trip.pointText, "UJAP"];

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-2">
        <Text variant="subtitle" className="flex-1" numberOfLines={1}>
          {origin}
        </Text>
        <ArrowRight size={16} color={colores.muted} />
        <Text variant="subtitle" className="flex-1 text-right" numberOfLines={1}>
          {destination}
        </Text>
      </View>

      <View className="flex-row items-center gap-5">
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color={colores.muted} />
          <Text variant="muted">{formatTime(trip.departureTime)}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Users size={14} color={colores.muted} />
          <Text variant="muted">{formatSeats(trip.availableSeats)}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-primary">{formatFare(trip.farePerPassenger)}</Text>
        <Text variant="muted" numberOfLines={1}>
          {trip.driver.name}
        </Text>
      </View>
    </Card>
  );
}
