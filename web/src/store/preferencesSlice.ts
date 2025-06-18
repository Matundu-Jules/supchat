import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getUserPreferences,
  setUserTheme,
  setUserStatus,
  clearUserPreferences,
  clearAllUserPreferences,
  migrateGlobalPreferences,
  Theme,
  Status,
} from '@utils/userPreferences';

interface PreferencesState {
  theme: Theme;
  status: Status;
  isLoaded: boolean;
  currentUserId: string | null;
}

const initialState: PreferencesState = {
  theme: 'light',
  status: 'online',
  isLoaded: false,
  currentUserId: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      // Sauvegarder le thème pour l'utilisateur actuel
      if (state.currentUserId) {
        setUserTheme(state.currentUserId, action.payload);
      }
      // Appliquer immédiatement le thème au DOM
      document.body.setAttribute('data-theme', action.payload);
    },

    setStatus(state, action: PayloadAction<Status>) {
      state.status = action.payload;
      // Sauvegarder le statut pour l'utilisateur actuel (cache local)
      if (state.currentUserId) {
        setUserStatus(state.currentUserId, action.payload);
      }
    },

    setCurrentUser(state, action: PayloadAction<string>) {
      state.currentUserId = action.payload;

      // Migrer les anciennes préférences globales si c'est la première fois
      migrateGlobalPreferences(action.payload);

      // Charger les préférences de cet utilisateur depuis localStorage
      const userPrefs = getUserPreferences(action.payload);
      if (userPrefs.theme) {
        state.theme = userPrefs.theme;
        document.body.setAttribute('data-theme', userPrefs.theme);
      }
      if (userPrefs.status) {
        state.status = userPrefs.status;
      }
    },
    initializePreferences(
      state,
      action: PayloadAction<{
        userId: string;
        theme: Theme;
        status: Status;
        forceServerValues?: boolean;
      }>
    ) {
      const {
        userId,
        theme: serverTheme,
        status: serverStatus,
        forceServerValues = false,
      } = action.payload;

      // FORCER la réinitialisation complète pour éviter les valeurs de l'utilisateur précédent
      state.theme = 'light';
      state.status = 'online';
      state.isLoaded = false;
      state.currentUserId = null;

      // Maintenant définir le nouvel utilisateur
      state.currentUserId = userId;

      // Migrer les anciennes préférences globales si nécessaire
      migrateGlobalPreferences(userId);

      // Récupérer les préférences locales de cet utilisateur
      const userPrefs = getUserPreferences(userId);
      const localTheme = userPrefs.theme;

      if (forceServerValues) {
        // Lors d'un nouveau login : forcer les valeurs du serveur
        state.theme = serverTheme;
        state.status = serverStatus;
      } else {
        // Pour le thème : priorité au localStorage de l'utilisateur si différent du serveur
        state.theme =
          localTheme && localTheme !== serverTheme ? localTheme : serverTheme;
        // Pour le statut : toujours utiliser la valeur du serveur
        state.status = serverStatus;
      }

      // Sauvegarder les valeurs finales dans localStorage
      setUserTheme(userId, state.theme);
      setUserStatus(userId, state.status);

      // Appliquer le thème au DOM
      document.body.setAttribute('data-theme', state.theme);

      state.isLoaded = true;
    },

    resetPreferences(state) {
      // Nettoyer les préférences de l'utilisateur actuel
      if (state.currentUserId) {
        clearUserPreferences(state.currentUserId);
      }

      state.theme = 'light';
      state.status = 'online';
      state.isLoaded = false;
      state.currentUserId = null;
      document.body.setAttribute('data-theme', 'light');
    },

    clearAllPreferences() {
      // Nettoyer toutes les préférences utilisateur (déconnexion complète du navigateur)
      clearAllUserPreferences();
    },
  },
});

export const {
  setTheme,
  setStatus,
  setCurrentUser,
  initializePreferences,
  resetPreferences,
  clearAllPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;

// Re-export des types pour faciliter l'importation
export type { Theme, Status };
