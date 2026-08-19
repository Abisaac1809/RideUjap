import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Search, TriangleAlert } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Trip } from "@rideujap/shared";

import { MapPlaceholder } from "../src/components/MapPlaceholder";
import { TripCard } from "../src/components/TripCard";
import { Button, Card, Input, Text } from "../src/components/ui";
import { ApiError, searchTrips } from "../src/lib/api";
import { colores } from "../src/lib/tokens";

type State =
  | { kind: "initial" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; trips: Trip[] };

export default function InicioScreen() {
  const [destination, setDestination] = useState("");
  const [state, setState] = useState<State>({ kind: "initial" });

  async function onSearch() {
    setState({ kind: "loading" });
    try {
      const trips = await searchTrips(destination);
      setState({ kind: "ready", trips });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Ocurrió un error inesperado.";
      setState({ kind: "error", message });
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
            value={destination}
            onChangeText={setDestination}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onSearch}
            leftIcon={<Search size={18} color={colores.muted} />}
          />
          <Button
            label="Buscar viaje"
            fullWidth
            loading={state.kind === "loading"}
            onPress={onSearch}
          />
        </View>

        <MapPlaceholder />

        <Results state={state} destination={destination} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Results({ state, destination }: { state: State; destination: string }) {
  if (state.kind === "initial" || state.kind === "loading") return null;

  if (state.kind === "error") {
    return (
      <Card className="flex-row items-center gap-3">
        <TriangleAlert size={20} color={colores.muted} />
        <Text variant="muted" className="flex-1">
          {state.message}
        </Text>
      </Card>
    );
  }

  if (state.trips.length === 0) {
    return (
      <Card>
        <Text variant="muted">
          {destination.trim()
            ? `No encontramos viajes hacia "${destination.trim()}".`
            : "Todavía no hay viajes publicados."}
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      <Text variant="label">
        {state.trips.length === 1
          ? "1 viaje disponible"
          : `${state.trips.length} viajes disponibles`}
      </Text>
      {state.trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </View>
  );
}
