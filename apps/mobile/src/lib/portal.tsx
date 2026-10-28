import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { vars } from "nativewind";
import { useReducedMotion } from "react-native-reanimated";
import type { DriverStatusResponse } from "@rideujap/shared";

import { getDriverProfile } from "./api";
import { useSession } from "./auth-client";
import { colores, portalPalettes, type PortalPalette } from "./tokens";

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

// Duraciones (ms) del cambio de portal: cubrir, mantener y descubrir.
export const SWITCH_TIMING = {
  full: { enter: 280, hold: 220, exit: 300 },
  reduced: { enter: 150, hold: 0, exit: 150 },
} as const;

function channels(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function themeVars(palette: PortalPalette) {
  return vars({
    "--color-primary": channels(palette.primary),
    "--color-primary-dark": channels(palette.primaryDark),
    "--color-primary-tint": channels(palette.primaryTint),
    "--color-primary-ink": channels(palette.primaryInk),
  });
}

/** Variables CSS de la familia `primary` para cada portal. */
export const portalThemeVars: Record<Portal, ReturnType<typeof vars>> = {
  passenger: themeVars(portalPalettes.passenger),
  driver: themeVars(portalPalettes.driver),
};

interface PortalContextValue {
  portal: Portal;
  /** Portal destino mientras corre la transición de cambio; `null` si no hay. */
  switching: Portal | null;
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
  const [switching, setSwitching] = useState<Portal | null>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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

  function applyPortal(next: Portal) {
    setPortalState(next);
    writePortal(next).catch(() => {});
    router.replace(targetRoute(next) as never);
  }

  // El cambio real ocurre cuando el overlay ya cubre la pantalla, para que el
  // salto de navegación y de colores no se vea.
  function setPortal(next: Portal) {
    if (busy.current) return;
    if (next === portal) {
      applyPortal(next);
      return;
    }
    busy.current = true;
    const timing = reduceMotion ? SWITCH_TIMING.reduced : SWITCH_TIMING.full;
    setSwitching(next);
    timers.current = [
      setTimeout(() => applyPortal(next), timing.enter),
      setTimeout(() => setSwitching(null), timing.enter + timing.hold),
      setTimeout(
        () => {
          busy.current = false;
        },
        timing.enter + timing.hold + timing.exit,
      ),
    ];
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
      value={{ portal, switching, isDriver, driverStatus, setPortal, refreshDriverStatus }}
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

/** Paleta hex del portal activo, para APIs que piden un color crudo (íconos). */
export function usePortalColors(): PortalPalette {
  return portalPalettes[usePortal().portal];
}
