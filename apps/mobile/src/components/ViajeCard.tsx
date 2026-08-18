import { ArrowRight, Clock, Users } from "lucide-react-native";
import { View } from "react-native";
import type { Viaje } from "@rideujap/shared";

import { formatearCupos, formatearTarifa } from "../lib/formato";
import { colores } from "../lib/tokens";
import { Card, Text } from "./ui";

export interface ViajeCardProps {
  viaje: Viaje;
}

/** Resultado de búsqueda: ruta, hora de salida, cupos y tarifa. */
export function ViajeCard({ viaje }: ViajeCardProps) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-2">
        <Text variant="subtitle" className="flex-1" numberOfLines={1}>
          {viaje.origen}
        </Text>
        <ArrowRight size={16} color={colores.muted} />
        <Text variant="subtitle" className="flex-1 text-right" numberOfLines={1}>
          {viaje.destino}
        </Text>
      </View>

      <View className="flex-row items-center gap-5">
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color={colores.muted} />
          <Text variant="muted">{viaje.hora}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Users size={14} color={colores.muted} />
          <Text variant="muted">{formatearCupos(viaje.cuposDisponibles)}</Text>
        </View>
      </View>

      <Text className="font-semibold text-primary">
        {formatearTarifa(viaje.precioBs, viaje.precioUsd)}
      </Text>
    </Card>
  );
}
