import { View, type ViewProps } from "react-native";

import { cn } from "../../lib/cn";

export interface CardProps extends ViewProps {
  padded?: boolean;
  /** Eleva la tarjeta con una sombra suave para que "flote" sobre el fondo. */
  elevated?: boolean;
}

// Sombra suave y difusa (estilo Waze). Se define como estilo nativo porque el
// render de sombras vía className es inconsistente entre iOS y Android.
const SHADOW = {
  shadowColor: "#1a1614",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
};

/**
 * Contenedor tipo tarjeta con superficie, borde redondeado y sombra opcional.
 */
export function Card({ padded = true, elevated = false, className, style, ...rest }: CardProps) {
  return (
    <View
      style={[elevated ? SHADOW : null, style]}
      className={cn("rounded-3xl border border-line bg-white", padded && "p-4", className)}
      {...rest}
    />
  );
}
