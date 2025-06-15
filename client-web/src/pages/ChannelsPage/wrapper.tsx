import React from "react";
import { useSearchParams } from "react-router-dom";
import ChannelsPage from "./index";

const ChannelsPageWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspace") || "";

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

  return <ChannelsPage workspaceId={workspaceId} />;
};

export default ChannelsPageWrapper;
