import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "../../lib/cn";

export type TextVariant = "display" | "title" | "subtitle" | "body" | "label" | "muted";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

const variants: Record<TextVariant, string> = {
  // Encabezado de pantalla (saludo, título de sección principal).
  display: "font-sora-bold text-display text-ink -tracking-[0.5px]",
  title: "font-sora-bold text-title text-ink -tracking-[0.3px]",
  subtitle: "font-sora-semibold text-subtitle text-ink",
  body: "font-sans text-base leading-6 text-ink",
  // Etiqueta de campo / sección: mayúsculas discretas para separar bloques.
  label: "font-sora-semibold text-xs uppercase tracking-wider text-muted",
  muted: "font-sans text-sm leading-5 text-muted",
};

/**
 * Texto tipográfico con variantes consistentes con los design tokens.
 */
export function Text({ variant = "body", className, ...rest }: TextProps) {
  return <RNText className={cn(variants[variant], className)} {...rest} />;
}
