/**
 * Design tokens en formato hex, espejo de los definidos en `tailwind.config.js`.
 *
 * NativeWind cubre todo lo que se estiliza con `className`, pero algunas APIs
 * nativas piden un color crudo (los íconos de lucide, `ActivityIndicator`,
 * `placeholderTextColor`). Estas constantes evitan repartir literales por el
 * código; si cambia la paleta, hay que tocar este archivo y el de Tailwind.
 */
export const colores = {
  primary: "#12b981",
  primaryInk: "#ffffff",
  ink: "#0e0f12",
  muted: "#8a9099",
  surface: "#f5f6f7",
  line: "#e7e9ec",
} as const;
