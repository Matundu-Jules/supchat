// Composant de test pour diagnostiquer l'authentification WebSocket
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@hooks/redux";
import { useSocket } from "@hooks/useSocket";

interface AuthInfo {
  isAuthenticated: boolean;
  user: any;
  cookies: Record<string, string>;
  socket: {
    connected: boolean;
    error: string | null;
  };
}

export const WebSocketAuthTester: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    isAuthenticated: false,
    user: null,
    cookies: {},
    socket: { connected: false, error: null },
  });

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { socket, isConnected } = useSocket();

  // Fonction pour parser les cookies
  const parseCookies = () => {
    const cookies: Record<string, string> = {};
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  };

  useEffect(() => {
    const cookies = parseCookies();

    setAuthInfo({
      isAuthenticated,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        : null,
      cookies,
      socket: {
        connected: isConnected,
        error: socket ? null : "Socket non initialisé",
      },
    });
  }, [isAuthenticated, user, socket, isConnected]);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#f0f0f0",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "12px",
        maxWidth: "300px",
        zIndex: 9999,
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
        🔍 WebSocket Auth Debug
      </h3>
      <div style={{ marginBottom: "8px" }}>
        <strong>Authentification:</strong>
        <br />✅ Connecté: {authInfo.isAuthenticated ? "✓" : "✗"}
        <br />
        👤 Utilisateur: {authInfo.user?.email || "Aucun"}
      </div>{" "}
      <div style={{ marginBottom: "8px" }}>
        <strong>Cookies:</strong>
        <br />
        🍪 access: {authInfo.cookies["access"] ? "✓ (présent)" : "✗ (absent)"}
        <br />
        🍪 refresh: {authInfo.cookies["refresh"] ? "✓ (présent)" : "✗ (absent)"}
        <br />
        🍪 XSRF-TOKEN:{" "}
        {authInfo.cookies["XSRF-TOKEN"] ? "✓ (présent)" : "✗ (absent)"}
      </div>
      <div>
        <strong>WebSocket:</strong>
        <br />
        🔌 Connexion:{" "}
        {authInfo.socket.connected ? "✓ Connecté" : "✗ Déconnecté"}
        <br />
        ⚠️ Erreur: {authInfo.socket.error || "Aucune"}
      </div>
      <div style={{ marginTop: "10px", fontSize: "10px", color: "#666" }}>
        Debug: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
