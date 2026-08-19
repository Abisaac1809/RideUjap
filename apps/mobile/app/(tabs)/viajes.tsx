import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MyTripsList } from "../../src/components/MyTripsList";
import { Text } from "../../src/components/ui";

export default function ViajesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="gap-1 px-5 pb-2 pt-4">
        <Text variant="label" className="uppercase tracking-widest text-primary">
          Mis viajes
        </Text>
        <Text variant="title" className="text-3xl">
          Próximos
        </Text>
        <Text variant="muted">Los viajes que tienes por delante.</Text>
      </View>

      <MyTripsList bucket="upcoming" />
    </SafeAreaView>
  );
}
