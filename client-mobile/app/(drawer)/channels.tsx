import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function ChannelScreen() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  // @ts-ignore
  const navigation = useNavigation<any>();

  const workspaceId = "123456"; // À adapter à ton workspace réel

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/channels?workspaceId=${workspaceId}`)
      .then((res) => setChannels(res.data))
      .catch((err) => console.error("Erreur chargement canaux :", err))
      .finally(() => setLoading(false));
  }, []);

  const renderChannel = ({ item }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() =>
        navigation.navigate("Messages", {
          channelId: item._id,
          name: item.name,
        })
      }
    >
      <Text style={styles.channelText}># {item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Chargement des canaux...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item._id}
        renderItem={renderChannel}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun canal trouvé</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117", padding: 16 },
  channelItem: {
    padding: 16,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
  },
  channelText: {
    color: "#fff",
    fontSize: 16,
  },
  empty: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d1117",
  },
});
