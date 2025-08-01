// utils/axiosConfig.ts
import axios from 'axios';
import { AuthService } from '../services/authService';
import { API_BASE_URL } from '../constants/network'; // Utiliser network.ts pour la cohérence

// Affichage de la configuration en développement
if (__DEV__) {
  console.log('🔧 Axios Config - API Base URL:', API_BASE_URL);
}

// Configuration de base avec URL automatique
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AuthService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'auth
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AuthService.logout();
      // Ici on pourrait rediriger vers le login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
