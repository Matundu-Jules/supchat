/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string; // Pour les appels REST
  readonly VITE_SOCKET_URL: string; // Pour la connexion WebSocket
  readonly VITE_HOST_IP: string;
  readonly VITE_FACEBOOK_APP_ID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_DEBUG: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
