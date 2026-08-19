import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";

import { cn } from "../../lib/cn";
import { colores } from "../../lib/tokens";
import { Text } from "./Text";

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/**
 * Control numérico compacto para elegir cantidades pequeñas (p. ej. cupos).
 */
export function Stepper({ value, onChange, min = 1, max = 99 }: StepperProps) {
  return (
    <View className="flex-row items-center gap-4 self-start rounded-control border border-line bg-surface px-2 py-1">
      <StepButton
        label="Restar"
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={18} color={colores.ink} />
      </StepButton>
      <Text className="w-8 text-center text-lg font-semibold text-ink">{value}</Text>
      <StepButton
        label="Sumar"
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={18} color={colores.ink} />
      </StepButton>
    </View>
  );
}

function StepButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "h-9 w-9 items-center justify-center rounded-full border border-line bg-white active:opacity-80",
        disabled && "opacity-40",
      )}
    >
      {children}
    </Pressable>
  );
}
