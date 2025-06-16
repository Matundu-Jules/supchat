import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"online" | "busy" | "offline">("online");

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const loadProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/auth/me");
      const data = res.data as { name: string; email: string };
      setName(data.name);
      setEmail(data.email);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger le profil.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async () => {
    try {
      await axios.put("http://localhost:3000/api/user", { name, email });
      Alert.alert("✅ Succès", "Profil mis à jour.");
    } catch (err) {
      Alert.alert("❌ Erreur", "Échec de la mise à jour.");
    }
  };

  const updateStatus = async (newStatus: typeof status) => {
    setStatus(newStatus);
    try {
      await axios.post("http://localhost:3000/api/user/status", {
        status: newStatus,
      });
    } catch {
      Alert.alert("Erreur", "Impossible de changer le statut.");
    }
  };

  const exportData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user/export", {
        responseType: "blob",
      });
      Alert.alert("Données exportées", "Fichier téléchargé.");
      // Pour appareil physique, il faut gérer l’enregistrement avec FileSystem
    } catch {
      Alert.alert("Erreur", "Exportation impossible.");
    }
  };

  const unlinkOAuth = async (provider: "google" | "facebook") => {
    try {
      await axios.delete(`http://localhost:3000/api/user/oauth/${provider}`);
      Alert.alert("Succès", `${provider} déconnecté.`);
    } catch {
      Alert.alert("Erreur", `Échec de suppression ${provider}.`);
    }
  };

  const bgColor = isDark ? "#111" : "#f9f9f9";
  const textColor = isDark ? "#fff" : "#000";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: bgColor },
          ]}
        >
          <Text style={[styles.title, { color: textColor }]}>
            Paramètres utilisateur
          </Text>

          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Nom"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={updateProfile}>
            <Text style={styles.buttonText}>Modifier mes infos</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Thème
            </Text>
            <View style={styles.row}>
              <Text style={{ color: textColor }}>
                {isDark ? "Sombre" : "Clair"}
              </Text>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Statut
            </Text>
            {["online", "busy", "offline"].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => updateStatus(s as typeof status)}
                style={[
                  styles.statusButton,
                  status === s && { backgroundColor: "#2563eb" },
                ]}
              >
                <Text style={{ color: "#fff" }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              OAuth
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => unlinkOAuth("google")}
            >
              <Text style={styles.buttonText}>Délier Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => unlinkOAuth("facebook")}
            >
              <Text style={styles.buttonText}>Délier Facebook</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#059669" }]}
            onPress={exportData}
          >
            <Text style={styles.buttonText}>Exporter mes données (RGPD)</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButton: {
    padding: 10,
    backgroundColor: "#6b7280",
    borderRadius: 6,
    marginBottom: 6,
    alignItems: "center",
  },
});
