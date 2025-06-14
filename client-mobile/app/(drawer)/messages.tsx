import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

type RouteParams = {
  channelId: string;
  name: string;
};

export default function MessagesScreen() {
  const route = useRoute();
  const { channelId, name } = route.params as RouteParams;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Simule un utilisateur connecté (à remplacer par le vrai ID plus tard)
  const userId = "user123";

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/messages/channel/${channelId}`
      );
      setMessages(res.data.reverse());
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(`http://localhost:3000/api/messages`, {
        channelId,
        userId,
        text,
      });
      setText("");
      fetchMessages(); // Recharge les messages
    } catch (err) {
      console.error("Erreur envoi:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.messageItem}>
      <Text style={styles.author}>{item.userId}</Text>
      <Text style={styles.content}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>#{name}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onRefresh={fetchMessages}
        refreshing={refreshing}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  header: {
    fontSize: 18,
    color: "#fff",
    padding: 16,
    fontWeight: "bold",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
  },
  messageItem: {
    padding: 12,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
  },
  author: {
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  content: {
    color: "#e5e7eb",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopColor: "#1e293b",
    borderTopWidth: 1,
    backgroundColor: "#111827",
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
