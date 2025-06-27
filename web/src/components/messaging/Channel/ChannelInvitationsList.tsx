import React, { useEffect, useState } from "react";
import type { ChannelInvitation } from "@ts_types/channel";

interface ChannelInvitationsListProps {
  invitations: ChannelInvitation[];
  loading?: boolean;
  error?: string | null;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  feedback?: string | null;
}

const ChannelInvitationsList: React.FC<ChannelInvitationsListProps> = ({
  invitations,
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
      const timer = setTimeout(() => setLocalFeedback(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (loading) return <div aria-busy="true">Chargement des invitations...</div>;
  if (error)
    return (
      <div role="alert" style={{ color: "red" }}>
        {error}
      </div>
    );
  if (!invitations || invitations.length === 0) return null;

  return (
    <div
      style={{ marginBottom: 16 }}
      aria-label="Invitations en attente"
      role="region"
    >
      <h4 style={{ marginBottom: 8 }}>Invitations en attente</h4>
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
        {invitations.map((inv) => (
          <li
            key={inv._id}
            style={{ marginBottom: 8, display: "flex", alignItems: "center" }}
          >
            <span style={{ flex: 1 }}>
              Canal : <b>{inv.channelName || inv.channelId}</b> — Invité par{" "}
              <b>
                {inv.invitedBy?.username || inv.invitedBy?.email || inv.email}
              </b>
            </span>
            <button
              onClick={async () => {
                setActionLoading(inv._id);
                await onAccept(inv._id);
                setActionLoading(null);
              }}
              disabled={!!actionLoading || loading}
              aria-disabled={!!actionLoading || loading}
              style={{ marginRight: 8 }}
            >
              {actionLoading === inv._id && loading ? "..." : "Accepter"}
            </button>
            <button
              onClick={async () => {
                setActionLoading(inv._id);
                await onDecline(inv._id);
                setActionLoading(null);
              }}
              disabled={!!actionLoading || loading}
              aria-disabled={!!actionLoading || loading}
              style={{ color: "red" }}
            >
              {actionLoading === inv._id && loading ? "..." : "Refuser"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelInvitationsList;
