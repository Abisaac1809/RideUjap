import { Pressable } from "react-native";
import { Repeat } from "lucide-react-native";

import { usePortal } from "../lib/portal";
import { Text } from "./ui";

/**
 * Píldora flotante para cambiar entre el portal de pasajero y el de
 * conductor. Solo aparece si el usuario tiene perfil de conductor.
 */
export function PortalToggle() {
  const { isDriver, portal, setPortal } = usePortal();

  if (!isDriver) return null;

  const next = portal === "driver" ? "passenger" : "driver";
  const label = portal === "driver" ? "Modo pasajero" : "Modo conductor";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => setPortal(next)}
      className="absolute right-4 top-4 z-10 flex-row items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 active:opacity-80"
    >
      <Repeat size={14} color="#ffffff" />
      <Text className="font-sora-semibold text-xs text-white">{label}</Text>
    </Pressable>
  );
}
