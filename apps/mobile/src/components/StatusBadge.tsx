import { MessageCircle } from "lucide-react-native";
import type { ReservationStatus } from "@rideujap/shared";

import { cn } from "../lib/cn";
import { colores } from "../lib/tokens";
import { openWhatsApp } from "../lib/whatsapp";
import { Button, Text } from "./ui";

const STATUS_META: Record<ReservationStatus, { label: string; className: string }> = {
  requested: { label: "Pendiente", className: "bg-accent-tint text-accent" },
  accepted: { label: "Aceptada", className: "bg-primary-tint text-primary" },
  enrolled: { label: "Confirmada", className: "bg-primary-tint text-primary" },
  rejected: { label: "Rechazada", className: "bg-red-500/10 text-red-500" },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const meta = STATUS_META[status];
  return (
    <Text
      className={cn(
        "self-start rounded-full px-2.5 py-0.5 font-sora-semibold text-xs",
        meta.className,
      )}
    >
      {meta.label}
    </Text>
  );
}

export function ContactButton({ phone }: { phone: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      label="WhatsApp"
      className="self-start"
      leftIcon={<MessageCircle size={16} color={colores.ink} />}
      onPress={() => openWhatsApp(phone)}
    />
  );
}
