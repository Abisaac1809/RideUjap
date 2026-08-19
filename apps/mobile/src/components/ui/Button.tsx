import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";
import Animated from "react-native-reanimated";

import { cn } from "../../lib/cn";
import { usePressScale } from "../../lib/usePressScale";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base = "flex-row items-center justify-center rounded-control gap-2";

const variants: Record<ButtonVariant, { box: string; text: string; spinner: string }> = {
  primary: {
    box: "bg-primary active:bg-primary-dark",
    text: "text-primary-ink",
    spinner: "#ffffff",
  },
  outline: {
    box: "bg-transparent border border-line active:bg-surface",
    text: "text-ink",
    spinner: "#1a1614",
  },
  ghost: { box: "bg-transparent active:bg-surface", text: "text-ink", spinner: "#1a1614" },
  danger: { box: "bg-red-500 active:opacity-80", text: "text-white", spinner: "#ffffff" },
};

const sizes: Record<ButtonSize, { box: string; text: string }> = {
  sm: { box: "h-10 px-4", text: "text-sm" },
  md: { box: "h-12 px-5", text: "text-base" },
  lg: { box: "h-14 px-6", text: "text-lg" },
};

/**
 * Botón reutilizable con variantes, tamaños y estado de carga.
 */
export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;
  const { animatedStyle, onPressIn: scaleIn, onPressOut: scaleOut } = usePressScale();

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
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={cn(
        base,
        v.box,
        s.box,
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text className={cn("font-sora-semibold", s.text, v.text)}>{label}</Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </AnimatedPressable>
  );
}
