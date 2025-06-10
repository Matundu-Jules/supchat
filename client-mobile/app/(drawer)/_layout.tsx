// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { Image, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../../contexts/ThemeContext";

export default function DrawerLayout() {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <Drawer
      screenOptions={{
        headerLeft: () => (
          <Ionicons
            name="menu"
            size={28}
            style={{ marginLeft: 15 }}
            onPress={() => {}} // géré automatiquement par Drawer
          />
        ),
        headerTitle: () => (
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo-supchat-without-text-primary.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ paddingRight: 16 }}>
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        ),
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: isDark ? "#0d1117" : "#fff",
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  logo: {
    width: 120,
    height: 40,
  },
});
