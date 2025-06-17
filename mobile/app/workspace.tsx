import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermission } from "../hooks/usePermission";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_ENDPOINTS } from "../constants/api";

interface Workspace {
  _id: string;
  name: string;
  description?: string;
}

const API_URL = API_ENDPOINTS.workspaces;

export default function Workspace() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [token, setToken] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { permission, loading, check, isAdmin } = usePermission(
    workspaceId || ""
  );

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem(
        process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY || "authToken"
      );
      if (savedToken) {
        setToken(savedToken);
        fetchWorkspaces(savedToken);
      } else {
        Alert.alert("Erreur", "Token non trouvé, veuillez vous reconnecter.");
      }
    };
    init();
  }, []);

  const fetchWorkspaces = async (authToken: string) => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const list = res.data as Workspace[];
      setWorkspaces(list);
      if (list.length > 0) setWorkspaceId(list[0]._id);
    } catch (err) {
      console.error("Erreur de récupération :", err);
    }
  };

  const createWorkspace = async () => {
    if (!newName.trim()) return;
    try {
      await axios.post(
        API_URL,
        { name: newName, description: newDescription },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewName("");
      setNewDescription("");
      setShowCreateForm(false);
      fetchWorkspaces(token);
    } catch (err) {
      console.error("Erreur de création :", err);
    }
  };

  const updateWorkspace = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await axios.put(
        `${API_URL}/${id}`,
        { name: editName, description: editDescription },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingId(null);
      fetchWorkspaces(token);
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkspaces(token);
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const renderItem = ({ item }: { item: Workspace }) => (
    <View style={styles.item}>
      {editingId === item._id ? (
        <>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="Nom modifié"
          />
          <TextInput
            style={styles.input}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Description"
          />
          <Button title="Sauver" onPress={() => updateWorkspace(item._id)} />
        </>
      ) : (
        <>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.buttons}>
            {check("edit_workspace") && (
              <TouchableOpacity
                onPress={() => {
                  setEditingId(item._id);
                  setEditName(item.name);
                  setEditDescription(item.description || "");
                }}
                style={[styles.button, styles.edit]}
              >
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
            )}
            {check("delete_workspace") && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Confirmation", "Supprimer ce workspace ?", [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      onPress: () => deleteWorkspace(item._id),
                    },
                  ])
                }
                style={[styles.button, styles.delete]}
              >
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mes Workspaces</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {permission && (
              <Text style={styles.roleInfo}>
                Rôle dans ce workspace : {permission.role}
              </Text>
            )}

            {check("create_workspace") && (
              <>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateForm((prev) => !prev)}
                >
                  <Text style={styles.createButtonText}>
                    {showCreateForm ? "Annuler" : "Créer un Workspace"}
                  </Text>
                </TouchableOpacity>

                {showCreateForm && (
                  <View style={styles.createSection}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nom du workspace"
                      value={newName}
                      onChangeText={setNewName}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Description (facultatif)"
                      value={newDescription}
                      onChangeText={setNewDescription}
                    />
                    <Button title="Valider" onPress={createWorkspace} />
                  </View>
                )}
              </>
            )}

            <FlatList
              data={workspaces}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              ListEmptyComponent={<Text>Aucun workspace trouvé.</Text>}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
  },
  roleInfo: {
    fontStyle: "italic",
    marginBottom: 10,
    fontSize: 14,
    color: "#555",
  },
  createButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  item: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  edit: {
    backgroundColor: "#facc15",
  },
  delete: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
