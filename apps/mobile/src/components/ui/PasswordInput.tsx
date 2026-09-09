import { useState } from "react";
import { Pressable } from "react-native";
import { Eye, EyeOff, Lock } from "lucide-react-native";

import { colores } from "../../lib/tokens";
import { Input, type InputProps } from "./Input";

export interface PasswordInputProps extends Omit<InputProps, "secureTextEntry" | "rightIcon"> {}

export function PasswordInput({ leftIcon, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      leftIcon={leftIcon ?? <Lock size={18} color={colores.muted} />}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      rightIcon={
        <Pressable
          onPress={() => setVisible((prev) => !prev)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeOff size={18} color={colores.muted} />
          ) : (
            <Eye size={18} color={colores.muted} />
          )}
        </Pressable>
      }
      {...rest}
    />
  );
}
