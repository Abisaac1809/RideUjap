import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Car, ChevronRight, MapPin, TriangleAlert } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Trip, TripDirection } from "@rideujap/shared";

import { DIRECTION_COPY, RouteHint } from "../../src/components/RouteHint";
import { TripCard } from "../../src/components/TripCard";
import { Button, Card, Input, Segmented, Text } from "../../src/components/ui";
import { ApiError, searchTrips } from "../../src/lib/api";
import { useSession } from "../../src/lib/auth-client";
import { colores } from "../../src/lib/tokens";

type State =
  | { kind: "initial" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; trips: Trip[] };

export default function InicioScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  const [direction, setDirection] = useState<TripDirection>("inbound");
  const [place, setPlace] = useState("");
  const [state, setState] = useState<State>({ kind: "initial" });

  async function onSearch() {
    setState({ kind: "loading" });
    try {
      const trips = await searchTrips({ direction, destination: place });
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
            {firstName ? `Hola, ${firstName}` : "Hola"}
          </Text>
          <Text variant="muted">¿Vas a la U o vuelves a casa? Encuentra con quién ir.</Text>
        </View>

        <Card className="gap-4 bg-white">
          <Segmented
            value={direction}
            onChange={setDirection}
            options={[
              { value: "inbound", label: "Ida" },
              { value: "outbound", label: "Vuelta" },
            ]}
          />

          <RouteHint direction={direction} place={place} />

          <Input
            label={DIRECTION_COPY[direction].inputLabel}
            placeholder="Ej. San Diego, Naguanagua…"
            value={place}
            onChangeText={setPlace}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onSearch}
            leftIcon={<MapPin size={18} color={colores.muted} />}
          />

          <Button
            label="Buscar viajes"
            fullWidth
            loading={state.kind === "loading"}
            onPress={onSearch}
          />
        </Card>

        <Pressable accessibilityRole="button" onPress={() => router.push("/publicar")}>
          <Card className="flex-row items-center gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Car size={20} color={colores.primary} />
            </View>
            <View className="flex-1">
              <Text variant="subtitle">¿Vas a manejar?</Text>
              <Text variant="muted">Ofrece tus cupos y comparte gastos.</Text>
            </View>
            <ChevronRight size={20} color={colores.muted} />
          </Card>
        </Pressable>

        <Results state={state} place={place} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Results({ state, place }: { state: State; place: string }) {
  const router = useRouter();

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
          {place.trim()
            ? `No encontramos viajes hacia "${place.trim()}".`
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
        <Pressable
          key={trip.id}
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/viaje",
              params: { data: JSON.stringify({ mode: "reserve", trip }) },
            })
          }
        >
          <TripCard trip={trip} />
        </Pressable>
      ))}
    </View>
  );
}
