// src/utils/logoutUtils.ts

import { updatePreferences } from '@services/userApi';
import { store } from '@store/store';

/**
 * Met à jour le statut utilisateur à "offline" et effectue la déconnexion
 * Cette fonction doit être utilisée avant tous les appels à logout() pour garantir
 * que le statut soit bien persisté en base de données
 */
export const logoutWithStatusUpdate = async (): Promise<void> => {
  try {
    // 🔧 CORRECTION BOUCLE INFINIE: Ne pas essayer de mettre à jour le statut si l'utilisateur n'est pas authentifié
    const state = store.getState();
    const isAuthenticated = state.auth.isAuthenticated;

    if (isAuthenticated) {
      // Mettre à jour le statut à "offline" en base avant la déconnexion
      await updatePreferences({ status: 'offline' });
    } else {
      console.warn(
        '[logoutUtils] Utilisateur non authentifié - pas de mise à jour du statut pour éviter la boucle infinie'
      );
    }
  } catch (error) {
    console.error(
      '[logoutUtils] Erreur lors de la mise à jour du statut à offline:',
      error
    );
    // Ne pas bloquer la déconnexion en cas d'erreur API
  }
};
