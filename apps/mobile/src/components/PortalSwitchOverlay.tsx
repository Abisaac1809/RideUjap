import { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Backpack, Car } from "lucide-react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SWITCH_TIMING, usePortal, type Portal } from "../lib/portal";
import { portalPalettes } from "../lib/tokens";
import { Text } from "./ui";

const COPY: Record<Portal, { title: string; hint: string }> = {
  driver: { title: "Conductor", hint: "Publica tus viajes y decide quién va contigo." },
  passenger: { title: "Pasajero", hint: "Busca un viaje hacia o desde la UJAP." },
};

// Centro aproximado del botón de cambio (arriba a la derecha): el círculo
// nace de ahí para que la transición se lea como consecuencia del toque.
const ORIGIN_FROM_RIGHT = 72;
const ORIGIN_FROM_TOP = 28;

const ENTER_EASING = Easing.bezier(0.65, 0, 0.35, 1);
const EXIT_EASING = Easing.out(Easing.cubic);

/**
 * Cortina a pantalla completa con el color del portal destino. Entra como un
 * círculo que crece desde el botón y sale con un fundido cuando el portal
 * nuevo ya está pintado debajo.
 */
export function PortalSwitchOverlay() {
  const { switching } = usePortal();
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Conserva el último destino para pintar la salida cuando `switching` ya es null.
  const [target, setTarget] = useState<Portal | null>(null);
  if (switching !== null && switching !== target) setTarget(switching);

  const reveal = useSharedValue(0);
  const fade = useSharedValue(0);
  const content = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    const timing = reduceMotion ? SWITCH_TIMING.reduced : SWITCH_TIMING.full;
    if (switching) {
      fade.value = 1;
      reveal.value = 0;
      content.value = 0;
      ring.value = 0;
      if (reduceMotion) {
        reveal.value = 1;
        fade.value = 0;
        fade.value = withTiming(1, { duration: timing.enter });
        content.value = 1;
      } else {
        reveal.value = withTiming(1, { duration: timing.enter, easing: ENTER_EASING });
        content.value = withDelay(
          timing.enter * 0.45,
          withSpring(1, { damping: 18, stiffness: 180, mass: 0.8 }),
        );
        // La onda del sello corre una sola vez, solo al entrar.
        ring.value = withDelay(
          timing.enter * 0.7,
          withTiming(1, { duration: 700, easing: EXIT_EASING }),
        );
      }
    } else {
      // El contenido se va primero; el color se desvanece justo detrás.
      content.value = withTiming(0, { duration: timing.exit * 0.5, easing: EXIT_EASING });
      fade.value = withDelay(
        reduceMotion ? 0 : timing.exit * 0.2,
        withTiming(0, { duration: timing.exit, easing: EXIT_EASING }),
      );
    }
  }, [switching, reduceMotion, reveal, fade, content, ring]);

  const originX = width - ORIGIN_FROM_RIGHT;
  const originY = insets.top + ORIGIN_FROM_TOP;
  // Radio hasta la esquina más lejana (abajo a la izquierda).
  const radius = Math.hypot(originX, height - originY) + 8;

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reveal.value }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  // Un solo valor escalona la entrada: sello, luego título, luego la pista.
  const stageStyle = (from: number, to: number) => () => {
    "worklet";
    const t = interpolate(content.value, [from, to], [0, 1], "clamp");
    return { opacity: t, transform: [{ translateY: (1 - t) * 14 }] };
  };
  const badgeStyle = useAnimatedStyle(() => {
    const t = interpolate(content.value, [0, 0.6], [0, 1], "clamp");
    return { opacity: t, transform: [{ scale: 0.7 + t * 0.3 }] };
  });
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.2, 1], [0, 0.5, 0]),
    transform: [{ scale: 1 + ring.value * 0.6 }],
  }));
  const titleStyle = useAnimatedStyle(stageStyle(0.25, 0.85));
  const hintStyle = useAnimatedStyle(stageStyle(0.5, 1));

  if (!target) return null;

  const Icon = target === "driver" ? Car : Backpack;
  const color = portalPalettes[target].primary;

  return (
    <Animated.View
      pointerEvents={switching ? "auto" : "none"}
      accessibilityLiveRegion="polite"
      style={[StyleSheet.absoluteFill, { zIndex: 50, overflow: "hidden" }, fadeStyle]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: originX - radius,
            top: originY - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: color,
          },
          circleStyle,
        ]}
      />
      <View className="flex-1 items-center justify-center px-10">
        <View className="mb-8 h-24 w-24 items-center justify-center">
          <Animated.View
            style={ringStyle}
            className="absolute h-24 w-24 rounded-full border-2 border-white"
          />
          <Animated.View
            style={badgeStyle}
            className="h-24 w-24 items-center justify-center rounded-full bg-white"
          >
            <Icon size={44} color={color} strokeWidth={2.25} />
          </Animated.View>
        </View>
        <Animated.View style={titleStyle} className="items-center">
          <Text className="font-sora-semibold text-[11px] uppercase tracking-[2px] text-white/70">
            Cambiando a
          </Text>
          <Text className="mt-1 font-sora-bold text-[40px] leading-[46px] text-white">
            {COPY[target].title}
          </Text>
        </Animated.View>
        <Animated.View style={hintStyle} className="mt-3 max-w-[260px]">
          <Text className="text-center font-sans text-[15px] leading-[22px] text-white/80">
            {COPY[target].hint}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
