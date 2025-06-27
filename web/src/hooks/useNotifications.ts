import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/store';
import {
  fetchNotifications,
  markRead,
  pushNotification,
} from '@store/notificationsSlice';
import { useSocket } from '@hooks/useSocket';

export function useNotifications(userId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { socket, isConnected } = useSocket(undefined, userId);

  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );
  const unread = useSelector((state: RootState) => state.notifications.unread);

  const markAsRead = async (id: string) => {
    await dispatch(markRead(id));
  };

  useEffect(() => {
    dispatch(fetchNotifications());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[useNotifications] Socket non disponible ou non connecté');
      return;
    }

    const handler = (n: any) => {
      dispatch(pushNotification(n));
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket, isConnected, dispatch]);

  return { notifications, unread, markAsRead };
}
