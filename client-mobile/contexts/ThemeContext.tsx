import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = "light" | "dark";

const ThemeContext = createContext({
  theme: "light" as ThemeType,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const system = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(system || "light");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("theme");
      if (saved) setTheme(saved as ThemeType);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
