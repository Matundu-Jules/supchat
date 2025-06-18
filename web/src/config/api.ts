// src/config/api.ts

/**
 * Configuration API pour SupChat client-web
 * Utilise les variables d'environnement Vite pour la détection automatique d'IP
 */

// URL de base du backend - utilise la variable d'environnement générée automatiquement
export const BACKEND_URL =
  import.meta.env['VITE_BACKEND_URL'] || 'http://localhost:3000';

// URL de l'API - ajout du préfixe /api
export const API_BASE_URL =
  import.meta.env['VITE_API_URL'] || `${BACKEND_URL}/api`;

// URL des WebSockets/Socket.io
export const SOCKET_URL = import.meta.env['VITE_SOCKET_URL'] || BACKEND_URL;

// IP de l'hôte pour référence
export const HOST_IP = import.meta.env['VITE_HOST_IP'] || 'localhost';

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
  socketURL: SOCKET_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
