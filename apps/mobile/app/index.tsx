import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Search } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPlaceholder } from "../src/components/MapPlaceholder";
import { Button, Input, Text } from "../src/components/ui";
import { colores } from "../src/lib/tokens";

/**
 * Pantalla de inicio: réplica en React Native del diseño validado en el
 * template Vue (encabezado, búsqueda de destino y navegación inferior).
 */
export default function InicioScreen() {
  const [destino, setDestino] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text variant="label" className="uppercase tracking-widest text-primary">
            RideUJAP
          </Text>
          <Text variant="title" className="text-3xl">
            ¿A dónde vas hoy?
          </Text>
          <Text variant="muted">Comparte el viaje con tu comunidad universitaria</Text>
        </View>

        <View className="gap-3">
          <Input
            label="Destino"
            placeholder="Ej. San Diego, Naguanagua…"
            value={destino}
            onChangeText={setDestino}
            autoCorrect={false}
            returnKeyType="search"
            leftIcon={<Search size={18} color={colores.muted} />}
          />
          <Button label="Buscar viaje" fullWidth />
        </View>

        <MapPlaceholder />
      </ScrollView>
    </SafeAreaView>
  );
}
