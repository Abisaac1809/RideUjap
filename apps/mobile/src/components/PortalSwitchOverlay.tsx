import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Backpack, Car } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SWITCH_TIMING, usePortal, type Portal } from "../lib/portal";
import { portalPalettes } from "../lib/tokens";
import { Text } from "./ui";

const COPY: Record<Portal, string> = {
  driver: "Cambiando a modo conductor",
  passenger: "Cambiando a modo pasajero",
};

/**
 * Cortina a pantalla completa con el color del portal destino. Cubre la
 * pantalla mientras `PortalProvider` cambia de portal por debajo.
 */
export function PortalSwitchOverlay() {
  const { switching } = usePortal();
  const reduceMotion = useReducedMotion();
  // Conserva el último destino para pintar la salida cuando `switching` ya es null.
  const [target, setTarget] = useState<Portal | null>(null);
  if (switching !== null && switching !== target) setTarget(switching);

  const cover = useSharedValue(0);
  const icon = useSharedValue(0);
  const bar = useSharedValue(0);

  useEffect(() => {
    const timing = reduceMotion ? SWITCH_TIMING.reduced : SWITCH_TIMING.full;
    if (switching) {
      cover.value = withTiming(1, { duration: timing.enter });
      bar.value = 0;
      bar.value = withTiming(1, { duration: timing.enter + timing.hold });
      icon.value = reduceMotion ? 1 : 0;
      if (!reduceMotion) {
        icon.value = withDelay(120, withSpring(1, { damping: 12, stiffness: 200 }));
      }
    } else {
      cover.value = withTiming(0, { duration: timing.exit });
    }
  }, [switching, reduceMotion, cover, icon, bar]);

  const coverStyle = useAnimatedStyle(() => ({
    opacity: cover.value,
    transform: [{ scale: reduceMotion ? 1 : 1.04 - cover.value * 0.04 }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: icon.value,
    transform: [{ scale: 0.6 + icon.value * 0.4 }],
  }));
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: bar.value }] }));

  if (!target) return null;

  const Icon = target === "driver" ? Car : Backpack;

  return (
    <Animated.View
      pointerEvents={switching ? "auto" : "none"}
      accessibilityLiveRegion="polite"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: portalPalettes[target].primary, zIndex: 50 },
        coverStyle,
      ]}
    >
      <View className="flex-1 items-center justify-center gap-5 px-8">
        <Animated.View
          style={iconStyle}
          className="h-20 w-20 items-center justify-center rounded-full bg-white/15"
        >
          <Icon size={40} color="#ffffff" />
        </Animated.View>
        <Text className="text-center font-sora-semibold text-subtitle text-white">
          {COPY[target]}
        </Text>
        <View className="h-1 w-24 overflow-hidden rounded-full bg-white/25">
          <Animated.View
            style={[{ transformOrigin: "left" }, barStyle]}
            className="h-full w-full rounded-full bg-white"
          />
        </View>
      </View>
    </Animated.View>
  );
}
