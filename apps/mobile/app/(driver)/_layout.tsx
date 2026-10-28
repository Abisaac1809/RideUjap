import { View } from "react-native";
import { Tabs } from "expo-router";
import { Clock, Route, User } from "lucide-react-native";

import { PortalTabBar, type PortalTab } from "../../src/components/PortalTabBar";
import { PortalToggle } from "../../src/components/PortalToggle";
import { PublishFab } from "../../src/components/PublishFab";
import { colores } from "../../src/lib/tokens";

// "viajes" va primero: sin `index.tsx` en este grupo, es la pantalla que se
// muestra al entrar al portal de conductor.
const TABS: PortalTab[] = [
  { name: "viajes", label: "Mis viajes", Icon: Route },
  { name: "historial", label: "Historial", Icon: Clock },
  { name: "perfil", label: "Perfil", Icon: User },
];

export default function DriverLayout() {
  return (
    <View className="flex-1">
      <Tabs
        tabBar={(props) => <PortalTabBar {...props} tabs={TABS} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colores.surface } }}
      >
        {TABS.map(({ name }) => (
          <Tabs.Screen key={name} name={name} />
        ))}
        {/* Ruta accesible pero fuera de la barra de tabs. */}
        <Tabs.Screen name="onboarding" options={{ href: null }} />
      </Tabs>
      <PortalToggle />
      <PublishFab />
    </View>
  );
}
