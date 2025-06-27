/**
 * Dashboard de monitoring WebSocket temps réel (version simple)
 * Affiche les statistiques de connexion et de messagerie
 */

import React, { useState, useEffect } from "react";
import { useSocket } from "@hooks/useSocket";

interface ConnectionStats {
  totalConnections: number;
  activeChannels: number;
  messagesPerSecond: number;
  averageLatency: number;
  errors: number;
}

interface MessageStats {
  timestamp: Date;
  type: "sent" | "received" | "error";
  channelId: string;
  latency?: number;
}

const WebSocketMonitor: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<ConnectionStats>({
    totalConnections: 0,
    activeChannels: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    errors: 0,
  });

  const [recentMessages, setRecentMessages] = useState<MessageStats[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Écouter les événements de monitoring
    socket.on("stats-update", (newStats: ConnectionStats) => {
      setStats(newStats);
    });

    socket.on("message-activity", (activity: MessageStats) => {
      setRecentMessages((prev) => {
        const updated = [activity, ...prev].slice(0, 20); // Garder les 20 derniers
        return updated;
      });
    });

    // Demander les stats initiales
    socket.emit("request-stats");

    return () => {
      socket.off("stats-update");
      socket.off("message-activity");
    };
  }, [socket, isConnected]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    if (socket && isConnected) {
      socket.emit("start-monitoring");
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (socket && isConnected) {
      socket.emit("stop-monitoring");
    }
  };

  const clearLogs = () => {
    setRecentMessages([]);
  };

  const formatLatency = (latency: number) => {
    if (latency < 100) return `${latency}ms`;
    if (latency < 1000) return `${latency}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };

  const getLatencyStyle = (latency: number): React.CSSProperties => {
    if (latency < 100) return { color: "#28a745" };
    if (latency < 500) return { color: "#ffc107" };
    return { color: "#dc3545" };
  };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e9ecef",
  };

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  };

  const statCardStyle: React.CSSProperties = {
    background: "white",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, color: "#2c3e50", fontWeight: 600 }}>
          🔌 WebSocket Monitor
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontWeight: 500,
              color: isConnected ? "#28a745" : "#dc3545",
              padding: "8px 12px",
              background: "white",
              borderRadius: "6px",
              border: "1px solid #dee2e6",
            }}
          >
            {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
          </span>

          {isConnected && (
            <>
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                style={{
                  ...buttonStyle,
                  background: isMonitoring ? "#dc3545" : "#28a745",
                  color: "white",
                }}
              >
                {isMonitoring ? "⏹️ Arrêter" : "▶️ Démarrer"}
              </button>

              <button
                onClick={clearLogs}
                style={{
                  ...buttonStyle,
                  background: "#6c757d",
                  color: "white",
                }}
              >
                🗑️ Vider
              </button>
            </>
          )}
        </div>
      </div>

      {isConnected ? (
        <>
          {/* Statistiques */}
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#6c757d",
                  fontSize: "0.8rem",
                }}
              >
                CONNEXIONS
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#2c3e50",
                }}
              >
                {stats.totalConnections}
              </div>
            </div>

            <div style={statCardStyle}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#6c757d",
                  fontSize: "0.8rem",
                }}
              >
                CHANNELS
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#2c3e50",
                }}
              >
                {stats.activeChannels}
              </div>
            </div>

            <div style={statCardStyle}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#6c757d",
                  fontSize: "0.8rem",
                }}
              >
                MSG/SEC
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#2c3e50",
                }}
              >
                {stats.messagesPerSecond.toFixed(1)}
              </div>
            </div>

            <div style={statCardStyle}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#6c757d",
                  fontSize: "0.8rem",
                }}
              >
                LATENCE
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  ...getLatencyStyle(stats.averageLatency),
                }}
              >
                {formatLatency(stats.averageLatency)}
              </div>
            </div>

            <div style={statCardStyle}>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#6c757d",
                  fontSize: "0.8rem",
                }}
              >
                ERREURS
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: stats.errors > 0 ? "#dc3545" : "#2c3e50",
                }}
              >
                {stats.errors}
              </div>
            </div>
          </div>

          {/* Logs d'activité */}
          {recentMessages.length > 0 && (
            <div>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  color: "#2c3e50",
                  fontSize: "1.1rem",
                }}
              >
                📋 Activité Récente
              </h3>
              <div
                style={{
                  background: "#1a1a1a",
                  borderRadius: "8px",
                  padding: "12px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  fontFamily: "Monaco, Consolas, monospace",
                  fontSize: "0.8rem",
                }}
              >
                {recentMessages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "4px 0",
                      borderBottom:
                        index < recentMessages.length - 1
                          ? "1px solid #333"
                          : "none",
                      color:
                        msg.type === "sent"
                          ? "#4ade80"
                          : msg.type === "received"
                          ? "#60a5fa"
                          : "#f87171",
                    }}
                  >
                    <span style={{ color: "#9ca3af", minWidth: "70px" }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    <span>
                      {msg.type === "sent" && "📤"}
                      {msg.type === "received" && "📥"}
                      {msg.type === "error" && "❌"}
                    </span>
                    <span style={{ color: "#fbbf24", minWidth: "60px" }}>
                      #{msg.channelId.slice(-6)}
                    </span>
                    {msg.latency && (
                      <span
                        style={{
                          marginLeft: "auto",
                          padding: "2px 4px",
                          borderRadius: "2px",
                          fontSize: "0.7rem",
                          ...getLatencyStyle(msg.latency),
                        }}
                      >
                        {formatLatency(msg.latency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#6c757d",
          }}
        >
          <h3 style={{ color: "#dc3545", marginBottom: "12px" }}>
            🔌 WebSocket Déconnecté
          </h3>
          <p>Connectez-vous pour voir le monitoring en temps réel.</p>
        </div>
      )}
    </div>
  );
};

export default WebSocketMonitor;
