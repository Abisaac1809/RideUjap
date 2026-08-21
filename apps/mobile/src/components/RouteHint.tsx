import { View } from "react-native";
import { GraduationCap, MapPin } from "lucide-react-native";
import type { TripDirection } from "@rideujap/shared";

import { colores } from "../lib/tokens";
import { RouteConnector } from "./RouteConnector";
import { IconBadge, Text } from "./ui";

export const DIRECTION_COPY: Record<TripDirection, { inputLabel: string; caption: string }> = {
  inbound: {
    inputLabel: "¿Dónde te recogen?",
    caption: "Te recogen en tu zona y llegas a la UJAP.",
  },
  outbound: {
    inputLabel: "¿A dónde vas?",
    caption: "Sales de la UJAP hacia tu destino.",
  },
};

/**
 * Diagrama direccional que ancla la UJAP en el extremo correcto según la
 * dirección del viaje. Es el motivo visual que hila la búsqueda y la creación.
 */
export function RouteHint({ direction, place }: { direction: TripDirection; place: string }) {
  const zona = place.trim() || "Tu zona";
  const campus = {
    label: "UJAP",
    icon: <GraduationCap size={20} color={colores.primary} />,
    accent: true,
  };
  const spot = { label: zona, icon: <MapPin size={20} color={colores.muted} />, accent: false };

  return (
    <View className="gap-2">
      {/* La zona siempre va a la izquierda y la UJAP a la derecha; solo el
          ícono del conector cambia de sentido según ida/vuelta. */}
      <View className="flex-row items-center">
        <Node {...spot} />
        <RouteConnector reverse={direction === "outbound"} />
        <Node {...campus} />
      </View>
      <Text variant="muted" className="text-center text-xs">
        {DIRECTION_COPY[direction].caption}
      </Text>
    </View>
  );
}

function Node({ label, icon, accent }: { label: string; icon: React.ReactNode; accent: boolean }) {
  return (
    <View className="w-16 items-center gap-1.5">
      <IconBadge tone={accent ? "primary" : "muted"} size="lg">
        {icon}
      </IconBadge>
      <Text variant="label" className="text-center text-ink" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
