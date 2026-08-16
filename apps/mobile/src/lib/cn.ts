/**
 * Une clases condicionalmente, descartando valores falsy.
 * Útil para componer clases de NativeWind según variantes/estado.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
