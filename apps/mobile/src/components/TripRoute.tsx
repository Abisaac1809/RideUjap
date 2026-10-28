import { View } from "react-native";
import type { Trip } from "@rideujap/shared";

import { formatWhen } from "../lib/format";
import { describeTrip, type TripViewer } from "../lib/trip-view";
import { Text } from "./ui";

export interface TripRouteProps {
  trip: Trip;
  viewer: TripViewer;
}

export function TripRoute({ trip, viewer }: TripRouteProps) {
  const { start, end } = describeTrip(trip, viewer);

  return (
    <View>
      <View className="flex-row gap-3">
        <View className="items-center pt-1.5">
          <View className="h-2.5 w-2.5 rounded-full bg-primary" />
          <View className="mt-1 w-px flex-1 bg-line" />
        </View>
        <View className="flex-1 pb-2">
          <Text variant="subtitle" numberOfLines={1}>
            {start}
          </Text>
          <Text variant="muted">{formatWhen(trip.departureTime)}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="h-2.5 w-2.5 rounded-full border-2 border-primary" />
        <Text className="flex-1" numberOfLines={1}>
          {end}
        </Text>
      </View>
    </View>
  );
}
