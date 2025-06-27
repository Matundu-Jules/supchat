// Page de test pour diagnostiquer l'authentification WebSocket
import React from "react";
import { WebSocketAuthTester } from "@components/testing/WebSocketAuthTester";

const WebSocketTestPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Test d'Authentification WebSocket</h1>
      <p>
        Cette page permet de diagnostiquer l'authentification WebSocket de
        SUPCHAT.
      </p>
      <WebSocketAuthTester />
    </div>
  );
};

export default WebSocketTestPage;
