import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// 1. Récupérer les URLs depuis les variables d'environnement Vite
const API_URL = import.meta.env.VITE_API_URL; // ex: http://localhost:3000/api
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // ex: http://localhost:3000

// 2. Vérification critique au démarrage de l'application
if (!API_URL || !SOCKET_URL) {
  console.error(
    'FATAL ERROR: Environment variables not defined. Make sure API_URL and SOCKET_URL are in the root .env and mapped to VITE_API_URL/VITE_SOCKET_URL in Docker Compose.'
  );
}

// 3. Créer et exporter une instance Axios configurée
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies (sessions, etc.)
});

// 4. Créer et exporter une instance du client Socket.IO
// autoConnect: false -> Permet de contrôler manuellement la connexion
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
