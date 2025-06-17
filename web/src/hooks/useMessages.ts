import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/store";
import {
  fetchMessages,
  addMessage,
  editMessage,
  deleteMessage,
  pushMessage,
  replaceMessage,
  removeMessageLocal,
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

  const update = async (
    id: string,
    text: string,
    file?: File | null
  ) => {
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
    if (!socket) return;
    const added = (msg: any) => {
      dispatch(pushMessage(msg));
    };
    const edited = (msg: any) => {
      dispatch(replaceMessage(msg));
    };
    const removed = (data: any) => {
      dispatch(removeMessageLocal(data._id));
    };
    socket.on("newMessage", added);
    socket.on("messageEdited", edited);
    socket.on("messageDeleted", removed);
    return () => {
      socket.off("newMessage", added);
      socket.off("messageEdited", edited);
      socket.off("messageDeleted", removed);
    };
  }, [socket, dispatch]);

  return { messages, loading, error, send, update, remove };
}
