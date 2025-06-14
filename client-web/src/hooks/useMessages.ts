import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/store";
import {
  fetchMessages,
  addMessage,
  pushMessage,
} from "@store/messagesSlice";
import { useSocket } from "@hooks/useSocket";

export function useMessages(channelId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket(channelId);

  const messages = useSelector((state: RootState) => state.messages.items);
  const loading = useSelector((state: RootState) => state.messages.loading);
  const error = useSelector((state: RootState) => state.messages.error);

  const send = async (text: string, file?: File | null) => {
    if (!channelId) return;
    await dispatch(addMessage({ channelId, text, file }));
  };

  useEffect(() => {
    if (channelId) {
      dispatch(fetchMessages(channelId));
    }
  }, [channelId, dispatch]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: any) => {
      dispatch(pushMessage(msg));
    };
    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, dispatch]);

  return { messages, loading, error, send };
}
