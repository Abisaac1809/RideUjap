import { Route } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PantallaPlaceholder } from "../src/components/PantallaPlaceholder";
import { colores } from "../src/lib/tokens";

export default function ViajesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <PantallaPlaceholder
        icono={<Route size={40} color={colores.muted} />}
        titulo="Mis viajes"
        descripcion="Aquí verás los viajes que has publicado como conductor y los cupos que has reservado como pasajero."
      />
    </SafeAreaView>
  );
}
