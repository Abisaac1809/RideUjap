import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";

// Spring corto y con poco rebote: sensación táctil "viva" sin exagerar.
const SPRING: WithSpringConfig = { damping: 15, stiffness: 320, mass: 0.5 };

export interface PressScaleOptions {
  /** Escala al mantener presionado. Más bajo = hundimiento más marcado. */
  to?: number;
}

/**
 * Anima un elemento presionable con un "hundimiento" elástico (estilo Waze).
 * Devuelve el estilo animado y los handlers para enchufar a un Pressable.
 *
 *   const { animatedStyle, onPressIn, onPressOut } = usePressScale();
 *   <Animated.View style={animatedStyle}>…</Animated.View>
 */
export function usePressScale({ to = 0.96 }: PressScaleOptions = {}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(to, SPRING);
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
  }, [scale]);

  return { animatedStyle, onPressIn, onPressOut };
}
