import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MyTripsList } from "../../src/components/MyTripsList";
import { Text } from "../../src/components/ui";

export default function ViajesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="gap-1.5 px-5 pb-2 pt-6">
        <Text variant="label" className="text-primary">
          Mis viajes
        </Text>
        <Text variant="display">Próximos</Text>
        <Text variant="muted">Los viajes que tienes por delante.</Text>
      </View>

      <MyTripsList bucket="upcoming" />
    </SafeAreaView>
  );
}
