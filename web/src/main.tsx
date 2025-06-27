// main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";

import { store } from "@store/store";
import "@styles/index.scss";

const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"];

createRoot(document.getElementById("root")!).render(
  // <StrictMode> {/* 🔧 TEMPORAIRE: Désactivé pour éviter les doubles connexions WebSocket */}
  <Provider store={store}>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </Provider>
  // </StrictMode>
);
