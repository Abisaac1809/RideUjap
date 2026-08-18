import { User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PantallaPlaceholder } from "../src/components/PantallaPlaceholder";
import { colores } from "../src/lib/tokens";

export default function PerfilScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <PantallaPlaceholder
        icono={<User size={40} color={colores.muted} />}
        titulo="Perfil"
        descripcion="Tus datos como miembro de la comunidad UJAP y, más adelante, la información de tu vehículo si ofreces cupos."
      />
    </SafeAreaView>
  );
}
