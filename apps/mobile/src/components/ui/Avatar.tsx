import { useState } from "react";
import { Image, View } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./Text";

export interface AvatarProps {
  /** URL de la foto; si falta o falla la carga, se muestra la inicial. */
  uri?: string | null;
  /** Nombre para derivar la inicial del fallback. */
  name?: string | null;
  size?: number;
  className?: string;
}

function initial(name?: string | null): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "?";
}

/**
 * Foto de perfil circular con fallback a la inicial del nombre sobre el color
 * de marca. Se usa en perfil, tarjetas de conductor, etc.
 */
export function Avatar({ uri, name, size = 96, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = uri && !failed;

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn("items-center justify-center overflow-hidden bg-primary-tint", className)}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ width: size, height: size }}
        />
      ) : (
        <Text style={{ fontSize: size * 0.4 }} className="font-sora-bold text-primary">
          {initial(name)}
        </Text>
      )}
    </View>
  );
}
