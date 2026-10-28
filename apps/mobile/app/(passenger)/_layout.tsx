import { View } from "react-native";
import { Tabs } from "expo-router";
import { Clock, House, Route, User } from "lucide-react-native";

import { PortalTabBar, type PortalTab } from "../../src/components/PortalTabBar";
import { PortalToggle } from "../../src/components/PortalToggle";
import { colores } from "../../src/lib/tokens";

const TABS: PortalTab[] = [
  { name: "index", label: "Buscar", Icon: House },
  { name: "viajes", label: "Reservas", Icon: Route },
  { name: "historial", label: "Historial", Icon: Clock },
  { name: "perfil", label: "Perfil", Icon: User },
];

export default function PassengerLayout() {
  return (
    <View className="flex-1">
      <Tabs
        tabBar={(props) => <PortalTabBar {...props} tabs={TABS} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colores.surface } }}
      >
        {TABS.map(({ name }) => (
          <Tabs.Screen key={name} name={name} />
        ))}
      </Tabs>
      <PortalToggle />
    </View>
  );
}
