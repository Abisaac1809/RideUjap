import { type ReactNode } from "react";
import { Pressable, type GestureResponderEvent, type PressableProps } from "react-native";
import Animated from "react-native-reanimated";

import { usePressScale } from "../../lib/usePressScale";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  /** Escala al presionar (0-1). Cards grandes lucen mejor con un valor alto. */
  scaleTo?: number;
}

/**
 * Envoltorio presionable que "hunde" su contenido con un spring elástico
 * (estilo Waze). Para tarjetas y filas presionables; reutiliza `usePressScale`.
 */
export function PressableScale({
  children,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const {
    animatedStyle,
    onPressIn: scaleIn,
    onPressOut: scaleOut,
  } = usePressScale({ to: scaleTo });

  function handlePressIn(e: GestureResponderEvent) {
    scaleIn();
    onPressIn?.(e);
  }

  function handlePressOut(e: GestureResponderEvent) {
    scaleOut();
    onPressOut?.(e);
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
