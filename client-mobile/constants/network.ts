// Configuration réseau dynamique
import { Platform } from 'react-native';

// Configuration de l'host avec détection automatique IP
const getApiHost = () => {
  // Priorité 1: URL complète générée automatiquement par le script update-env.js
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priorité 2: Backend URL complète + /api
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
  }

  // Priorité 3: Host IP détectée automatiquement
  if (process.env.EXPO_PUBLIC_HOST) {
    const host = process.env.EXPO_PUBLIC_HOST;
    const port = process.env.EXPO_PUBLIC_PORT || '3000';
    return `http://${host}:${port}/api`;
  }

  // Fallback par défaut - localhost pour développement
  const defaultHost = process.env.EXPO_PUBLIC_DEFAULT_HOST || 'localhost';
  const defaultPort = process.env.EXPO_PUBLIC_DEFAULT_PORT || '3000';
  return `http://${defaultHost}:${defaultPort}/api`;
};

// URL de base de l'API
export const API_BASE_URL = getApiHost();

// URL WebSocket - mise à jour pour Socket.io
export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  API_BASE_URL.replace('http', 'ws').replace('/api', '');

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

// Debug info avec informations détaillées
export const debugNetworkConfig = () => {
  console.log('\n📡 SupChat Mobile - Configuration réseau:');
  console.log('==========================================');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('WS_BASE_URL:', WS_BASE_URL);
  console.log('Platform:', Platform.OS);
  console.log("\n🔧 Variables d'environnement:");
  console.log('EXPO_PUBLIC_HOST:', process.env.EXPO_PUBLIC_HOST);
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('EXPO_PUBLIC_SOCKET_URL:', process.env.EXPO_PUBLIC_SOCKET_URL);
  console.log('EXPO_PUBLIC_BACKEND_URL:', process.env.EXPO_PUBLIC_BACKEND_URL);

  // Test de connectivité
  console.log("\n🔍 Test de l'URL API construite:", API_BASE_URL);

  if (
    API_BASE_URL.includes('localhost') ||
    API_BASE_URL.includes('127.0.0.1')
  ) {
    console.warn(
      '\n⚠️  ATTENTION: Tu utilises localhost - ça ne marchera pas sur un vrai appareil mobile!'
    );
    console.log(
      '💡 Solution: Lance le script update-env.js pour détecter automatiquement ton IP'
    );
    console.log('� Ou change EXPO_PUBLIC_HOST dans .env avec ton IP locale');
  } else {
    console.log('\n✅ Configuration IP réseau détectée - Compatible mobile');
  }
  console.log('==========================================\n');
};

// Debug automatique en développement
if (__DEV__) {
  debugNetworkConfig();
}

export default {
  API_BASE_URL,
  WS_BASE_URL,
  NETWORK_CONFIG,
};
