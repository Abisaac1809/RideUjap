import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Check, MapPin, TriangleAlert, X } from "lucide-react-native";
import type { PlaceDetails, PlaceSuggestion } from "@rideujap/shared";

import { ApiError, retrievePlace, suggestPlaces } from "../lib/api";
import { colores } from "../lib/tokens";
import { Input, Text } from "./ui";

export interface PlacePickerProps {
  label?: string;
  placeholder?: string;
  value: PlaceDetails | null;
  onChange: (place: PlaceDetails | null) => void;
  error?: string;
}

const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

function newSession(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "results"; items: PlaceSuggestion[] };

export function PlacePicker({ label, placeholder, value, onChange, error }: PlacePickerProps) {
  const [query, setQuery] = useState(value?.text ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const session = useRef(newSession());
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const q = query.trim();
    if (q.length < MIN_CHARS) {
      setStatus({ kind: "idle" });
      return;
    }

    const timer = setTimeout(async () => {
      setStatus({ kind: "loading" });
      try {
        const items = await suggestPlaces(q, session.current);
        setStatus({ kind: "results", items });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "No pudimos buscar lugares ahora.";
        setStatus({ kind: "error", message });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  async function onPick(suggestion: PlaceSuggestion) {
    skipNextSearch.current = true;
    setQuery(suggestion.name);
    setStatus({ kind: "idle" });
    try {
      const place = await retrievePlace(suggestion.id, session.current);
      onChange(place);
      const text = place.text || suggestion.name;
      if (text !== suggestion.name) {
        skipNextSearch.current = true;
        setQuery(text);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No pudimos ubicar ese lugar.";
      setStatus({ kind: "error", message });
    } finally {
      session.current = newSession();
    }
  }

  function onClear() {
    skipNextSearch.current = true;
    setQuery("");
    setStatus({ kind: "idle" });
    onChange(null);
  }

  const selected = value !== null && query === value.text;

  return (
    <View className="gap-2">
      <Input
        label={label}
        placeholder={placeholder ?? "Ej. Sambil Valencia, C.C. Metrópolis…"}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (value) onChange(null);
        }}
        autoCorrect={false}
        error={error}
        leftIcon={
          selected ? (
            <Check size={18} color={colores.primary} />
          ) : (
            <MapPin size={18} color={colores.muted} />
          )
        }
        rightIcon={
          query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Borrar"
              onPress={onClear}
              hitSlop={8}
            >
              <X size={18} color={colores.muted} />
            </Pressable>
          ) : null
        }
      />

      {status.kind === "loading" ? (
        <View className="flex-row items-center gap-2 px-1">
          <ActivityIndicator size="small" color={colores.muted} />
          <Text variant="muted">Buscando…</Text>
        </View>
      ) : null}

      {status.kind === "error" ? (
        <View className="flex-row items-center gap-2 px-1">
          <TriangleAlert size={16} color={colores.muted} />
          <Text variant="muted" className="flex-1">
            {status.message}
          </Text>
        </View>
      ) : null}

      {status.kind === "results" ? (
        status.items.length === 0 ? (
          <Text variant="muted" className="px-1">
            Sin resultados para “{query.trim()}”.
          </Text>
        ) : (
          <View className="overflow-hidden rounded-control border border-line bg-white">
            {status.items.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => onPick(item)}
                className={
                  index > 0 ? "border-t border-line active:bg-surface" : "active:bg-surface"
                }
              >
                <View className="flex-row items-center gap-3 px-3 py-3">
                  <MapPin size={16} color={colores.muted} />
                  <View className="flex-1">
                    <Text variant="body" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.address ? (
                      <Text variant="muted" numberOfLines={1}>
                        {item.address}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )
      ) : null}
    </View>
  );
}
