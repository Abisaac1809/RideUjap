import { Alert, Platform } from "react-native";

// Alert.alert es un no-op en react-native-web; en web caemos a window.alert.
export function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
