import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colores } from "../lib/tokens";
import { navbarBottomPadding } from "./ui/BottomNavbar";

const SHADOW = {
  shadowColor: "#1a1614",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.2,
  shadowRadius: 12,
  elevation: 6,
};

/**
 * Botón flotante de "Publicar viaje" para el portal de conductor; flota sobre
 * la barra de tabs, encima de la píldora inferior.
 */
export function PublishFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Publicar viaje"
      onPress={() => router.push("/publicar")}
      style={[SHADOW, { bottom: 72 + navbarBottomPadding(insets.bottom) }]}
      className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-primary active:bg-primary-dark"
    >
      <Plus size={26} color={colores.primaryInk} />
    </Pressable>
  );
}
