import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(channelId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_WEBSOCKET_URL as string, {
      withCredentials: true,
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !channelId) return;
    socket.emit("joinChannel", channelId);
    return () => {
      socket.emit("leaveChannel", channelId);
    };
  }, [socket, channelId]);

  return socket;
}
