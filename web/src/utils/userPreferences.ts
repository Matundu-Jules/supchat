/**
 * Utilitaires pour gérer le localStorage par utilisateur
 * Évite les conflits de préférences entre différents utilisateurs sur le même navigateur
 */

export type Theme = 'light' | 'dark';
export type Status = 'online' | 'away' | 'busy' | 'offline';

interface UserPreferences {
  theme: Theme;
  status: Status;
}

/**
 * Génère une clé localStorage spécifique à l'utilisateur
 */
const getUserKey = (userId: string, key: string): string => {
  return `user_${userId}_${key}`;
};

/**
 * Récupère les préférences d'un utilisateur depuis localStorage
 */
export const getUserPreferences = (
  userId: string
): Partial<UserPreferences> => {
  try {
    const theme = localStorage.getItem(getUserKey(userId, 'theme')) as Theme;
    const status = localStorage.getItem(getUserKey(userId, 'status')) as Status;

    return {
      ...(theme && { theme }),
      ...(status && { status }),
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
 * Sauvegarde le thème d'un utilisateur dans localStorage
 */
export const setUserTheme = (userId: string, theme: Theme): void => {
  try {
    localStorage.setItem(getUserKey(userId, 'theme'), theme);
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde du thème utilisateur:', error);
  }
};

/**
 * Sauvegarde le statut d'un utilisateur dans localStorage (pour cache local uniquement)
 */
export const setUserStatus = (userId: string, status: Status): void => {
  try {
    // Note: Le statut est principalement géré en BDD,
    // localStorage sert juste de cache local pour éviter les conflits
    localStorage.setItem(getUserKey(userId, 'status'), status);
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde du statut utilisateur:', error);
  }
};

/**
 * Supprime toutes les préférences d'un utilisateur du localStorage
 */
export const clearUserPreferences = (userId: string): void => {
  try {
    localStorage.removeItem(getUserKey(userId, 'theme'));
    localStorage.removeItem(getUserKey(userId, 'status'));
  } catch (error) {
    console.warn(
      'Erreur lors de la suppression des préférences utilisateur:',
      error
    );
  }
};

/**
 * Nettoie les préférences de l'ancien système global
 */
export const migrateGlobalPreferences = (userId: string): void => {
  try {
    // Récupérer les anciennes préférences globales
    const oldTheme = localStorage.getItem('theme') as Theme;
    const oldStatus = localStorage.getItem('status') as Status;

    // Les migrer vers le système par utilisateur si elles existent
    if (oldTheme) {
      setUserTheme(userId, oldTheme);
      localStorage.removeItem('theme'); // Supprimer l'ancienne
    }

    if (oldStatus) {
      setUserStatus(userId, oldStatus);
      localStorage.removeItem('status'); // Supprimer l'ancienne
    }
  } catch (error) {
    console.warn('Erreur lors de la migration des préférences:', error);
  }
};

/**
 * Nettoie toutes les préférences utilisateur du localStorage (à la déconnexion complète)
 */
export const clearAllUserPreferences = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (
        key.startsWith('user_') &&
        (key.includes('_theme') || key.includes('_status'))
      ) {
        localStorage.removeItem(key);
      }
    });

    // Nettoyer aussi les anciennes clés globales si elles existent encore
    localStorage.removeItem('theme');
    localStorage.removeItem('status');
  } catch (error) {
    console.warn('Erreur lors du nettoyage des préférences:', error);
  }
};
