import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  getUserPreferences,
  setUserTheme,
  migrateGlobalPreferences,
  ThemeType,
} from "../utils/userPreferences";

const ThemeContext = createContext({
  theme: "light" as ThemeType,
  toggleTheme: () => {},
  syncThemeWithServer: async () => {},
  setCurrentUser: (userId: string, forceServerValues?: boolean) => {},
  currentUserId: null as string | null,
});

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const system = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(system || "light");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // Fonction pour définir l'utilisateur actuel et charger ses préférences
  const setCurrentUser = async (userId: string, forceServerValues = false) => {
    try {
      // FORCER la réinitialisation pour éviter les valeurs de l'utilisateur précédent
      setTheme(system || "light");
      setCurrentUserId(null);

      // Maintenant définir le nouvel utilisateur
      setCurrentUserId(userId);

      // Migrer les anciennes préférences globales si nécessaire
      await migrateGlobalPreferences(userId);

      if (forceServerValues) {
        // FORCER la synchronisation avec le serveur (nouveau login)
        await syncThemeWithServerForced(userId);
      } else {
        // Charger les préférences de cet utilisateur (changement en cours de session)
        const userPrefs = await getUserPreferences(userId);

        if (userPrefs.theme) {
          setTheme(userPrefs.theme);
        } else {
          // Si pas de préférence utilisateur, synchroniser avec le serveur
          await syncThemeWithServer(userId);
        }
      }
    } catch (error) {
      console.warn("Erreur lors du changement d'utilisateur:", error);
    }
  };

  // Synchronisation forcée avec le serveur (priorité serveur) pour un nouveau login
  const syncThemeWithServerForced = async (userId: string) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/user/preferences"
      );
      const serverTheme = (response.data as { theme: ThemeType }).theme;

      // FORCER l'utilisation du thème serveur
      const themeToUse = serverTheme || "light";
      setTheme(themeToUse);
      await setUserTheme(userId, themeToUse);
    } catch (error) {
      console.warn("Impossible de synchroniser avec le serveur:", error);
      // En cas d'erreur, utiliser le thème par défaut
      setTheme("light");
      await setUserTheme(userId, "light");
    }
  };

  // Synchronisation avec le serveur pour un utilisateur spécifique
  const syncThemeWithServer = async (userId?: string) => {
    try {
      const userIdToUse = userId || currentUserId;
      if (!userIdToUse) return;

      const response = await axios.get(
        "http://localhost:3000/api/user/preferences"
      );
      const serverTheme = (response.data as { theme: ThemeType }).theme;

      // Récupérer le thème local de cet utilisateur
      const userPrefs = await getUserPreferences(userIdToUse);
      const localTheme = userPrefs.theme;

      // Si le thème local est différent du serveur, priorité au local et sync serveur
      if (localTheme && localTheme !== serverTheme) {
        await axios.put("http://localhost:3000/api/user/preferences", {
          theme: localTheme,
        });
      } else if (serverTheme && !localTheme) {
        // Si pas de thème local mais thème serveur, utiliser le serveur
        setTheme(serverTheme);
        await setUserTheme(userIdToUse, serverTheme);
      }
    } catch (error) {
      console.warn("Impossible de synchroniser avec le serveur:", error);
    }
  };

  const toggleTheme = async () => {
    if (!currentUserId) return;

    const next = theme === "light" ? "dark" : "light";
    setTheme(next);

    // Sauvegarder pour l'utilisateur actuel
    await setUserTheme(currentUserId, next);

    // Synchroniser avec l'API
    try {
      await axios.put("http://localhost:3000/api/user/preferences", {
        theme: next,
      });
    } catch (error) {
      console.warn(
        "Impossible de synchroniser le thème avec le serveur:",
        error
      );
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        syncThemeWithServer,
        setCurrentUser,
        currentUserId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
