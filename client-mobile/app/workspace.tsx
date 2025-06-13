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
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Workspace {
  _id: string;
  name: string;
  description?: string; // Optionnel si pas utilisé
}

const API_URL = "http://localhost:3000/workspaces"; // Modifie l'URL selon ton serveur

export default function WorkspaceScreen() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem("authToken");
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
      setWorkspaces(res.data as Workspace[]);
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
          />
          <Button title="Sauver" onPress={() => updateWorkspace(item._id)} />
        </>
      ) : (
        <>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={() => {
                setEditingId(item._id);
                setEditName(item.name);
              }}
              style={[styles.button, styles.edit]}
            >
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
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
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Workspaces</Text>
      <View style={styles.createSection}>
        <TextInput
          style={styles.input}
          placeholder="Nouveau nom"
          value={newName}
          onChangeText={setNewName}
        />
        <Button title="Créer" onPress={createWorkspace} />
      </View>
      <FlatList
        data={workspaces}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Aucun workspace trouvé.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  createSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginRight: 10,
    borderRadius: 6,
  },
  item: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 6,
  },
  name: { fontSize: 16, fontWeight: "500" },
  buttons: { flexDirection: "row", marginTop: 8 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  edit: { backgroundColor: "#facc15" },
  delete: { backgroundColor: "#ef4444" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
