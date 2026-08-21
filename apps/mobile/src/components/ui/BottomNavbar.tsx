import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated";

import { cn } from "../../lib/cn";
import { Text } from "./Text";

export interface NavItem {
  key: string;
  label: string;
  /** Ícono; recibe si el item está activo para adaptar el color. */
  icon: (active: boolean) => ReactNode;
}

export interface BottomNavbarProps {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

// Spring del "crecimiento" del item activo; el delay hace que la píldora nueva
// termine de aparecer justo después de que la anterior empieza a encogerse.
const GROW_SPRING = { damping: 14, stiffness: 220, mass: 0.6 };

/**
 * Barra inferior flotante tipo píldora oscura. El item seleccionado se resalta
 * con una píldora verde que crece con un spring; el label aparece con un fade
 * ligeramente retrasado para que la transición se sienta encadenada.
 */
export function BottomNavbar({ items, activeKey, onSelect }: BottomNavbarProps) {
  return (
    // Contenedor transparente que despega la barra del borde inferior y de los
    // lados; la barra en sí es una píldora oscura flotante y redondeada.
    <View className="bg-transparent px-4 pb-6 pt-2">
      <View
        accessibilityRole="tablist"
        className="flex-row items-center justify-around rounded-full bg-ink px-2 py-2.5"
      >
        {items.map((item) => (
          <NavButton
            key={item.key}
            item={item}
            active={item.key === activeKey}
            onPress={() => onSelect(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

function NavButton({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  // 0 = inactivo, 1 = activo. Anima la píldora activa: color, escala y padding
  // (más aire alto y ancho cuando está seleccionada).
  const t = useDerivedValue(() => withSpring(active ? 1 : 0, GROW_SPRING), [active]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.96 + t.value * 0.04 }],
    backgroundColor: `rgba(13,122,111,${t.value})`,
    paddingHorizontal: 8 + t.value * 6,
    paddingVertical: 7 + t.value * 3,
    borderRadius: 999,
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="items-center"
    >
      {/* Ícono arriba, texto abajo, ambos centrados en el mismo eje vertical. */}
      <Animated.View style={pillStyle} className="items-center justify-center gap-1">
        <View className="items-center">{item.icon(active)}</View>
        <Text
          className={cn("font-sora-medium text-[11px]", active ? "text-white" : "text-[#9a938d]")}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
