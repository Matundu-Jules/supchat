// hooks/useNetworkConfig.ts

import { useState, useEffect } from 'react';
import {
  API_BASE_URL,
  WS_BASE_URL,
  debugNetworkConfig,
} from '../constants/network';

interface NetworkStatus {
  isConnected: boolean;
  apiUrl: string;
  wsUrl: string;
  lastChecked: Date | null;
  error: string | null;
  hostIP: string | null;
}

/**
 * Hook personnalisé pour gérer la configuration réseau avec détection automatique d'IP
 */
export const useNetworkConfig = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    apiUrl: API_BASE_URL,
    wsUrl: WS_BASE_URL,
    lastChecked: null,
    error: null,
    hostIP: process.env.EXPO_PUBLIC_HOST || null,
  });

  const checkConnection = async () => {
    try {
      // Test simple de ping vers l'API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const isConnected = response.ok;
      setStatus((prev) => ({
        ...prev,
        isConnected,
        lastChecked: new Date(),
        error: isConnected
          ? null
          : `HTTP ${response.status} ${response.statusText}`,
      }));

      return isConnected;
    } catch (error) {
      let errorMessage = 'Erreur de connexion';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout de connexion (5s)';
        } else {
          errorMessage = error.message;
        }
      }

      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage,
      }));

      return false;
    }
  };

  // Affichage des infos de debug au montage
  useEffect(() => {
    if (__DEV__) {
      debugNetworkConfig();
    }

    // Test initial de connectivité
    checkConnection();
  }, []);

  return {
    ...status,
    checkConnection,
    refreshConnection: checkConnection,
  };
};

/**
 * Hook pour détecter si la configuration utilise localhost (problématique sur mobile)
 */
export const useIPValidation = () => {
  const isLocalhost =
    API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
  const hostIP = process.env.EXPO_PUBLIC_HOST;

  const getValidationStatus = () => {
    if (isLocalhost) {
      return {
        isValid: false,
        severity: 'error' as const,
        message:
          '⚠️ Configuration localhost détectée - Ne fonctionnera pas sur un vrai appareil mobile',
        suggestion:
          'Lancez "node scripts/update-env.js" sur votre ordinateur pour détecter automatiquement l\'IP',
      };
    }

    if (!hostIP) {
      return {
        isValid: false,
        severity: 'warning' as const,
        message: '⚠️ EXPO_PUBLIC_HOST non défini',
        suggestion: 'Définissez EXPO_PUBLIC_HOST dans votre fichier .env',
      };
    }

    return {
      isValid: true,
      severity: 'success' as const,
      message: '✅ Configuration IP réseau valide',
      suggestion: null,
    };
  };

  return {
    isLocalhost,
    hostIP,
    validation: getValidationStatus(),
  };
};

export default useNetworkConfig;
