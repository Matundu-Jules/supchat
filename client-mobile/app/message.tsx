import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmojiSelector from "react-native-emoji-selector";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_ENDPOINTS } from "../constants/api";

interface Message {
  _id: string;
  text?: string;
  file?: string;
  userId: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

const API_URL = API_ENDPOINTS.messages;

type MessageScreenRouteProp = {
  params: {
    channelId: string;
  };
};

export default function MessageScreen({
  route,
}: {
  route: MessageScreenRouteProp;
}) {
  const { channelId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [token, setToken] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollViewRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem(
        process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY || "authToken"
      );
      if (savedToken) {
        setToken(savedToken);
        fetchMessages(savedToken);
      }
    };
    init();

    const interval = setInterval(() => {
      if (token) fetchMessages(token);
    }, 5000);
    return () => clearInterval(interval);
  }, [channelId, token]);
  const fetchMessages = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/channel/${channelId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessages((res.data as Message[]).reverse());
    } catch (err) {
      console.error("Erreur de récupération des messages :", err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(
        API_URL,
        { channelId, text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setText("");
      fetchMessages(token);
    } catch (err) {
      console.error("Erreur d'envoi :", err);
    }
  };

  const sendFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        const formData = new FormData();
        formData.append("channelId", channelId);
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);

        await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        fetchMessages(token);
      }
    } catch (error) {
      console.error("Erreur d'envoi du fichier :", error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.message}>
      <Text style={styles.author}>
        {item.userId?.username || "Utilisateur"}
      </Text>
      {item.text && <Text style={styles.text}>{item.text}</Text>}
      {item.file && (
        <TouchableOpacity
          onPress={() => {
            // Ouvrir ou télécharger le fichier
          }}
        >
          <Text style={styles.link}>📎 {item.file}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={scrollViewRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          inverted
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Text style={styles.emojiBtn}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={sendFile}>
            <Text style={styles.emojiBtn}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            value={text}
            onChangeText={setText}
          />
          <Button title="Envoyer" onPress={sendMessage} />
        </View>

        {showEmojiPicker && (
          <EmojiSelector
            onEmojiSelected={(emoji) => setText((prev) => prev + emoji)}
            showSearchBar={true}
            showTabs={true}
            showHistory={true}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageList: {
    paddingBottom: 10,
    paddingTop: 10,
  },
  message: {
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  author: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  text: {
    fontSize: 16,
    color: "#1e293b",
  },
  link: {
    color: "#2563eb",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
  },
  emojiBtn: {
    fontSize: 22,
    marginRight: 6,
  },
});
