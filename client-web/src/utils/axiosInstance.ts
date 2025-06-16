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

    // Ne pas essayer de rafraîchir le token sur les routes de login/register
    const isAuthRoute =
      orig.url?.includes('/auth/login') ||
      orig.url?.includes('/auth/register') ||
      orig.url?.includes('/auth/google-login') ||
      orig.url?.includes('/auth/facebook-login');

    if (err.response?.status === 401 && !orig._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber(() => resolve(api(orig)));
        });
      }

      orig._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        await fetchCsrfToken();
        store.dispatch(setAuth());
        onRefreshed();
        return api(orig);
      } catch (e) {
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
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
