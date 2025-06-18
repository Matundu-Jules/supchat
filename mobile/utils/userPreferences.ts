/**
 * Utilitaires pour gérer les préférences par utilisateur sur mobile
 * Utilise AsyncStorage avec des clés spécifiques à chaque utilisateur
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';
export type StatusType = 'online' | 'away' | 'busy' | 'offline';

interface UserPreferences {
  theme: ThemeType;
  status: StatusType;
}

/**
 * Génère une clé AsyncStorage spécifique à l'utilisateur
 */
const getUserKey = (userId: string, key: string): string => {
  return `user_${userId}_${key}`;
};

/**
 * Récupère les préférences d'un utilisateur depuis AsyncStorage
 */
export const getUserPreferences = async (
  userId: string
): Promise<Partial<UserPreferences>> => {
  try {
    const [theme, status] = await Promise.all([
      AsyncStorage.getItem(getUserKey(userId, 'theme')),
      AsyncStorage.getItem(getUserKey(userId, 'status')),
    ]);

    return {
      ...(theme && { theme: theme as ThemeType }),
      ...(status && { status: status as StatusType }),
    };
  } catch (error) {
    console.warn(
      'Erreur lors de la lecture des préférences utilisateur:',
      error
    );
    return {};
  }
};

/**
 * Sauvegarde le thème d'un utilisateur dans AsyncStorage
 */
export const setUserTheme = async (
  userId: string,
  theme: ThemeType
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getUserKey(userId, 'theme'), theme);
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde du thème utilisateur:', error);
  }
};

/**
 * Sauvegarde le statut d'un utilisateur dans AsyncStorage
 */
export const setUserStatus = async (
  userId: string,
  status: StatusType
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getUserKey(userId, 'status'), status);
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde du statut utilisateur:', error);
  }
};

/**
 * Supprime toutes les préférences d'un utilisateur d'AsyncStorage
 */
export const clearUserPreferences = async (userId: string): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(getUserKey(userId, 'theme')),
      AsyncStorage.removeItem(getUserKey(userId, 'status')),
    ]);
  } catch (error) {
    console.warn(
      'Erreur lors de la suppression des préférences utilisateur:',
      error
    );
  }
};

/**
 * Migre les préférences de l'ancien système global vers le système par utilisateur
 */
export const migrateGlobalPreferences = async (
  userId: string
): Promise<void> => {
  try {
    // Récupérer les anciennes préférences globales
    const [oldTheme, oldStatus] = await Promise.all([
      AsyncStorage.getItem('theme'),
      AsyncStorage.getItem('status'),
    ]);

    // Les migrer vers le système par utilisateur si elles existent
    if (oldTheme) {
      await setUserTheme(userId, oldTheme as ThemeType);
      await AsyncStorage.removeItem('theme'); // Supprimer l'ancienne
    }

    if (oldStatus) {
      await setUserStatus(userId, oldStatus as StatusType);
      await AsyncStorage.removeItem('status'); // Supprimer l'ancienne
    }
  } catch (error) {
    console.warn('Erreur lors de la migration des préférences:', error);
  }
};

/**
 * Nettoie toutes les préférences utilisateur d'AsyncStorage
 */
export const clearAllUserPreferences = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const userKeys = keys.filter(
      (key) =>
        key.startsWith('user_') &&
        (key.includes('_theme') || key.includes('_status'))
    );

    // Supprimer toutes les clés utilisateur
    await AsyncStorage.multiRemove(userKeys);

    // Nettoyer aussi les anciennes clés globales si elles existent encore
    await AsyncStorage.multiRemove(['theme', 'status']);
  } catch (error) {
    console.warn('Erreur lors du nettoyage des préférences:', error);
  }
};
