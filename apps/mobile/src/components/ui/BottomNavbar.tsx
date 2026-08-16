import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./Text";

export interface NavItem {
  key: string;
  label: string;
  /** Ícono opcional; recibe si el item está activo para adaptar color. */
  icon?: (active: boolean) => ReactNode;
}

export interface BottomNavbarProps {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

/**
 * Barra de navegación inferior con indicador de item activo.
 */
export function BottomNavbar({ items, activeKey, onSelect }: BottomNavbarProps) {
  return (
    <View accessibilityRole="tablist" className="flex-row border-t border-line bg-white pb-6 pt-2">
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.key)}
            className="h-14 flex-1 items-center justify-center gap-1"
          >
            {item.icon ? item.icon(active) : null}
            <Text className={cn("text-[11px] font-medium", active ? "text-primary" : "text-muted")}>
              {item.label}
            </Text>
            {active ? <View className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
