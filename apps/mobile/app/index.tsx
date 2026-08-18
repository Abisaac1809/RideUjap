import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Search, TriangleAlert } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Viaje } from "@rideujap/shared";

import { MapPlaceholder } from "../src/components/MapPlaceholder";
import { ViajeCard } from "../src/components/ViajeCard";
import { Button, Card, Input, Text } from "../src/components/ui";
import { ApiError, buscarViajes } from "../src/lib/api";
import { colores } from "../src/lib/tokens";

type Estado =
  | { tipo: "inicial" }
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; viajes: Viaje[] };

/**
 * Pantalla de inicio: réplica en React Native del diseño validado en el
 * template Vue, conectada al endpoint real de viajes.
 */
export default function InicioScreen() {
  const [destino, setDestino] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });

  async function onBuscar() {
    setEstado({ tipo: "cargando" });
    try {
      const viajes = await buscarViajes(destino);
      setEstado({ tipo: "listo", viajes });
    } catch (error) {
      const mensaje = error instanceof ApiError ? error.message : "Ocurrió un error inesperado.";
      setEstado({ tipo: "error", mensaje });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text variant="label" className="uppercase tracking-widest text-primary">
            RideUJAP
          </Text>
          <Text variant="title" className="text-3xl">
            ¿A dónde vas hoy?
          </Text>
          <Text variant="muted">Comparte el viaje con tu comunidad universitaria</Text>
        </View>

        <View className="gap-3">
          <Input
            label="Destino"
            placeholder="Ej. San Diego, Naguanagua…"
            value={destino}
            onChangeText={setDestino}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onBuscar}
            leftIcon={<Search size={18} color={colores.muted} />}
          />
          <Button
            label="Buscar viaje"
            fullWidth
            loading={estado.tipo === "cargando"}
            onPress={onBuscar}
          />
        </View>

        <MapPlaceholder />

        <Resultados estado={estado} destino={destino} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Resultados({ estado, destino }: { estado: Estado; destino: string }) {
  if (estado.tipo === "inicial" || estado.tipo === "cargando") return null;

  if (estado.tipo === "error") {
    return (
      <Card className="flex-row items-center gap-3">
        <TriangleAlert size={20} color={colores.muted} />
        <Text variant="muted" className="flex-1">
          {estado.mensaje}
        </Text>
      </Card>
    );
  }

  if (estado.viajes.length === 0) {
    return (
      <Card>
        <Text variant="muted">
          {destino.trim()
            ? `No encontramos viajes hacia "${destino.trim()}".`
            : "Todavía no hay viajes publicados."}
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      <Text variant="label">
        {estado.viajes.length === 1
          ? "1 viaje disponible"
          : `${estado.viajes.length} viajes disponibles`}
      </Text>
      {estado.viajes.map((viaje) => (
        <ViajeCard key={viaje.id} viaje={viaje} />
      ))}
    </View>
  );
}
