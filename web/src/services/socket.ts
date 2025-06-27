// Service Socket.io client SUPCHAT
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) return socket;
  socket = io(import.meta.env['VITE_API_URL'], {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    transports: ['websocket'],
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(room: string) {
  if (socket) socket.emit('join', room);
}

export function leaveRoom(room: string) {
  if (socket) socket.emit('leave', room);
}
