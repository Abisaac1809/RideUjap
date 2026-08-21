import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Route, TriangleAlert } from "lucide-react-native";
import type { MyTripItem, MyTripsResponse, ReservationDecision } from "@rideujap/shared";

import { ApiError, decideReservation, getMyTrips } from "../lib/api";
import { colores } from "../lib/tokens";
import { MyTripCard } from "./MyTripCard";
import { Button, Card, Text } from "./ui";

export interface MyTripsListProps {
  bucket: "upcoming" | "history";
}

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: MyTripsResponse };

export function MyTripsList({ bucket }: MyTripsListProps) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyTrips();
      setState({ kind: "ready", data });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Ocurrió un error inesperado.";
      setState({ kind: "error", message });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function onDecide(reservationId: string, status: ReservationDecision) {
    setDecidingId(reservationId);
    try {
      await decideReservation(reservationId, status);
      await load();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "No pudimos actualizar la reserva.";
      Alert.alert("No se pudo", message);
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-3 px-5 pb-8 pt-2"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colores.muted} />
      }
    >
      {state.kind === "loading" ? (
        <Text variant="muted">Cargando tus viajes…</Text>
      ) : state.kind === "error" ? (
        <Card className="gap-3">
          <View className="flex-row items-center gap-3">
            <TriangleAlert size={20} color={colores.muted} />
            <Text variant="muted" className="flex-1">
              {state.message}
            </Text>
          </View>
          <Button label="Reintentar" variant="outline" onPress={load} />
        </Card>
      ) : (
        <List
          items={bucket === "upcoming" ? state.data.upcoming : state.data.history}
          bucket={bucket}
          onDecide={onDecide}
          decidingId={decidingId}
          onPublish={() => router.push("/publicar")}
        />
      )}
    </ScrollView>
  );
}

/** Un viaje "requiere acción": solicitud del pasajero pendiente, o el conductor
 * tiene solicitudes por responder. Se muestran primero en Próximos. */
function needsAction(item: MyTripItem): boolean {
  return item.role === "passenger"
    ? item.reservation.status === "requested"
    : item.reservations.some((r) => r.status === "requested");
}

function List({
  items,
  bucket,
  onDecide,
  decidingId,
  onPublish,
}: {
  items: MyTripItem[];
  bucket: "upcoming" | "history";
  onDecide: (id: string, status: ReservationDecision) => void;
  decidingId: string | null;
  onPublish: () => void;
}) {
  const ordered =
    bucket === "upcoming"
      ? [...items].sort((a, b) => Number(needsAction(b)) - Number(needsAction(a)))
      : items;

  if (ordered.length === 0) {
    return (
      <Card className="items-center gap-3 py-8">
        <Route size={32} color={colores.muted} />
        {bucket === "upcoming" ? (
          <>
            <Text variant="muted" className="text-center">
              No tienes viajes próximos. Publica uno o busca un cupo desde el inicio.
            </Text>
            <Button label="Publicar viaje" onPress={onPublish} />
          </>
        ) : (
          <Text variant="muted" className="text-center">
            Aún no hay viajes en tu historial.
          </Text>
        )}
      </Card>
    );
  }

  return (
    <>
      {ordered.map((item) => (
        <MyTripCard
          key={`${item.role}-${item.trip.id}`}
          item={item}
          onDecide={onDecide}
          decidingId={decidingId}
        />
      ))}
    </>
  );
}
