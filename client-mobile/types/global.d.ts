/// <reference types="expo/types" />

// Types globaux pour l'application mobile
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

// Types pour les variables d'environnement Expo
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_WS_URL: string;
    EXPO_PUBLIC_ENV: string;
    EXPO_PUBLIC_HOST?: string;
    EXPO_PUBLIC_PORT?: string;
    EXPO_PUBLIC_DEFAULT_HOST?: string;
    EXPO_PUBLIC_DEFAULT_PORT?: string;
    EXPO_PUBLIC_WIFI_HOME_URL?: string;
    EXPO_PUBLIC_WIFI_OFFICE_URL?: string;
    EXPO_PUBLIC_HOTSPOT_URL?: string;
    EXPO_PUBLIC_GOOGLE_CLIENT_ID?: string;
    EXPO_PUBLIC_TOKEN_STORAGE_KEY?: string;
    EXPO_PUBLIC_USER_STORAGE_KEY?: string;
    EXPO_PUBLIC_API_TIMEOUT?: string;
    EXPO_PUBLIC_RETRY_ATTEMPTS?: string;
  }
}

// Types pour la configuration Expo
declare module 'expo-constants' {
  interface ExpoConfig {
    extra?: {
      apiUrl?: string;
      wsUrl?: string;
      [key: string]: any;
    };
  }
}
