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
import { RootState } from '@store/store';

export class PreferencesManager {
  private dispatch: Dispatch;
  private getState: () => RootState;

  constructor(dispatch: Dispatch, getState: () => RootState) {
    this.dispatch = dispatch;
    this.getState = getState;
  }
  /**
   * Initialise les préférences au démarrage de l'application
   * PRIORITÉ: Serveur (BDD) > localStorage utilisateur > défaut
   */
  async initializeUserPreferences(): Promise<void> {
    try {
      // Récupérer l'utilisateur actuel depuis le state Redux
      const state = this.getState();
      const currentUser = state.auth.user;

      if (!currentUser) {
        console.warn(
          "Aucun utilisateur connecté, impossible d'initialiser les préférences"
        );
        return;
      }

      // Utiliser l'email comme identifiant utilisateur unique
      const userId = currentUser.email;

      // Charger les préférences depuis l'API (BDD = source de vérité)
      const serverPrefs = await getPreferences();

      // IMPORTANT: Toujours utiliser les valeurs du serveur (BDD)
      // Le serveur contient les vraies préférences de l'utilisateur connecté
      this.dispatch(
        initializePreferences({
          userId,
          theme: serverPrefs.theme || 'light',
          status: serverPrefs.status || 'online',
          forceServerValues: true, // Forcer les valeurs du serveur
        })
      );
    } catch (error) {
      console.warn("Erreur lors de l'initialisation des préférences:", error);

      // En cas d'erreur serveur, utiliser les valeurs par défaut uniquement
      const state = this.getState();
      const currentUser = state.auth.user;

      if (currentUser) {
        const userId = currentUser.email;
        this.dispatch(
          initializePreferences({
            userId,
            theme: 'light', // Valeur par défaut
            status: 'online', // Valeur par défaut
            forceServerValues: true,
          })
        );
      }
    }
  }
  /**
   * Met à jour le thème utilisateur
   */
  async updateTheme(newTheme: Theme): Promise<boolean> {
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
   * Récupère UNIQUEMENT les préférences depuis le serveur (BDD)
   */
  async syncWithServer(): Promise<boolean> {
    try {
      const state = this.getState();
      const currentUser = state.auth.user;

      if (!currentUser) {
        console.warn('Aucun utilisateur connecté pour la synchronisation');
        return false;
      }

      const userId = currentUser.email;

      // Récupérer les préférences depuis le serveur (source de vérité)
      const serverPrefs = await getPreferences();

      // Mettre à jour Redux avec les valeurs du serveur uniquement
      this.dispatch(setTheme(serverPrefs.theme || 'light'));
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
    const state = this.getState();
    return state.preferences.status;
  }
}

/**
 * Factory pour créer une instance du gestionnaire de préférences
 */
export const createPreferencesManager = (
  dispatch: Dispatch,
  getState: () => RootState
): PreferencesManager => {
  return new PreferencesManager(dispatch, getState);
};

/**
 * Hook pour utiliser le gestionnaire de préférences dans les composants
 */
export const usePreferencesManager = (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  return createPreferencesManager(dispatch, getState);
};
