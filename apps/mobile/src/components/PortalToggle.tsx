import { View } from "react-native";
import { Backpack, Car } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePortal } from "../lib/portal";
import { colores, portalPalettes } from "../lib/tokens";
import { PressableScale, Text } from "./ui";

const SHADOW = {
  shadowColor: colores.ink,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 4,
};

/**
 * Botón flotante para cambiar al otro portal. El círculo lleva el color e
 * ícono del portal destino: es el mismo color que luego cubre la pantalla en
 * la transición. Solo aparece si el usuario tiene perfil de conductor.
 */
export function PortalToggle() {
  const { isDriver, portal, switching, setPortal } = usePortal();
  const insets = useSafeAreaInsets();

  if (!isDriver) return null;

  const target = portal === "driver" ? "passenger" : "driver";
  const label = target === "driver" ? "Conductor" : "Pasajero";
  const Icon = target === "driver" ? Car : Backpack;

  return (
    <View style={[SHADOW, { top: insets.top + 8 }]} className="absolute right-4 z-10 rounded-full">
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Cambiar a modo ${label.toLowerCase()}`}
        onPress={() => setPortal(target)}
        disabled={switching !== null}
        scaleTo={0.94}
        className="flex-row items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3.5"
      >
        <View
          style={{ backgroundColor: portalPalettes[target].primary }}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Icon size={16} color={colores.primaryInk} />
        </View>
        <View>
          <Text className="text-[10px] leading-3 text-muted">Cambiar a</Text>
          <Text className="font-sora-semibold text-[13px] leading-4 text-ink">{label}</Text>
        </View>
      </PressableScale>
    </View>
  );
}
