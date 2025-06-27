// Composant de diagnostic WebSocket - À supprimer après correction
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@hooks/redux";
import { useSocket } from "@hooks/useSocket";
import type { RootState } from "@store/store";

interface DiagnosticInfo {
  auth: {
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
  };
  socket: {
    exists: boolean;
    connected: boolean;
    id: string | null;
    error: string | null;
  };
  environment: {
    socketUrl: string;
    apiUrl: string;
  };
}

export const WebSocketDiagnostic: React.FC = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo>({
    auth: { isAuthenticated: false, user: null, isLoading: true },
    socket: { exists: false, connected: false, id: null, error: null },
    environment: { socketUrl: "", apiUrl: "" },
  });

  const authState = useAppSelector((state: RootState) => state.auth);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // Récupérer les URLs d'environnement
    const socketUrl = (window as any).__SUPCHAT_SOCKET_URL__ || "Non défini";
    const apiUrl = (window as any).__SUPCHAT_API_URL__ || "Non défini";

    setDiagnosticInfo({
      auth: {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading: authState.isLoading,
      },
      socket: {
        exists: !!socket,
        connected: isConnected,
        id: socket?.id || null,
        error: socket ? null : "Socket non initialisé",
      },
      environment: {
        socketUrl,
        apiUrl,
      },
    });
  }, [authState, socket, isConnected]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "#fff",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "11px",
        maxWidth: "350px",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontFamily: "monospace",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
        🔧 Diagnostic WebSocket
      </h4>

      <div style={{ marginBottom: "8px" }}>
        <strong>📊 État d'authentification:</strong>
        <div style={{ paddingLeft: "10px" }}>
          <div>
            Connecté:{" "}
            <span
              style={{
                color: diagnosticInfo.auth.isAuthenticated ? "green" : "red",
              }}
            >
              {diagnosticInfo.auth.isAuthenticated ? "✅ OUI" : "❌ NON"}
            </span>
          </div>
          {diagnosticInfo.auth.user && (
            <div>Utilisateur: {diagnosticInfo.auth.user.email}</div>
          )}
          <div>
            Chargement: {diagnosticInfo.auth.isLoading ? "⏳ OUI" : "✅ NON"}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <strong>🔌 État WebSocket:</strong>
        <div style={{ paddingLeft: "10px" }}>
          <div>
            Socket initialisé:{" "}
            <span
              style={{ color: diagnosticInfo.socket.exists ? "green" : "red" }}
            >
              {diagnosticInfo.socket.exists ? "✅ OUI" : "❌ NON"}
            </span>
          </div>
          <div>
            Connecté:{" "}
            <span
              style={{
                color: diagnosticInfo.socket.connected ? "green" : "red",
              }}
            >
              {diagnosticInfo.socket.connected ? "✅ OUI" : "❌ NON"}
            </span>
          </div>
          {diagnosticInfo.socket.id && (
            <div>ID Socket: {diagnosticInfo.socket.id}</div>
          )}
          {diagnosticInfo.socket.error && (
            <div style={{ color: "red" }}>❌ {diagnosticInfo.socket.error}</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <strong>🌐 URLs:</strong>
        <div style={{ paddingLeft: "10px", fontSize: "10px" }}>
          <div>Socket: {diagnosticInfo.environment.socketUrl}</div>
          <div>API: {diagnosticInfo.environment.apiUrl}</div>
        </div>
      </div>

      <div style={{ fontSize: "9px", color: "#666", marginTop: "8px" }}>
        🔍 Ouvrez DevTools (F12) pour plus de logs détaillés
      </div>
    </div>
  );
};

export default WebSocketDiagnostic;
