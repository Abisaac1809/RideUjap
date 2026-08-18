import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./ui";

export interface PantallaPlaceholderProps {
  titulo: string;
  descripcion: string;
  icono: ReactNode;
}

/**
 * Pantalla de relleno para las secciones que aún no entran en el MVP.
 *
 * Comunica de forma explícita que la sección está planificada, en vez de
 * mostrar una pantalla vacía que parezca un error durante la demo.
 */
export function PantallaPlaceholder({ titulo, descripcion, icono }: PantallaPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10">
      {icono}
      <Text variant="title">{titulo}</Text>
      <Text variant="muted" className="text-center">
        {descripcion}
      </Text>
    </View>
  );
}
