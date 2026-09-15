import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import type { DriverStatusResponse } from "@rideujap/shared";

import { getDriverProfile } from "./api";
import { useSession } from "./auth-client";
import { colores } from "./tokens";

export type Portal = "passenger" | "driver";

const STORAGE_KEY = "rideujap.portal";

const isWeb = Platform.OS === "web";

// La preferencia de portal no es sensible, así que en web basta con
// localStorage; SecureStore solo existe en nativo.
async function readPortal(): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  return SecureStore.getItemAsync(STORAGE_KEY);
}

async function writePortal(value: Portal): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(STORAGE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

interface PortalContextValue {
  portal: Portal;
  isDriver: boolean;
  driverStatus: DriverStatusResponse | null;
  setPortal: (portal: Portal) => void;
  refreshDriverStatus: () => Promise<void>;
}

const PortalContext = createContext<PortalContextValue | null>(null);

function targetRoute(portal: Portal): string {
  return portal === "driver" ? "/(driver)/viajes" : "/(passenger)";
}

/**
 * Controla qué "portal" (pasajero o conductor) ve el usuario. Se resuelve una
 * sola vez al arrancar la sesión: si el usuario es conductor, respeta el
 * último portal elegido; si no, siempre arranca en pasajero.
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [portal, setPortalState] = useState<Portal>("passenger");
  const [driverStatus, setDriverStatus] = useState<DriverStatusResponse | null>(null);
  const [ready, setReady] = useState(false);

  const isDriver = driverStatus?.driverProfile !== null && driverStatus !== null;

  const refreshDriverStatus = useCallback(async () => {
    if (!session) return;
    try {
      const status = await getDriverProfile();
      setDriverStatus(status);
    } catch {
      // Si falla, se asume pasajero; el usuario puede reintentar desde el perfil.
      setDriverStatus({ driverProfile: null, vehicle: null });
    }
  }, [session]);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      setReady(false);
      setDriverStatus(null);
      return;
    }

    let active = true;

    (async () => {
      const [lastPortal, status] = await Promise.all([
        readPortal(),
        getDriverProfile().catch((): DriverStatusResponse => ({
          driverProfile: null,
          vehicle: null,
        })),
      ]);

      if (!active) return;

      const driver = status.driverProfile !== null;
      const initial: Portal = driver && lastPortal === "driver" ? "driver" : "passenger";

      setDriverStatus(status);
      setPortalState(initial);
      setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [session, isPending]);

  function setPortal(next: Portal) {
    setPortalState(next);
    writePortal(next).catch(() => {});
    router.replace(targetRoute(next) as never);
  }

  if (session && !ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colores.primary} />
      </View>
    );
  }

  return (
    <PortalContext.Provider
      value={{ portal, isDriver, driverStatus, setPortal, refreshDriverStatus }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal(): PortalContextValue {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal debe usarse dentro de PortalProvider");
  return context;
}
