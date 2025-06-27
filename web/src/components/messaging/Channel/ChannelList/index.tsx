import React from "react";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import styles from "./ChannelList.module.scss";
import type { Channel } from "../../../../types/channel";

interface ChannelListProps {
  channels: Channel[];
  filter?: string;
  userId: string;
  onAccess?: (channel: Channel) => void;
  onJoin?: (channel: Channel) => void;
  onLeave?: (channel: Channel) => void;
  onEdit?: (channel: Channel) => void;
  onDelete?: (channel: Channel) => void;
  loadingChannelId?: string;
  onActionFeedback?: (msg: string, type: "success" | "error") => void;
}

// Helpers pour la logique d'accès
function canUserJoin(channel: Channel, userId: string, userRole: string) {
  if (channel.members?.some((m) => m._id === userId)) return false; // déjà membre
  if (channel.type === "public") {
    return userRole === "admin" || userRole === "membre";
  }
  if (channel.type === "private") {
    // Par défaut, seuls les admins peuvent rejoindre un canal privé s'ils ne sont pas déjà membres
    return userRole === "admin";
  }
  return false;
}
function canUserLeave(channel: Channel, userId: string) {
  if (!channel.members?.some((m) => m._id === userId)) return false;
  // Sans createdBy, on autorise tous les membres à quitter
  return true;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  filter,
  userId,
  onAccess,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
  loadingChannelId,
  onActionFeedback,
}) => {
  const lowered = filter ? filter.toLowerCase() : "";
  const filtered = lowered
    ? channels.filter(
        (c) =>
          c.name.toLowerCase().includes(lowered) ||
          (c.description || "").toLowerCase().includes(lowered)
      )
    : channels;

  if (!filtered.length) {
    return <p>Aucun canal pour le moment.</p>;
  }

  return (
    <ul className={styles["channel-list"]}>
      {filtered.map((ch) => {
        const isMember = ch.members?.some((m) => m._id === userId);
        // Contrôle d'accès : masquer les canaux privés si non membre
        if (ch.type === "private" && !isMember) return null;
        // Permissions pour chaque canal
        const perms = useChannelPermissions(ch._id, ch.workspaceId);
        const isLoading = loadingChannelId === ch._id;
        // Rôle utilisateur (fallback à membre)
        const userRole = "membre"; // À améliorer si le rôle est disponible globalement
        const canJoin = canUserJoin(ch, userId, userRole);
        const canLeave = canUserLeave(ch, userId);
        return (
          <li
            key={ch._id}
            className={styles["channel-item"]}
            tabIndex={0}
            aria-label={`Canal ${ch.name}`}
          >
            {" "}
            {/* focusable pour accessibilité */}
            <div className={styles["channel-header"]}>
              <strong>{ch.name}</strong>
              {ch.type && (
                <span className={styles["channel-badge"]}>{ch.type}</span>
              )}
            </div>
            {ch.description && (
              <p className={styles["channel-description"]}>{ch.description}</p>
            )}
            <div className={styles["channel-actions"]}>
              {onAccess && (
                <button
                  type="button"
                  className="btn"
                  aria-label={`Ouvrir le canal ${ch.name}`}
                  title={`Ouvrir le canal ${ch.name}`}
                  onClick={() => onAccess(ch)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      className={styles["spinner"]}
                      aria-label="Chargement..."
                    />
                  ) : (
                    "Ouvrir"
                  )}
                </button>
              )}
              {!isMember && onJoin && (
                <button
                  type="button"
                  className="btn"
                  aria-label={`Rejoindre le canal ${ch.name}`}
                  title={
                    canJoin
                      ? `Rejoindre le canal ${ch.name}`
                      : "Vous n'avez pas la permission de rejoindre ce canal"
                  }
                  onClick={() =>
                    canJoin
                      ? onJoin(ch)
                      : onActionFeedback?.("Permission refusée", "error")
                  }
                  disabled={!canJoin || isLoading}
                  tabIndex={canJoin ? 0 : -1}
                >
                  {isLoading ? (
                    <span
                      className={styles["spinner"]}
                      aria-label="Chargement..."
                    />
                  ) : (
                    "Rejoindre"
                  )}
                </button>
              )}
              {isMember && onLeave && (
                <button
                  type="button"
                  className="btn"
                  aria-label={`Quitter le canal ${ch.name}`}
                  title={
                    canLeave
                      ? `Quitter le canal ${ch.name}`
                      : "Vous ne pouvez pas quitter ce canal"
                  }
                  onClick={() =>
                    canLeave
                      ? onLeave(ch)
                      : onActionFeedback?.(
                          "Impossible de quitter ce canal",
                          "error"
                        )
                  }
                  disabled={!canLeave || isLoading}
                  tabIndex={canLeave ? 0 : -1}
                >
                  {isLoading ? (
                    <span
                      className={styles["spinner"]}
                      aria-label="Chargement..."
                    />
                  ) : (
                    "Quitter"
                  )}
                </button>
              )}
              {onEdit && perms.canEdit && (
                <button
                  type="button"
                  className="btn"
                  aria-label={`Éditer le canal ${ch.name}`}
                  title="Éditer le canal"
                  onClick={() => onEdit(ch)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      className={styles["spinner"]}
                      aria-label="Chargement..."
                    />
                  ) : (
                    "Éditer"
                  )}
                </button>
              )}
              {onDelete && perms.canDelete && (
                <button
                  type="button"
                  className="btn"
                  aria-label={`Supprimer le canal ${ch.name}`}
                  title="Supprimer le canal"
                  onClick={() => onDelete(ch)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      className={styles["spinner"]}
                      aria-label="Chargement..."
                    />
                  ) : (
                    "Supprimer"
                  )}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ChannelList;
