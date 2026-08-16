import { View, type ViewProps } from "react-native";

import { cn } from "../../lib/cn";

export interface CardProps extends ViewProps {
  padded?: boolean;
}

/**
 * Contenedor tipo tarjeta con superficie, borde redondeado y sombra sutil.
 */
export function Card({ padded = true, className, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-sm",
        padded && "p-4",
        className,
      )}
      {...rest}
    />
  );
}
