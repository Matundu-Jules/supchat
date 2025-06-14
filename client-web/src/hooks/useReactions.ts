import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/store";
import {
  fetchReactions,
  sendReaction,
  pushReaction,
  removeReactionLocal,
} from "@store/reactionsSlice";
import { useSocket } from "@hooks/useSocket";

export function useReactions(messageId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket();

  const reactions = useSelector((state: RootState) =>
    state.reactions.items.filter((r) => r.messageId === messageId)
  );

  const react = async (emoji: string) => {
    await dispatch(sendReaction({ messageId, emoji }));
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
    socket.on("reactionAdded", added);
    socket.on("reactionRemoved", removed);
    return () => {
      socket.off("reactionAdded", added);
      socket.off("reactionRemoved", removed);
    };
  }, [socket, dispatch, messageId]);

  return { reactions, react };
}
