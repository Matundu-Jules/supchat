import { View, Text, Button, StyleSheet } from "react-native";
import { useThemeContext } from "../../contexts/ThemeContext";

export default function HomeScreen() {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0d1117" : "#f3f4f6" },
      ]}
    >
      <Text
        style={{
          color: isDark ? "#fff" : "#000",
          fontSize: 24,
          marginBottom: 20,
        }}
      >
        Bienvenue dans le menu
      </Text>
      <Button title="Changer le thème" onPress={toggleTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
