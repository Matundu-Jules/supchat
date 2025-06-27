import React, { useState, useEffect } from "react";
import type { ChannelJoinRequest } from "@ts_types/channel";

interface ChannelJoinRequestsListProps {
  requests: ChannelJoinRequest[];
  loading?: boolean;
  error?: string | null;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  feedback?: string | null;
}

const ChannelJoinRequestsList: React.FC<ChannelJoinRequestsListProps> = ({
  requests,
  loading,
  error,
  onAccept,
  onDecline,
  feedback,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (feedback) {
      setLocalFeedback(feedback);
      const t = setTimeout(() => setLocalFeedback(null), 3500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  if (loading) return <div aria-busy="true">Chargement des demandes...</div>;
  if (error)
    return (
      <div role="alert" style={{ color: "red" }}>
        {error}
      </div>
    );
  if (!requests || requests.length === 0) return null;

  return (
    <div
      style={{ marginBottom: 16 }}
      aria-label="Demandes d’adhésion en attente"
      role="region"
    >
      <h4 style={{ marginBottom: 8 }}>Demandes d’adhésion en attente</h4>
      {localFeedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: "#e6ffe6",
            color: "#217a36",
            border: "1px solid #b2e5b2",
            borderRadius: 4,
            padding: 8,
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          {localFeedback}
        </div>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>

        {requests.filter(Boolean).map((req) => (

          <li
            key={req._id}
            style={{ marginBottom: 8, display: "flex", alignItems: "center" }}
          >
            <span style={{ flex: 1 }}>

              Demande de <b>{req.userId ?? 'Utilisateur'}</b>
            </span>
            <button
              onClick={async () => {
                setActionLoading(req._id);
                await onAccept(req._id);
                setActionLoading(null);
              }}
              disabled={!!actionLoading || loading}
              aria-disabled={!!actionLoading || loading}
              style={{ marginRight: 8 }}
            >
              {actionLoading === req._id && loading ? "..." : "Accepter"}
            </button>
            <button
              onClick={async () => {
                setActionLoading(req._id);
                await onDecline(req._id);
                setActionLoading(null);
              }}
              disabled={!!actionLoading || loading}
              aria-disabled={!!actionLoading || loading}
              style={{ color: "red" }}
            >
              {actionLoading === req._id && loading ? "..." : "Refuser"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelJoinRequestsList;
