/**
 * Dashboard de monitoring WebSocket temps réel
 * Affiche les statistiques de connexion et de messagerie
 */

import React, { useState, useEffect } from "react";
import { useSocket } from "@hooks/useSocket";
import styles from "./WebSocketMonitor.module.scss";

interface ConnectionStats {
  totalConnections: number;
  activeChannels: number;
  messagesPerSecond: number;
  averageLatency: number;
  errors: number;
}

interface ChannelStats {
  channelId: string;
  channelName: string;
  activeUsers: number;
  messageCount: number;
  lastActivity: Date;
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

  const [channelStats, setChannelStats] = useState<ChannelStats[]>([]);
  const [recentMessages, setRecentMessages] = useState<MessageStats[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Écouter les événements de monitoring
    socket.on("stats-update", (newStats: ConnectionStats) => {
      setStats(newStats);
    });

    socket.on("channel-stats", (channels: ChannelStats[]) => {
      setChannelStats(channels);
    });

    socket.on("message-activity", (activity: MessageStats) => {
      setRecentMessages((prev) => {
        const updated = [activity, ...prev].slice(0, 50); // Garder les 50 derniers
        return updated;
      });
    });

    // Demander les stats initiales
    socket.emit("request-stats");

    return () => {
      socket.off("stats-update");
      socket.off("channel-stats");
      socket.off("message-activity");
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (!isMonitoring) return;

    // Demander les stats toutes les 5 secondes
    const interval = setInterval(() => {
      if (socket && isConnected) {
        socket.emit("request-stats");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [socket, isConnected, isMonitoring]);

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
  const getLatencyColor = (latency: number) => {
    if (latency < 100) return styles["latencyGood"];
    if (latency < 500) return styles["latencyOk"];
    return styles["latencyBad"];
  };

  return (
    <div className={styles.monitor}>
      <div className={styles.header}>
        <h2>🔌 WebSocket Monitor</h2>
        <div className={styles.controls}>
          <div className={styles.status}>
            <span
              className={`${styles.indicator} ${
                isConnected ? styles.connected : styles.disconnected
              }`}
            >
              {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
            </span>
          </div>

          {isConnected && (
            <>
              {!isMonitoring ? (
                <button onClick={startMonitoring} className={styles.startBtn}>
                  ▶️ Démarrer le monitoring
                </button>
              ) : (
                <button onClick={stopMonitoring} className={styles.stopBtn}>
                  ⏹️ Arrêter le monitoring
                </button>
              )}

              <button onClick={clearLogs} className={styles.clearBtn}>
                🗑️ Vider les logs
              </button>
            </>
          )}
        </div>
      </div>

      {isConnected && (
        <>
          {/* Statistiques globales */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Connexions</h3>
              <div className={styles.statValue}>{stats.totalConnections}</div>
              <div className={styles.statLabel}>Total actif</div>
            </div>

            <div className={styles.statCard}>
              <h3>Channels</h3>
              <div className={styles.statValue}>{stats.activeChannels}</div>
              <div className={styles.statLabel}>Actifs</div>
            </div>

            <div className={styles.statCard}>
              <h3>Messages/sec</h3>
              <div className={styles.statValue}>
                {stats.messagesPerSecond.toFixed(1)}
              </div>
              <div className={styles.statLabel}>Débit</div>
            </div>

            <div className={styles.statCard}>
              <h3>Latence moyenne</h3>
              <div
                className={`${styles.statValue} ${getLatencyColor(
                  stats.averageLatency
                )}`}
              >
                {formatLatency(stats.averageLatency)}
              </div>
              <div className={styles.statLabel}>Réponse</div>
            </div>

            <div className={styles.statCard}>
              <h3>Erreurs</h3>
              <div
                className={`${styles.statValue} ${
                  stats.errors > 0 ? styles.errorValue : ""
                }`}
              >
                {stats.errors}
              </div>
              <div className={styles.statLabel}>Total</div>
            </div>
          </div>

          {/* Statistiques des channels */}
          {channelStats.length > 0 && (
            <div className={styles.section}>
              <h3>📺 Activité des Channels</h3>
              <div className={styles.channelList}>
                {channelStats.map((channel) => (
                  <div key={channel.channelId} className={styles.channelCard}>
                    <div className={styles.channelHeader}>
                      <h4>#{channel.channelName}</h4>
                      <span className={styles.userCount}>
                        👥 {channel.activeUsers}
                      </span>
                    </div>
                    <div className={styles.channelStats}>
                      <span>💬 {channel.messageCount} messages</span>
                      <span>
                        🕒 {new Date(channel.lastActivity).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages récents */}
          {recentMessages.length > 0 && (
            <div className={styles.section}>
              <h3>📋 Activité Récente</h3>
              <div className={styles.messageLog}>
                {recentMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${styles.logEntry} ${styles[msg.type]}`}
                  >
                    <span className={styles.timestamp}>
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={styles.type}>
                      {msg.type === "sent" && "📤"}
                      {msg.type === "received" && "📥"}
                      {msg.type === "error" && "❌"}
                    </span>
                    <span className={styles.channel}>
                      #{msg.channelId.slice(-6)}
                    </span>
                    {msg.latency && (
                      <span
                        className={`${styles.latency} ${getLatencyColor(
                          msg.latency
                        )}`}
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
      )}

      {!isConnected && (
        <div className={styles.disconnectedState}>
          <h3>🔌 WebSocket Déconnecté</h3>
          <p>Veuillez vous connecter pour voir le monitoring en temps réel.</p>
        </div>
      )}
    </div>
  );
};

export default WebSocketMonitor;
