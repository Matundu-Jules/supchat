import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermission } from "../hooks/usePermission";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_ENDPOINTS } from "../constants/api";

interface Channel {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
}

const API_URL = API_ENDPOINTS.channels;

interface ChannelsProps {
  route: {
    params: {
      workspaceId: string;
    };
  };
}

export default function Channels({ route }: ChannelsProps) {
  const { workspaceId } = route.params;

  const [channels, setChannels] = useState<Channel[]>([]);
  const [token, setToken] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { permission, loading, check, isAdmin } = usePermission(workspaceId);

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem(
        process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY || "authToken"
      );
      if (savedToken) {
        setToken(savedToken);
        fetchChannels(savedToken);
      } else {
        Alert.alert("Erreur", "Token non trouvé.");
      }
    };
    init();
  }, []);

  const fetchChannels = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}?workspaceId=${workspaceId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setChannels(res.data as Channel[]);
    } catch (err) {
      console.error("Erreur de récupération des canaux :", err);
    }
  };

  const createChannel = async () => {
    if (!newName.trim()) return;
    try {
      await axios.post(
        API_URL,
        {
          name: newName,
          description: newDescription,
          workspaceId,
          type: "public",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewName("");
      setNewDescription("");
      fetchChannels(token);
    } catch (err) {
      console.error("Erreur de création :", err);
    }
  };
  const updateChannel = async (id: string) => {
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
      fetchChannels(token);
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
    }
  };

  const deleteChannel = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChannels(token);
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const renderItem = ({ item }: { item: Channel }) => (
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
          <Button title="Sauver" onPress={() => updateChannel(item._id)} />
        </>
      ) : (
        <>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <View style={styles.buttons}>
            {check("edit_channel") && (
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
            {check("delete_channel") && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Confirmation", "Supprimer ce canal ?", [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      onPress: () => deleteChannel(item._id),
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
        <Text style={styles.title}>Canaux</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {permission && (
              <Text style={styles.roleInfo}>Rôle : {permission.role}</Text>
            )}

            {check("create_channel") && (
              <View style={styles.createSection}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du canal"
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  value={newDescription}
                  onChangeText={setNewDescription}
                />
                <Button title="Créer" onPress={createChannel} />
              </View>
            )}

            <FlatList
              data={channels}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              ListEmptyComponent={<Text>Aucun canal trouvé.</Text>}
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
    fontWeight: "600",
  },
  desc: {
    color: "#666",
    marginBottom: 4,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 6,
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
