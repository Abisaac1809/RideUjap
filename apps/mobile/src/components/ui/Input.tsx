import { useState, type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { cn } from "../../lib/cn";
import { colores } from "../../lib/tokens";
import { Text } from "./Text";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Campo de texto reutilizable con label, ayuda y estado de error.
 */
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  editable = true,
  className,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const disabled = !editable;

  return (
    <View className="w-full gap-1.5">
      {label ? <Text variant="label">{label}</Text> : null}

      <View
        className={cn(
          "flex-row items-center gap-2 rounded-control border bg-surface px-3",
          "h-12",
          focused ? "border-primary" : "border-line",
          error && "border-red-500",
          disabled && "opacity-50",
        )}
      >
        {leftIcon ? <View>{leftIcon}</View> : null}
        <TextInput
          editable={editable}
          placeholderTextColor={colores.muted}
          className={cn("flex-1 text-base text-ink web:outline-none", className)}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon ? <View>{rightIcon}</View> : null}
      </View>

      {error ? (
        <Text className="text-xs text-red-500">{error}</Text>
      ) : helperText ? (
        <Text variant="muted" className="text-xs">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
