import { View } from "react-native";
import { GraduationCap, MapPin, MoveRight } from "lucide-react-native";
import type { TripDirection } from "@rideujap/shared";

import { colores } from "../lib/tokens";
import { Text } from "./ui";

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
  const [from, to] = direction === "inbound" ? [spot, campus] : [campus, spot];

  return (
    <View className="gap-2">
      <View className="flex-row items-center">
        <Node {...from} />
        <View className="flex-1 flex-row items-center px-2">
          <View className="h-px flex-1 bg-line" />
          <MoveRight size={18} color={colores.muted} />
          <View className="h-px flex-1 bg-line" />
        </View>
        <Node {...to} />
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
      <View
        className={
          accent
            ? "h-12 w-12 items-center justify-center rounded-full bg-primary/10"
            : "h-12 w-12 items-center justify-center rounded-full border border-line bg-surface"
        }
      >
        {icon}
      </View>
      <Text variant="label" className="text-center text-ink" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
