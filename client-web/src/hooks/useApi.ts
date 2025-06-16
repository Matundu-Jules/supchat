// src/hooks/useApi.ts

import { useEffect, useState } from 'react';
import { API_BASE_URL, SOCKET_URL, HOST_IP } from '../config/api';

interface ApiStatus {
  isConnected: boolean;
  lastChecked: Date | null;
  error: string | null;
  apiUrl: string;
  socketUrl: string;
  hostIp: string;
}

/**
 * Hook personnalisé pour gérer la connexion API avec détection automatique d'IP
 */
export const useApi = () => {
  const [status, setStatus] = useState<ApiStatus>({
    isConnected: false,
    lastChecked: null,
    error: null,
    apiUrl: API_BASE_URL,
    socketUrl: SOCKET_URL,
    hostIp: HOST_IP,
  });

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        credentials: 'include',
      });

      const isConnected = response.ok;
      setStatus((prev) => ({
        ...prev,
        isConnected,
        lastChecked: new Date(),
        error: isConnected ? null : `HTTP ${response.status}`,
      }));

      return isConnected;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur de connexion';
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage,
      }));
      return false;
    }
  };

  // Vérification automatique au montage du composant
  useEffect(() => {
    checkConnection();
  }, []);

  return {
    ...status,
    checkConnection,
    refreshConnection: checkConnection,
  };
};

/**
 * Hook pour afficher les informations de debug de l'API
 */
export const useApiDebug = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('\n🔗 SupChat Client Web - Configuration API:');
      console.log('==========================================');
      console.log('API Base URL:', API_BASE_URL);
      console.log('Socket URL:', SOCKET_URL);
      console.log('Host IP:', HOST_IP);
      console.log('Environment:', import.meta.env.MODE);

      // Vérification de la configuration
      if (
        API_BASE_URL.includes('localhost') ||
        API_BASE_URL.includes('127.0.0.1')
      ) {
        console.warn('⚠️  Configuration localhost détectée');
        console.log(
          '💡 Pour tester sur mobile, lancez: node scripts/update-env.js'
        );
      } else {
        console.log('✅ Configuration IP réseau - Compatible mobile');
      }
      console.log('==========================================\n');
    }
  }, []);

  return {
    apiUrl: API_BASE_URL,
    socketUrl: SOCKET_URL,
    hostIp: HOST_IP,
    isDev: import.meta.env.DEV,
  };
};

export default useApi;
