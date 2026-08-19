import { type ComponentProps, type ComponentType } from "react";
import { Tabs } from "expo-router";
import { Clock, House, Route, User } from "lucide-react-native";

import { BottomNavbar, type NavItem } from "../../src/components/ui";
import { colores } from "../../src/lib/tokens";

interface Tab {
  /** Nombre del archivo de ruta dentro de `app/(tabs)/`. */
  name: string;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
}

const TABS: Tab[] = [
  { name: "index", label: "Inicio", Icon: House },
  { name: "viajes", label: "Viajes", Icon: Route },
  { name: "historial", label: "Historial", Icon: Clock },
  { name: "perfil", label: "Perfil", Icon: User },
];

/**
 * Props que expo-router pasa al `tabBar`. Se derivan del propio componente
 * `Tabs` para no importar los tipos de @react-navigation, que es una
 * dependencia transitiva y no directa de este paquete.
 */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/**
 * Adapta el `BottomNavbar` propio al estado de navegación de expo-router, para
 * reutilizar el componente de diseño en lugar de la barra por defecto.
 */
function BarraInferior({ state, navigation }: TabBarProps) {
  const rutaActiva = state.routes[state.index]?.name ?? "index";

  const items: NavItem[] = TABS.map(({ name, label, Icon }) => ({
    key: name,
    label,
    icon: (activo) => <Icon size={26} color={activo ? "#ffffff" : "#9a938d"} />,
  }));

  return (
    <BottomNavbar
      items={items}
      activeKey={rutaActiva}
      onSelect={(key) => navigation.navigate(key)}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BarraInferior {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colores.surface } }}
    >
      {TABS.map(({ name }) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
