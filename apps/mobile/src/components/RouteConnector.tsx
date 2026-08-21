import { useEffect, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { SendHorizontal } from "lucide-react-native";
import Svg, { Defs, Line, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colores } from "../lib/tokens";

const ICON = 16;
const DURATION = 1800;
const FLIP_DURATION = 350;

/**
 * Conector animado entre los dos nodos de la ruta: una línea discontinua con un
 * ícono `SendHorizontal` que la recorre en loop.
 *
 * Con `reverse` el ícono viaja en sentido contrario (→ hacia el nodo izquierdo)
 * y se voltea con una transición suave (giro sobre su eje Y), en vez de saltar
 * de golpe o reiniciar la animación.
 */
export function RouteConnector({ reverse = false }: { reverse?: boolean }) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  // 0 = normal (viaja →), 1 = invertido (viaja ←). Transiciona suave al cambiar.
  const flip = useSharedValue(reverse ? 1 : 0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  useEffect(() => {
    flip.value = withTiming(reverse ? 1 : 0, {
      duration: FLIP_DURATION,
      easing: Easing.inOut(Easing.ease),
    });
  }, [reverse, flip]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // Sentido de recorrido: -1 cuando está invertido. Interpolado desde `flip`
  // para que el punto de partida se desplace junto con el giro.
  const dir = useDerivedValue(() => interpolate(flip.value, [0, 1], [1, -1]));

  const iconStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, width - ICON);
    // Con dir positivo va 0→travel; con dir negativo va travel→0.
    const base = progress.value * travel;
    const x = dir.value >= 0 ? base : travel - base;
    return {
      transform: [
        { translateX: x },
        // Giro sobre eje Y: 0deg mira →, 180deg mira ←.
        { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
      ],
      // Solo un fade breve al reaparecer en el origen, para que el "salto" del
      // fin del loop al inicio no se note; el resto del trayecto va visible.
      opacity: interpolate(progress.value, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
    };
  });

  return (
    <View className="flex-1 justify-center px-2" onLayout={onLayout} style={{ height: ICON }}>
      {/* Línea discontinua tenue con desvanecido hacia el nodo destino. */}
      {width > 0 ? (
        <Svg width={width} height={2} style={{ position: "absolute", left: 0 }}>
          <Defs>
            <LinearGradient
              id="routeFade"
              x1={reverse ? "1" : "0"}
              y1="0"
              x2={reverse ? "0" : "1"}
              y2="0"
            >
              {/* Opaca en el origen, se desvanece al acercarse al destino. */}
              <Stop offset="0" stopColor={colores.muted} stopOpacity="0.35" />
              <Stop offset="0.6" stopColor={colores.muted} stopOpacity="0.18" />
              <Stop offset="1" stopColor={colores.muted} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Line
            x1="0"
            y1="1"
            x2={width}
            y2="1"
            stroke="url(#routeFade)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </Svg>
      ) : null}
      {/* Ícono que recorre la línea. */}
      <Animated.View style={[{ position: "absolute", left: 8 }, iconStyle]}>
        <SendHorizontal size={ICON} color={colores.primary} />
      </Animated.View>
    </View>
  );
}
