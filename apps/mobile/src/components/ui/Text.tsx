import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "../../lib/cn";

export type TextVariant = "title" | "subtitle" | "body" | "label" | "muted";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

const variants: Record<TextVariant, string> = {
  title: "text-2xl font-bold text-ink",
  subtitle: "text-lg font-semibold text-ink",
  body: "text-base text-ink",
  label: "text-xs font-semibold text-muted",
  muted: "text-sm text-muted",
};

/**
 * Texto tipográfico con variantes consistentes con los design tokens.
 */
export function Text({ variant = "body", className, ...rest }: TextProps) {
  return <RNText className={cn(variants[variant], className)} {...rest} />;
}
