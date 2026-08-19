import { Pressable, View } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./Text";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Control segmentado de una sola selección, al estilo iOS. La pista usa la
 * superficie y el segmento activo se eleva en blanco con acento primario.
 */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View className="flex-row gap-1 rounded-control bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={cn(
              "h-10 flex-1 items-center justify-center rounded-[9px]",
              active && "bg-white shadow-sm",
            )}
          >
            <Text className={cn("font-semibold", active ? "text-primary" : "text-muted")}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
