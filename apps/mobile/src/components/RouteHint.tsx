import { View } from "react-native";
import { GraduationCap, MapPin } from "lucide-react-native";
import type { TripDirection } from "@rideujap/shared";

import { usePortalColors } from "../lib/portal";
import { colores } from "../lib/tokens";
import type { TripViewer } from "../lib/trip-view";
import { RouteConnector } from "./RouteConnector";
import { IconBadge, Text } from "./ui";

type DirectionCopy = Record<TripDirection, { inputLabel: string; caption: string }>;

export const DIRECTION_COPY: Record<TripViewer, DirectionCopy> = {
  passenger: {
    inbound: {
      inputLabel: "¿Dónde te recogen?",
      caption: "Te recogen en tu zona y llegas a la UJAP.",
    },
    outbound: {
      inputLabel: "¿A dónde vas?",
      caption: "Te recogen en la UJAP y te dejan en tu destino.",
    },
  },
  driver: {
    inbound: {
      inputLabel: "¿Desde dónde sales?",
      caption: "Sales de tu zona y llegas a la UJAP.",
    },
    outbound: {
      inputLabel: "¿Hasta dónde llegas?",
      caption: "Sales de la UJAP hacia tu destino.",
    },
  },
};

export const DIRECTION_OPTIONS: { value: TripDirection; label: string }[] = [
  { value: "inbound", label: "Hacia la UJAP" },
  { value: "outbound", label: "Desde la UJAP" },
];

/**
 * Diagrama direccional que ancla la UJAP en el extremo correcto según la
 * dirección del viaje. Es el motivo visual que hila la búsqueda y la creación.
 */
export function RouteHint({
  direction,
  place,
  viewer,
}: {
  direction: TripDirection;
  place: string;
  viewer: TripViewer;
}) {
  const palette = usePortalColors();
  const zona = place.trim() || "Tu zona";
  const campus = {
    label: "UJAP",
    icon: <GraduationCap size={20} color={palette.primary} />,
    accent: true,
  };
  const spot = { label: zona, icon: <MapPin size={20} color={colores.muted} />, accent: false };

  return (
    <View className="gap-2">
      {/* La zona siempre va a la izquierda y la UJAP a la derecha; solo el
          ícono del conector cambia de sentido según la dirección. */}
      <View className="flex-row items-center">
        <Node {...spot} />
        <RouteConnector reverse={direction === "outbound"} />
        <Node {...campus} />
      </View>
      <Text variant="muted" className="text-center text-xs">
        {DIRECTION_COPY[viewer][direction].caption}
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
