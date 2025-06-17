// components/NetworkDebugOverlay.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useNetworkConfig, useIPValidation } from "../hooks/useNetworkConfig";

const { width } = Dimensions.get("window");

interface NetworkDebugOverlayProps {
  visible?: boolean;
  onToggle?: () => void;
}

/**
 * Overlay de debug réseau pour SupChat Mobile
 * Affiche l'état de la connexion et la configuration IP
 */
export const NetworkDebugOverlay: React.FC<NetworkDebugOverlayProps> = ({
  visible = __DEV__,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isConnected,
    apiUrl,
    wsUrl,
    lastChecked,
    error,
    checkConnection,
    hostIP,
  } = useNetworkConfig();
  const { validation } = useIPValidation();

  if (!visible) {
    return null;
  }

  const getStatusColor = () => {
    if (isConnected) return "#22c55e";
    if (error) return "#ef4444";
    return "#fbbf24";
  };

  const getValidationColor = () => {
    switch (validation.severity) {
      case "success":
        return "#22c55e";
      case "warning":
        return "#fbbf24";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={styles.container}>
      {/* Bouton de toggle */}
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: getStatusColor() }]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.toggleText}>
          {isConnected ? "🌐" : "❌"} {isExpanded ? "▼" : "▶"}
        </Text>
      </TouchableOpacity>

      {/* Panel étendu */}
      {isExpanded && (
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>🔧 Debug Réseau SupChat</Text>
            <TouchableOpacity
              onPress={checkConnection}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Statut de connexion */}
          <View style={styles.section}>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {isConnected
                ? "✅ Connecté au serveur"
                : "❌ Serveur inaccessible"}
            </Text>
            {lastChecked && (
              <Text style={styles.subtitle}>
                Dernière vérif: {lastChecked.toLocaleTimeString()}
              </Text>
            )}
            {error && <Text style={styles.error}>Erreur: {error}</Text>}
          </View>

          {/* Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📡 Configuration:</Text>
            <Text style={styles.configItem}>
              <Text style={styles.configLabel}>API:</Text> {apiUrl}
            </Text>
            <Text style={styles.configItem}>
              <Text style={styles.configLabel}>WebSocket:</Text> {wsUrl}
            </Text>
            <Text style={styles.configItem}>
              <Text style={styles.configLabel}>Host IP:</Text>{" "}
              {hostIP || "Non défini"}
            </Text>
          </View>

          {/* Validation */}
          <View style={styles.section}>
            <Text style={[styles.validation, { color: getValidationColor() }]}>
              {validation.message}
            </Text>
            {validation.suggestion && (
              <Text style={styles.suggestion}>💡 {validation.suggestion}</Text>
            )}
          </View>

          {/* Variables d'environnement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Variables ENV:</Text>
            <Text style={styles.envVar}>
              EXPO_PUBLIC_HOST: {process.env.EXPO_PUBLIC_HOST || "Non défini"}
            </Text>
            <Text style={styles.envVar}>
              EXPO_PUBLIC_API_URL:{" "}
              {process.env.EXPO_PUBLIC_API_URL || "Non défini"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 10,
    zIndex: 9999,
  },
  toggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  panel: {
    marginTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderRadius: 12,
    padding: 16,
    width: width - 40,
    maxWidth: 400,
    right: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
  },
  refreshText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#60a5fa",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 2,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  configItem: {
    color: "white",
    fontSize: 11,
    marginBottom: 2,
  },
  configLabel: {
    color: "#60a5fa",
    fontWeight: "bold",
  },
  validation: {
    fontSize: 13,
    fontWeight: "bold",
  },
  suggestion: {
    color: "#fbbf24",
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  envVar: {
    color: "#9ca3af",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 2,
  },
});

export default NetworkDebugOverlay;
