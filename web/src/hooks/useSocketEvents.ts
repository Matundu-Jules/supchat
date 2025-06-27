import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import {
  connectSocket,
  getSocket,
  joinRoom,
  leaveRoom,
  disconnectSocket,
} from '@services/socket';
import {
  pushMessage,
  replaceMessage,
  removeMessageLocal,
} from '@store/messagesSlice';
import { addChannel, editChannel, removeChannel } from '@store/channelsSlice';

/**
 * Hook pour brancher les listeners Socket.io et dispatcher Redux
 * @param workspaceId string
 * @param channelId string | undefined
 */
export function useSocketEvents(workspaceId: string, channelId?: string) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;
    // Connexion socket (token JWT dans localStorage ou user)
    const token = (user as any).token || localStorage.getItem('token');
    if (!token) return;
    const socket = connectSocket(token);
    // Join workspace room
    joinRoom(`workspace:${workspaceId}`);
    if (channelId) joinRoom(`channel:${channelId}`);

    // Messages
    socket.on('message:new', (msg) => dispatch(pushMessage(msg)));
    socket.on('message:updated', (msg) => dispatch(replaceMessage(msg)));
    socket.on('message:deleted', (id) => dispatch(removeMessageLocal(id)));
    // Channels (on met à jour le state localement, pas via fulfilled)
    socket.on('channel:created', (ch) =>
      dispatch({ type: 'channels/addLocal', payload: ch })
    );
    socket.on('channel:updated', (ch) =>
      dispatch({ type: 'channels/editLocal', payload: ch })
    );
    socket.on('channel:deleted', (id) =>
      dispatch({ type: 'channels/removeLocal', payload: id })
    );

    // Gestion reconnexion : rejoin rooms
    socket.on('reconnect', () => {
      joinRoom(`workspace:${workspaceId}`);
      if (channelId) joinRoom(`channel:${channelId}`);
    });

    return () => {
      if (channelId) leaveRoom(`channel:${channelId}`);
      leaveRoom(`workspace:${workspaceId}`);
      // Débrancher listeners
      socket.off('message:new');
      socket.off('message:updated');
      socket.off('message:deleted');
      socket.off('channel:created');
      socket.off('channel:updated');
      socket.off('channel:deleted');
      socket.off('reconnect');
    };
  }, [user, workspaceId, channelId, dispatch]);
}
