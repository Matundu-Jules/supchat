import React from "react";
import { useSearchParams, useParams } from "react-router-dom";
import ChannelChatPage from "./index";

const ChannelChatPageWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id: workspaceIdParam } = useParams();
  // Priorité à l'URL RESTful, fallback sur query string
  const workspaceId = workspaceIdParam || searchParams.get("workspace") || "";

  if (!workspaceId) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2>Workspace requis</h2>
        <p>Veuillez spécifier un workspace dans l'URL (?workspace=ID)</p>
      </div>
    );
  }

  return <ChannelChatPage workspaceId={workspaceId} />;
};

export default ChannelChatPageWrapper;
