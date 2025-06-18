/**
 * Gestionnaire centralisé pour les préférences utilisateur
 * Gère la cohérence entre Redux, localStorage, et l'API
 */

import { Dispatch } from '@reduxjs/toolkit';
import {
  initializePreferences,
  setTheme,
  setStatus,
  resetPreferences,
  Theme,
  Status,
} from '@store/preferencesSlice';
import { updatePreferences, getPreferences } from '@services/userApi';

export class PreferencesManager {
  private dispatch: Dispatch;

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /**
   * Initialise les préférences au démarrage de l'application
   */
  async initializeUserPreferences(): Promise<void> {
    try {
      // Charger les préférences depuis l'API
      const serverPrefs = await getPreferences();

      // Utiliser la logique d'initialisation qui gère localStorage vs serveur
      this.dispatch(
        initializePreferences({
          theme: serverPrefs.theme || 'light',
          status: serverPrefs.status || 'online',
        })
      );

      // Si le thème local est différent du serveur, synchroniser
      const localTheme = localStorage.getItem('theme') as Theme;
      if (localTheme && localTheme !== serverPrefs.theme) {
        await this.updateTheme(localTheme, false); // false = pas de mise à jour localStorage
      }
    } catch (error) {
      console.warn("Erreur lors de l'initialisation des préférences:", error);
      // Utiliser les valeurs par défaut avec le thème local si disponible
      const localTheme = (localStorage.getItem('theme') as Theme) || 'light';
      this.dispatch(
        initializePreferences({
          theme: localTheme,
          status: 'online',
        })
      );
    }
  }

  /**
   * Met à jour le thème utilisateur
   */
  async updateTheme(
    newTheme: Theme,
    updateLocalStorage: boolean = true
  ): Promise<boolean> {
    try {
      // Mettre à jour Redux (qui gère automatiquement localStorage et DOM)
      this.dispatch(setTheme(newTheme));

      // Synchroniser avec l'API
      await updatePreferences({ theme: newTheme });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thème:', error);
      return false;
    }
  }

  /**
   * Met à jour le statut utilisateur
   */
  async updateStatus(newStatus: Status): Promise<boolean> {
    const previousStatus = this.getCurrentStatus();

    try {
      // Mettre à jour Redux immédiatement pour la réactivité
      this.dispatch(setStatus(newStatus));

      // Synchroniser avec l'API
      await updatePreferences({ status: newStatus });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      // Revenir au statut précédent en cas d'erreur
      this.dispatch(setStatus(previousStatus));
      return false;
    }
  }

  /**
   * Réinitialise toutes les préférences (à la déconnexion)
   */
  resetAllPreferences(): void {
    this.dispatch(resetPreferences());
  }

  /**
   * Synchronise les préférences avec le serveur
   */
  async syncWithServer(): Promise<boolean> {
    try {
      const serverPrefs = await getPreferences();
      const localTheme = localStorage.getItem('theme') as Theme;

      // Si le thème local est différent, le synchroniser avec le serveur
      if (localTheme && localTheme !== serverPrefs.theme) {
        await updatePreferences({ theme: localTheme });
      }

      // Mettre à jour le statut depuis le serveur (toujours prioritaire)
      this.dispatch(setStatus(serverPrefs.status || 'online'));

      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return false;
    }
  }

  /**
   * Utilitaires pour obtenir les préférences actuelles
   */
  private getCurrentStatus(): Status {
    // En cas d'erreur, cette méthode devrait être appelée avec le state Redux
    // Pour l'instant, on retourne une valeur par défaut
    return 'online';
  }
}

/**
 * Factory pour créer une instance du gestionnaire de préférences
 */
export const createPreferencesManager = (
  dispatch: Dispatch
): PreferencesManager => {
  return new PreferencesManager(dispatch);
};

/**
 * Hook pour utiliser le gestionnaire de préférences dans les composants
 */
export const usePreferencesManager = (dispatch: Dispatch) => {
  return createPreferencesManager(dispatch);
};
