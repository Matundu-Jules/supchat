import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/store';
import {
  fetchMessages,
  addMessage,
  editMessage,
  deleteMessage,
  pushMessage,
  replaceMessage,
  removeMessageLocal,
} from '@store/messagesSlice';
import { useSocket } from '@hooks/useSocket';

export function useMessages(channelId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { socket, isConnected } = useSocket(channelId);

  const messages = useSelector((state: RootState) => state.messages.items);
  const loading = useSelector((state: RootState) => state.messages.loading);
  const error = useSelector((state: RootState) => state.messages.error);
  // 🔧 NOUVELLE FONCTION: Envoi de message via API uniquement
  const send = async (text: string, file?: File | null) => {
    if (!channelId || (!text?.trim() && !file)) return;

    try {
      // Envoyer via API (pour la persistance et l'émission WebSocket côté serveur)
      await dispatch(addMessage({ channelId, text, file }));
    } catch (err) {
      console.error('[useMessages] Erreur envoi message:', err);
      throw err;
    }
  };

  const update = async (id: string, text: string, file?: File | null) => {
    await dispatch(editMessage({ id, text, file }));
  };

  const remove = async (id: string) => {
    await dispatch(deleteMessage(id));
  };

  useEffect(() => {
    if (channelId) {
      dispatch(fetchMessages(channelId));
    }
  }, [channelId, dispatch]);
  useEffect(() => {
    // 🔧 CORRECTION: Gestion défensive - vérifier que socket existe ET est connecté
    if (!socket) {
      console.log('[useMessages] Socket non disponible, attente...', {
        channelId,
        socketExists: !!socket,
        isConnected
      });
      return;
    }

    if (!isConnected) {
      console.log(
        '[useMessages] Socket non connecté, attente de la connexion...',
        { channelId, socketId: socket.id, connected: socket.connected }
      );
      return;
    }

    console.log(
      "[useMessages] Initialisation des écouteurs d'événements WebSocket",
      { channelId, socketId: socket.id, connected: socket.connected }
    );    // 🔧 CORRECTION: Utiliser les bons noms d'événements
    const handleNewMessage = (msg: any) => {
      console.log('🚀 [useMessages] NOUVEAU MESSAGE REÇU VIA WEBSOCKET:', msg);
      console.log('🚀 [useMessages] Type de message:', typeof msg);
      console.log('🚀 [useMessages] Structure complète:', JSON.stringify(msg, null, 2));
      console.log('🚀 [useMessages] ID du message:', msg._id);
      console.log('🚀 [useMessages] Texte du message:', msg.text || msg.content);
      
      dispatch(pushMessage(msg));
      console.log('✅ [useMessages] Message ajouté au Redux store');
    };

    const handleMessageEdited = (msg: any) => {
      console.log('[useMessages] Message modifié:', msg);
      dispatch(replaceMessage(msg));
    };

    const handleMessageDeleted = (data: any) => {
      console.log('[useMessages] Message supprimé:', data);
      dispatch(removeMessageLocal(data.messageId || data._id));
    };

    const handleMessageSent = (data: any) => {
      console.log('[useMessages] Confirmation envoi message:', data);
      if (data.success && data.message) {
        dispatch(pushMessage(data.message));
      }
    };

    const handleError = (error: any) => {
      console.error('[useMessages] Erreur WebSocket:', error);
    };

    // Écouter les événements WebSocket avec les bons noms
    socket.on('new-message', handleNewMessage);
    socket.on('message-updated', handleMessageEdited);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('message-sent', handleMessageSent);
    socket.on('error', handleError);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-updated', handleMessageEdited);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('message-sent', handleMessageSent);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, dispatch]);

  return { messages, loading, error, send, update, remove };
}
