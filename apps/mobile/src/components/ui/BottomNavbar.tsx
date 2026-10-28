import { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  /** Color (hex) de la píldora del item activo. */
  activeColor: string;
  /** Anillo fino del color activo alrededor de la barra (portal conductor). */
  outlined?: boolean;
}

const GROW_SPRING = { damping: 14, stiffness: 220, mass: 0.6 };

/** Separación inferior de la barra: respeta el área segura con un mínimo. */
export function navbarBottomPadding(insetBottom: number): number {
  return Math.max(insetBottom + 8, 24);
}

/**
 * Barra inferior flotante tipo píldora oscura. El item seleccionado se resalta
 * con una píldora de color que aparece con escala y opacidad.
 */
export function BottomNavbar({
  items,
  activeKey,
  onSelect,
  activeColor,
  outlined = false,
}: BottomNavbarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-transparent px-4 pt-2"
      style={{ paddingBottom: navbarBottomPadding(insets.bottom) }}
    >
      <View
        accessibilityRole="tablist"
        className={cn(
          "flex-row items-center justify-around rounded-full bg-ink px-2 py-2.5",
          outlined && "border-[1.5px] border-primary",
        )}
      >
        {items.map((item) => (
          <NavButton
            key={item.key}
            item={item}
            active={item.key === activeKey}
            activeColor={activeColor}
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
  activeColor,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  const t = useDerivedValue(() => withSpring(active ? 1 : 0, GROW_SPRING), [active]);

  // Solo transform/opacidad: el tamaño del item no cambia y no hay relayout.
  const pillStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.8 + t.value * 0.2 }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="items-center justify-center gap-1 rounded-full px-3.5 py-2.5"
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: activeColor, borderRadius: 999 },
          pillStyle,
        ]}
      />
      <View className="items-center">{item.icon(active)}</View>
      <Text
        className={cn("font-sora-medium text-[11px]", active ? "text-white" : "text-subtle")}
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}
