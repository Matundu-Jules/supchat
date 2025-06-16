// Configuration réseau dynamique
import { Platform } from 'react-native';

// Configuration de l'host
const getApiHost = () => {
  // Priorité 1: URL complète dans l'env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priorité 2: Host + Port séparés
  if (process.env.EXPO_PUBLIC_HOST && process.env.EXPO_PUBLIC_PORT) {
    const host = process.env.EXPO_PUBLIC_HOST;
    const port = process.env.EXPO_PUBLIC_PORT;
    return `http://${host}:${port}/api`;
  }

  // Fallback par défaut - utilise les variables d'environnement par défaut
  const defaultHost = process.env.EXPO_PUBLIC_DEFAULT_HOST || 'localhost';
  const defaultPort = process.env.EXPO_PUBLIC_DEFAULT_PORT || '3000';
  return `http://${defaultHost}:${defaultPort}/api`;
};

// URL de base de l'API
export const API_BASE_URL = getApiHost();

// URL WebSocket
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws').replace(
  '/api',
  ''
);

// Configuration pour les différents environnements (maintenant configurables)
export const NETWORK_CONFIG = {
  // Pour le développement local
  LOCAL: `http://${process.env.EXPO_PUBLIC_DEFAULT_HOST || 'localhost'}:${
    process.env.EXPO_PUBLIC_DEFAULT_PORT || '3000'
  }/api`,

  // Exemples d'IPs communes (maintenant configurables via .env)
  WIFI_HOME:
    process.env.EXPO_PUBLIC_WIFI_HOME_URL || 'http://192.168.1.100:3000/api',
  WIFI_OFFICE:
    process.env.EXPO_PUBLIC_WIFI_OFFICE_URL || 'http://192.168.0.100:3000/api',
  HOTSPOT:
    process.env.EXPO_PUBLIC_HOTSPOT_URL || 'http://192.168.43.1:3000/api',

  // Fonction pour changer rapidement l'IP
  setCustomIP: (
    ip: string,
    port: number = parseInt(process.env.EXPO_PUBLIC_DEFAULT_PORT || '3000')
  ) => `http://${ip}:${port}/api`,
};

// Debug info
if (__DEV__) {
  console.log('📡 Configuration réseau:');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('WS_BASE_URL:', WS_BASE_URL);
  console.log('Platform:', Platform.OS);
  console.log('ENV HOST:', process.env.EXPO_PUBLIC_HOST);
  console.log('ENV API URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('ENV WS URL:', process.env.EXPO_PUBLIC_WS_URL);

  // Test de connectivité
  console.log("🔍 Test de l'URL API construite:", API_BASE_URL);

  if (API_BASE_URL.includes('localhost')) {
    console.warn(
      '⚠️  ATTENTION: Tu utilises localhost - ça ne marchera pas sur iPhone!'
    );
    console.log('💡 Change EXPO_PUBLIC_HOST dans .env avec ton IP');
  } else {
    console.log('✅ Configuration IP détectée pour mobile');
  }
}

export default {
  API_BASE_URL,
  WS_BASE_URL,
  NETWORK_CONFIG,
};
