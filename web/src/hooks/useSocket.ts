
import { useContext } from 'react';
import { SocketContext, SocketContextType } from '@contexts/SocketContext';

/**
 * Hook personnalisé pour accéder au contexte du WebSocket.
 * Fournit l'instance de la socket et l'état de la connexion.
 *
 * @returns {SocketContextType} L'objet contenant la socket et l'état de connexion.
 * @throws {Error} Si le hook est utilisé en dehors d'un SocketProvider.
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
