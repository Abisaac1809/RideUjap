import { type ComponentProps, type ComponentType } from "react";
import { Tabs } from "expo-router";

import { usePortal, usePortalColors } from "../lib/portal";
import { colores } from "../lib/tokens";
import { BottomNavbar, type NavItem } from "./ui";

export interface PortalTab {
  /** Nombre del archivo de ruta dentro del grupo del portal. */
  name: string;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
}

/**
 * Props que expo-router pasa al `tabBar`. Se derivan del propio componente
 * `Tabs` para no importar los tipos de @react-navigation, que es una
 * dependencia transitiva y no directa de este paquete.
 */
export type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/**
 * Adapta el `BottomNavbar` propio al estado de navegación de expo-router. En
 * el portal de conductor la barra lleva un anillo del color del portal.
 */
export function PortalTabBar({ state, navigation, tabs }: TabBarProps & { tabs: PortalTab[] }) {
  const { portal } = usePortal();
  const palette = usePortalColors();
  const activeRoute = state.routes[state.index]?.name ?? tabs[0]?.name;

  const items: NavItem[] = tabs.map(({ name, label, Icon }) => ({
    key: name,
    label,
    icon: (active) => <Icon size={20} color={active ? colores.primaryInk : colores.subtle} />,
  }));

  return (
    <BottomNavbar
      items={items}
      activeKey={activeRoute ?? ""}
      onSelect={(key) => navigation.navigate(key)}
      activeColor={palette.primary}
      outlined={portal === "driver"}
    />
  );
}
