import "./global.css";

import { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import {
  BottomNavbar,
  Button,
  Card,
  Checkbox,
  Input,
  Text,
  Toggle,
  type NavItem,
} from "./src/components/ui";

const navItems: NavItem[] = [
  { key: "inicio", label: "Inicio" },
  { key: "viajes", label: "Viajes" },
  { key: "perfil", label: "Perfil" },
];

export default function App() {
  const [nombre, setNombre] = useState("");
  const [notificaciones, setNotificaciones] = useState(true);
  const [acepto, setAcepto] = useState(false);
  const [tab, setTab] = useState("inicio");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text variant="title">RideUJAP</Text>
    </SafeAreaView>
  );
}
