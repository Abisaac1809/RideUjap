import { MapPin } from "lucide-react-native";
import { View } from "react-native";

import { colores } from "../lib/tokens";
import { Text } from "./ui";

/**
 * Marcador visual del futuro mapa.
 *
 * La librería (react-native-maps / Expo Maps / Mapbox) se decide en la Fase 3;
 * hasta entonces este recuadro reserva el espacio en la pantalla y deja
 * explícito ante el cliente que es un placeholder, no un mapa roto.
 */
export function MapPlaceholder() {
  return (
    <View className="h-44 items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface">
      <MapPin size={28} color={colores.muted} />
      <Text variant="subtitle" className="text-muted">
        Mapa
      </Text>
      <Text variant="muted" className="text-xs">
        Librería por definir (Fase 3)
      </Text>
    </View>
  );
}
