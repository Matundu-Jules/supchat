import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const socket = useSocket();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const reactions = useSelector((state: RootState) =>
    state.reactions.items.filter((r) => r.messageId === messageId)
  );

  const react = async (emoji: string) => {
    if (!currentUser) return;

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
    dispatch(fetchReactions(messageId));
  }, [dispatch, messageId]);

  useEffect(() => {
    if (!socket) return;
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
  }, [socket, dispatch, messageId]);

  return { reactions, react };
}
