// src/components/NetworkDebug.tsx

import React from "react";
import { useApi, useApiDebug } from "../hooks/useApi";
import styles from "./NetworkDebug.module.scss";

interface NetworkDebugProps {
  show?: boolean;
}

/**
 * Composant de debug pour afficher l'état de la connexion réseau
 * Utile pendant le développement pour vérifier la configuration IP
 */
export const NetworkDebug: React.FC<NetworkDebugProps> = ({ show = true }) => {
  const {
    isConnected,
    lastChecked,
    error,
    apiUrl,
    socketUrl,
    hostIp,
    checkConnection,
  } = useApi();
  const { isDev } = useApiDebug();

  // Ne pas afficher en production
  if (!isDev || !show) {
    return null;
  }

  return (
    <div className={styles.networkDebug}>
      <div className={styles.header}>
        <h4>🌐 Debug Réseau SupChat</h4>
        <button onClick={checkConnection} className={styles.refreshBtn}>
          🔄 Tester
        </button>
      </div>

      <div className={styles.status}>
        <div
          className={`${styles.indicator} ${
            isConnected ? styles.connected : styles.disconnected
          }`}
        >
          {isConnected ? "✅ Connecté" : "❌ Déconnecté"}
        </div>
        {lastChecked && (
          <small>Dernière vérif: {lastChecked.toLocaleTimeString()}</small>
        )}
      </div>

      {error && <div className={styles.error}>⚠️ Erreur: {error}</div>}

      <div className={styles.config}>
        <div className={styles.configItem}>
          <strong>API:</strong> <code>{apiUrl}</code>
        </div>
        <div className={styles.configItem}>
          <strong>Socket:</strong> <code>{socketUrl}</code>
        </div>
        <div className={styles.configItem}>
          <strong>IP:</strong> <code>{hostIp}</code>
        </div>
      </div>

      {(apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) && (
        <div className={styles.warning}>
          🚨 Configuration localhost - Non compatible mobile
          <br />
          💡 Lancez: <code>node scripts/update-env.js</code>
        </div>
      )}
    </div>
  );
};

export default NetworkDebug;
