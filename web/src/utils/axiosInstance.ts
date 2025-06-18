// src/utils/axiosInstance.ts

import axios from 'axios';
import { store } from '@store/store';
import { logout, setAuth } from '@store/authSlice';
import { API_BASE_URL, getApiInfo } from '../config/api';

// Afficher les infos de configuration en développement
if (import.meta.env.DEV) {
  getApiInfo();
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchCsrfToken() {
  const res = await api.get('/csrf-token');
  return res.data.csrfToken;
}

let refreshSubscribers: Function[] = [];

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

function addSubscriber(callback: Function) {
  refreshSubscribers.push(callback);
}

api.interceptors.request.use((cfg) => {
  const csrf = getCookie('XSRF-TOKEN');
  if (csrf && /post|put|patch|delete/i.test(cfg.method || '')) {
    cfg.headers['X-CSRF-TOKEN'] = csrf;
  }
  return cfg;
});

let isRefreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;

    // Ne pas essayer de rafraîchir le token sur les routes d'authentification
    const isAuthRoute =
      orig.url?.includes('/auth/login') ||
      orig.url?.includes('/auth/register') ||
      orig.url?.includes('/auth/google-login') ||
      orig.url?.includes('/auth/facebook-login') ||
      orig.url?.includes('/auth/refresh') ||
      orig.url?.includes('/csrf-token');

    // Ne rafraîchir que pour les erreurs 401 (pas 403 ou autres)
    if (err.response?.status === 401 && !orig._retry && !isAuthRoute) {
      // Si déjà en cours de rafraîchissement, attendre
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addSubscriber(() => {
            resolve(api(orig));
          });
        });
      }

      orig._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Tentative de refresh du token...');

        // Essayer de rafraîchir le token
        const refreshResponse = await api.post('/auth/refresh');

        if (refreshResponse.status === 204) {
          console.log('✅ Token refreshed avec succès');
          // Récupérer un nouveau CSRF token
          await fetchCsrfToken();
          onRefreshed();
          isRefreshing = false;
          return api(orig);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError: any) {
        console.warn(
          '❌ Token refresh failed:',
          refreshError.response?.data?.message || refreshError.message
        );
        isRefreshing = false;

        // Ne déconnecter que si c'est vraiment un problème de token invalide
        // Pas si c'est juste "token manquant" (utilisateur pas connecté)
        const isTokenMissing =
          refreshError.response?.data?.message?.includes('manquant');

        if (!isTokenMissing) {
          store.dispatch(logout());

          // Rediriger vers login uniquement si on n'y est pas déjà
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(name + '='))
    ?.split('=')[1];
}

export default api;
