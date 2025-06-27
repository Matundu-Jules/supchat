import React, { useState, useEffect } from "react";
import { useMessages } from "@hooks/useMessages";
import { useSocket } from "@hooks/useSocket";

interface MessageTesterProps {
  channelId: string;
  userId?: string;
}

/**
 * Composant de test pour la messagerie WebSocket
 * À utiliser temporairement pour déboguer les problèmes de messagerie
 */
export const MessageTester: React.FC<MessageTesterProps> = ({
  channelId,
  userId,
}) => {
  const [messageText, setMessageText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [logs, setLogs] = useState<string[]>([]);

  const socket = useSocket(channelId, userId);
  const { messages, loading, error, send } = useMessages(channelId);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setConnectionStatus("Connected ✅");
        addLog("Socket connecté");
      });

      socket.on("disconnect", () => {
        setConnectionStatus("Disconnected ❌");
        addLog("Socket déconnecté");
      });

      socket.on("connect_error", (error) => {
        setConnectionStatus("Error ❌");
        addLog(`Erreur connexion: ${error.message}`);
      });

      socket.on("channels-joined", (data) => {
        addLog(`Channels rejoint: ${JSON.stringify(data)}`);
      });

      socket.on("new-message", (message) => {
        addLog(`Nouveau message reçu: ${message.content}`);
      });

      socket.on("message-sent", (data) => {
        addLog(`Message envoyé confirmé: ${data.success}`);
      });

      socket.on("error", (error) => {
        addLog(`Erreur WebSocket: ${JSON.stringify(error)}`);
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("channels-joined");
        socket.off("new-message");
        socket.off("message-sent");
        socket.off("error");
      };
    }
  }, [socket]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      addLog(`Envoi du message: "${messageText}"`);
      await send(messageText);
      setMessageText("");
      addLog("Message envoyé via API");
    } catch (err: any) {
      addLog(`Erreur envoi: ${err.message}`);
    }
  };

  const handleTestWebSocket = () => {
    if (socket && messageText.trim()) {
      addLog(`Test WebSocket direct: "${messageText}"`);
      socket.emit("send-message", {
        channelId,
        content: messageText,
        type: "text",
      });
      setMessageText("");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #007bff",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        margin: "20px 0",
      }}
    >
      <h3>🧪 Testeur de Messagerie WebSocket</h3>

      <div style={{ marginBottom: "10px" }}>
        <strong>Status:</strong> {connectionStatus}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Channel ID:</strong> {channelId}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Tapez votre message..."
          style={{
            width: "60%",
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Envoyer (API)
        </button>
        <button
          onClick={handleTestWebSocket}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Test WebSocket
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4>Messages ({messages.length}):</h4>
        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: "red" }}>Erreur: {error}</p>}
        <div
          style={{
            maxHeight: "200px",
            overflow: "auto",
            border: "1px solid #ccc",
            padding: "10px",
            backgroundColor: "white",
          }}
        >
          {messages.map((msg: any) => (
            <div
              key={msg._id}
              style={{
                marginBottom: "5px",
                padding: "5px",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{msg.author?.username || msg.userId}:</strong>{" "}
              {msg.content || msg.text}
              <small style={{ marginLeft: "10px", color: "#666" }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4>Logs WebSocket:</h4>
        <div
          style={{
            maxHeight: "150px",
            overflow: "auto",
            border: "1px solid #ccc",
            padding: "10px",
            backgroundColor: "white",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        <button
          onClick={() => setLogs([])}
          style={{
            marginTop: "10px",
            padding: "4px 8px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Effacer Logs
        </button>
      </div>
    </div>
  );
};

export default MessageTester;
