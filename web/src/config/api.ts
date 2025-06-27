// src/config/api.ts

/**
 * Configuration API pour SupChat client-web
 * ARCHITECTURE DOCKER OBLIGATOIRE - Port 3000 uniquement
 */

// Une seule source de vérité : VITE_API_URL
export const SERVER_URL = 
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

// URL de l'API - avec préfixe /api
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// URL des WebSockets/Socket.io (même serveur que l'API, sans /api)
export const WEBSOCKET_URL = SERVER_URL;

// IP de l'hôte pour référence
export const HOST_IP = import.meta.env.VITE_HOST_IP || 'localhost';

// Configuration des endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CSRF: '/csrf-token',

  // Users
  USERS: '/users',
  PROFILE: '/users/profile',

  // Workspaces
  WORKSPACES: '/workspaces',
  JOIN_WORKSPACE: '/workspaces/join',

  // Channels
  CHANNELS: '/channels',
  CHANNEL_MESSAGES: (channelId: string) => `/channels/${channelId}/messages`,

  // Messages
  MESSAGES: '/messages',
  UPLOAD: '/upload',
} as const;

/**
 * Configuration complète de l'API
 */
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  socketURL: WEBSOCKET_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
