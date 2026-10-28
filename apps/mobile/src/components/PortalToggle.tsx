import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../lib/cn";
import { usePortal, type Portal } from "../lib/portal";
import { portalPalettes } from "../lib/tokens";
import { Text } from "./ui";

const SEGMENT_WIDTH = 88;
const OPTIONS: { value: Portal; label: string }[] = [
  { value: "passenger", label: "Pasajero" },
  { value: "driver", label: "Conductor" },
];

/**
 * Control segmentado flotante para cambiar entre el portal de pasajero y el de
 * conductor. Solo aparece si el usuario tiene perfil de conductor.
 */
export function PortalToggle() {
  const { isDriver, portal, switching, setPortal } = usePortal();
  const insets = useSafeAreaInsets();
  const selected = switching ?? portal;

  // 0 = pasajero, 1 = conductor; mueve el thumb y mezcla su color.
  const position = useSharedValue(selected === "driver" ? 1 : 0);

  useEffect(() => {
    position.value = withSpring(selected === "driver" ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [selected, position]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * SEGMENT_WIDTH }],
    backgroundColor: interpolateColor(
      position.value,
      [0, 1],
      [portalPalettes.passenger.primary, portalPalettes.driver.primary],
    ),
  }));

  if (!isDriver) return null;

  return (
    <View
      accessibilityRole="tablist"
      style={{ top: insets.top + 8 }}
      className="absolute right-4 z-10 flex-row rounded-full bg-ink p-1"
    >
      <Animated.View
        style={[{ width: SEGMENT_WIDTH }, thumbStyle]}
        className="absolute bottom-1 left-1 top-1 rounded-full"
      />
      {OPTIONS.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Modo ${option.label.toLowerCase()}`}
            onPress={() => !active && setPortal(option.value)}
            disabled={switching !== null}
            style={{ width: SEGMENT_WIDTH }}
            className="items-center py-1.5"
          >
            <Text
              className={cn("font-sora-semibold text-xs", active ? "text-white" : "text-subtle")}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
