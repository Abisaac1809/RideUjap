import { Linking } from "react-native";

export function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `58${digits.slice(1)}` : digits;
  Linking.openURL(`https://wa.me/${intl}`);
}
