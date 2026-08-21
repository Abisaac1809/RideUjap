import { type ReactNode } from "react";
import { View } from "react-native";

import { cn } from "../../lib/cn";

export type IconBadgeTone = "primary" | "accent" | "muted";
export type IconBadgeSize = "sm" | "md" | "lg";

export interface IconBadgeProps {
  children: ReactNode;
  tone?: IconBadgeTone;
  size?: IconBadgeSize;
  className?: string;
}

const tones: Record<IconBadgeTone, string> = {
  primary: "bg-primary-tint",
  accent: "bg-accent-tint",
  muted: "border border-line bg-surface",
};

const sizes: Record<IconBadgeSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

/**
 * Círculo de color con un ícono centrado. Motivo visual recurrente (estilo
 * Waze) para anclar acciones y estados; el color del ícono lo pone quien lo usa
 * vía `colores` para casar el tono con `tone`.
 */
export function IconBadge({ children, tone = "primary", size = "md", className }: IconBadgeProps) {
  return (
    <View
      className={cn(
        "items-center justify-center rounded-full",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </View>
  );
}
