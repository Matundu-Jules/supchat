// src/components/SecureNetworkDebug.tsx

import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import styles from "./NetworkDebug.module.scss";

interface SecureNetworkDebugProps {
  show?: boolean;
}

/**
 * Composant de debug sécurisé pour le développement uniquement
 * ⚠️ N'affiche PAS d'informations sensibles
 */
export const SecureNetworkDebug: React.FC<SecureNetworkDebugProps> = ({
  show = true,
}) => {
  const { isConnected, lastChecked, error, checkConnection } = useApi();
  const [showDetails, setShowDetails] = useState(false);

  // Ne pas afficher en production
  const isDev = import.meta.env.DEV;
  const environment = import.meta.env.MODE;

  if (!isDev || !show || environment === "production") {
    return null;
  }

  // Masquer les IPs complètes - ne montrer que le statut
  const apiUrl = import.meta.env["VITE_API_URL"] || "";
  const hostIP = import.meta.env["VITE_HOST_IP"] || "";
  const ipHash = import.meta.env["VITE_IP_HASH"] || "";

  // Détecter si on utilise localhost (pas sécurisé pour mobile)
  const isLocalhost =
    apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1");
  const isPrivateIP =
    hostIP.startsWith("192.168.") ||
    hostIP.startsWith("10.") ||
    hostIP.startsWith("172.");
  return (
    <div className={styles["networkDebug"]}>
      <div className={styles["header"]}>
        <h4>🔒 Debug Réseau (Sécurisé)</h4>
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={styles["refreshBtn"]}
            style={{ marginRight: "8px" }}
          >
            {showDetails ? "👁️‍🗨️" : "👁️"}
          </button>
          <button onClick={checkConnection} className={styles["refreshBtn"]}>
            🔄
          </button>
        </div>
      </div>

      <div className={styles["status"]}>
        <div
          className={`${styles["indicator"]} ${
            isConnected ? styles["connected"] : styles["disconnected"]
          }`}
        >
          {isConnected ? "✅ API Connectée" : "❌ API Déconnectée"}
        </div>
        {lastChecked && (
          <small>Dernière vérif: {lastChecked.toLocaleTimeString()}</small>
        )}
      </div>

      {error && <div className={styles["error"]}>⚠️ Erreur: {error}</div>}

      <div className={styles["config"]}>
        <div className={styles["configItem"]}>
          <strong>Env:</strong> <code>{environment}</code>
        </div>
        {ipHash && (
          <div className={styles["configItem"]}>
            <strong>Config Hash:</strong> <code>{ipHash}</code>
          </div>
        )}
        <div className={styles["configItem"]}>
          <strong>Type:</strong>
          {isLocalhost ? (
            <span style={{ color: "#fbbf24" }}> 🏠 Localhost</span>
          ) : isPrivateIP ? (
            <span style={{ color: "#22c55e" }}> 🔒 IP Privée</span>
          ) : (
            <span style={{ color: "#ef4444" }}> 🌍 IP Publique</span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className={styles["config"]}>
          <div className={styles["configItem"]}>
            <strong>API:</strong>{" "}
            <code>{apiUrl.replace(/\/\/[^:]+/, "//[MASKED]")}</code>
          </div>
          <div className={styles["configItem"]}>
            <strong>Host:</strong>{" "}
            <code>
              {hostIP ? `${hostIP.substring(0, 7)}...` : "Non défini"}
            </code>
          </div>
        </div>
      )}

      {isLocalhost && (
        <div className={styles["warning"]}>
          🚨 Configuration localhost - Non compatible mobile
          <br />
          💡 Utilisez: <code>npm run secure-env</code>
        </div>
      )}

      {!isPrivateIP && hostIP && (
        <div className={styles["error"]}>
          ⚠️ IP publique détectée - Risque de sécurité !
        </div>
      )}

      <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "8px" }}>
        🔒 Mode debug sécurisé - Développement uniquement
      </div>
    </div>
  );
};

export default SecureNetworkDebug;
