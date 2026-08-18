import { Clock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PantallaPlaceholder } from "../src/components/PantallaPlaceholder";
import { colores } from "../src/lib/tokens";

export default function HistorialScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <PantallaPlaceholder
        icono={<Clock size={40} color={colores.muted} />}
        titulo="Historial"
        descripcion="El registro de tus viajes completados, con su fecha, ruta y lo que se compartió en gastos."
      />
    </SafeAreaView>
  );
}
