// src/utils/logoutUtils.ts

import { updatePreferences } from '@services/userApi';

/**
 * Met à jour le statut utilisateur à "offline" et effectue la déconnexion
 * Cette fonction doit être utilisée avant tous les appels à logout() pour garantir
 * que le statut soit bien persisté en base de données
 */
export const logoutWithStatusUpdate = async (): Promise<void> => {
  try {
    // Mettre à jour le statut à "offline" en base avant la déconnexion
    await updatePreferences({ status: 'offline' });
  } catch (error) {
    console.error(
      '[logoutUtils] Erreur lors de la mise à jour du statut à offline:',
      error
    );
    // Ne pas bloquer la déconnexion en cas d'erreur API
  }
};
