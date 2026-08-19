/**
 * Design tokens en formato hex, espejo de los definidos en `tailwind.config.js`.
 *
 * NativeWind cubre todo lo que se estiliza con `className`, pero algunas APIs
 * nativas piden un color crudo (los íconos de lucide, `ActivityIndicator`,
 * `placeholderTextColor`). Estas constantes evitan repartir literales por el
 * código; si cambia la paleta, hay que tocar este archivo y el de Tailwind.
 */
export const colores = {
  // Teal profundo: color de marca. Más cálido y con más carácter que el
  // esmeralda genérico de plantilla.
  primary: "#0d7a6f",
  primaryDark: "#0a5f56",
  primaryTint: "#e6f4f2",
  primaryInk: "#ffffff",
  // Coral: acento para destacar acciones/estados puntuales.
  accent: "#ff6b4a",
  // Neutros cálidos (tono ligeramente tierra, no gris frío de starter kit).
  ink: "#1a1614",
  muted: "#8a827d",
  surface: "#faf8f6",
  line: "#ece7e3",
} as const;
