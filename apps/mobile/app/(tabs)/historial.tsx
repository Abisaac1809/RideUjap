import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MyTripsList } from "../../src/components/MyTripsList";
import { Text } from "../../src/components/ui";

export default function HistorialScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="gap-1.5 px-5 pb-2 pt-6">
        <Text variant="label" className="text-primary">
          Mis viajes
        </Text>
        <Text variant="display">Historial</Text>
        <Text variant="muted">Tus viajes completados y cancelados.</Text>
      </View>

      <MyTripsList bucket="history" />
    </SafeAreaView>
  );
}
