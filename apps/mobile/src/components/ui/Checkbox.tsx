import { Pressable, View } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./Text";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Casilla de verificación con label opcional.
 */
export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className={cn("flex-row items-center gap-2.5", disabled && "opacity-50")}
    >
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-md border-2",
          checked ? "border-primary bg-primary" : "border-line bg-transparent",
        )}
      >
        {checked ? (
          <Text className="text-sm font-bold leading-none text-primary-ink">✓</Text>
        ) : null}
      </View>
      {label ? <Text variant="body">{label}</Text> : null}
    </Pressable>
  );
}
