import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@store/store';
import {
  fetchReactions,
  sendReaction,
  deleteReaction,
  pushReaction,
  removeReactionLocal,
} from '@store/reactionsSlice';
import { useSocket } from '@hooks/useSocket';

export function useReactions(messageId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { socket, isConnected } = useSocket();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Créer un sélecteur mémoïsé pour éviter les re-rendus inutiles
  const selectReactionsByMessageId = useMemo(
    () =>
      createSelector(
        [(state: RootState) => state.reactions.items, () => messageId],
        (reactions, messageId) =>
          reactions.filter((r) => r.messageId === messageId)
      ),
    [messageId]
  );

  const reactions = useSelector(selectReactionsByMessageId);
  const react = async (emoji: string) => {
    if (!currentUser) return;

    // Ne pas permettre les réactions sur les messages temporaires
    if (!messageId || messageId.startsWith('temp-')) {
      console.warn(
        "⚠️ Impossible d'ajouter une réaction à un message temporaire"
      );
      return;
    }

    const userId = (currentUser as any).id || (currentUser as any)._id;

    // Vérifier si l'utilisateur a déjà cette réaction
    const existingReaction = reactions.find(
      (r: any) => r.userId === userId && r.emoji === emoji
    );

    if (existingReaction) {
      // Supprimer la réaction existante
      await dispatch(deleteReaction(existingReaction._id));
    } else {
      // Ajouter une nouvelle réaction
      await dispatch(sendReaction({ messageId, emoji }));
    }
  };
  useEffect(() => {
    // Ne pas charger les réactions pour les messages temporaires
    if (!messageId || messageId.startsWith('temp-')) {
      return;
    }

    dispatch(fetchReactions(messageId));
  }, [dispatch, messageId]);
  useEffect(() => {
    if (!socket) {
      console.log('[useReactions] Socket non disponible, attente...');
      return;
    }

    if (!isConnected) {
      console.log(
        '[useReactions] Socket non connecté, attente de la connexion...'
      );
      return;
    }

    console.log(
      '[useReactions] Initialisation des écouteurs de réactions WebSocket'
    );

    const added = (r: any) => {
      if (r.messageId === messageId) dispatch(pushReaction(r));
    };
    const removed = (r: any) => {
      if (r.messageId === messageId) dispatch(removeReactionLocal(r._id));
    };
    socket.on('reactionAdded', added);
    socket.on('reactionRemoved', removed);
    return () => {
      socket.off('reactionAdded', added);
      socket.off('reactionRemoved', removed);
    };
  }, [socket, isConnected, dispatch, messageId]);

  return { reactions, react };
}
