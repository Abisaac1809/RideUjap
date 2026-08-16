import { Pressable, View } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./Text";

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Interruptor on/off al estilo Switch, con pista y perilla.
 */
export function Toggle({ value, onValueChange, label, disabled = false }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      className={cn("flex-row items-center gap-3", disabled && "opacity-50")}
    >
      <View
        className={cn(
          "h-7 w-12 justify-center rounded-full px-0.5",
          value ? "bg-primary" : "bg-line",
        )}
      >
        <View
          className={cn("h-6 w-6 rounded-full bg-white shadow", value ? "self-end" : "self-start")}
        />
      </View>
      {label ? <Text variant="body">{label}</Text> : null}
    </Pressable>
  );
}
