// Configuration API centralisée
import { API_BASE_URL } from './network';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/auth/me`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  resetPassword: `${API_BASE_URL}/auth/reset-password`,

  // Workspaces
  workspaces: `${API_BASE_URL}/workspaces`,

  // Channels
  channels: `${API_BASE_URL}/channels`,

  // Messages
  messages: `${API_BASE_URL}/messages`,

  // Permissions
  permissions: `${API_BASE_URL}/permissions`,
};

export { API_BASE_URL };
