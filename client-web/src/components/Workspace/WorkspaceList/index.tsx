import React from "react";
import styles from "./WorkspaceList.module.scss";

type Workspace = {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  members?: any[];
  owner?: { email?: string; username?: string; _id?: string };
  userStatus?: {
    isMember: boolean;
    isOwner: boolean;
    hasRequestedJoin: boolean;
  };
};

type WorkspaceListProps = {
  workspaces: Workspace[];
  user?: { email?: string; role?: string; _id?: string } | undefined;
  filter?: string;
  onAccess?: (workspace: Workspace) => void;
  onInvite?: (workspace: Workspace) => void;
  onEdit?: (workspace: Workspace) => void;
  onDelete?: (workspace: Workspace) => void;
  onRequestJoin?: (workspace: Workspace) => void;
};

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  user,
  filter,
  onAccess,
  onInvite,
  onEdit,
  onDelete,
  onRequestJoin,
}) => {
  const lowered = filter ? filter.toLowerCase() : "";
  const filtered = lowered
    ? workspaces.filter(
        (w) =>
          w.name.toLowerCase().includes(lowered) ||
          (w.description || "").toLowerCase().includes(lowered)
      )
    : workspaces;

  if (!filtered.length) {
    return <p>Aucun espace de travail pour le moment.</p>;
  }

  return (
    <ul className={styles["workspace-list"]}>
      {filtered.map((ws) => {
        const isOwner =
          user &&
          ws.owner &&
          (user.email === ws.owner.email || user._id === ws.owner._id);
        const isAdmin = user && user.role === "admin";

        // Utiliser userStatus si disponible, sinon fallback sur l'ancienne logique
        const isMember =
          ws.userStatus?.isMember ||
          (ws.members &&
            user &&
            ws.members.some(
              (m) => (m._id || m) === user._id || (m.email || m) === user.email
            ));
        const hasRequestedJoin = ws.userStatus?.hasRequestedJoin || false;

        // Invitation : seuls owner ou admin peuvent inviter
        const canInvite = isOwner || isAdmin;

        // Peut demander à rejoindre : workspace public, utilisateur connecté, pas déjà membre, pas propriétaire, pas déjà demandé
        const canRequestJoin =
          user && ws.isPublic && !isMember && !isOwner && !hasRequestedJoin;

        return (
          <li key={ws._id} className={styles["workspace-list-item"]}>
            <div className={styles["workspace-list-header"]}>
              <strong>{ws.name}</strong>
              <span
                className={
                  `${styles["workspace-badge"]} ` +
                  (ws.isPublic ? styles["public"] : styles["private"])
                }
              >
                {ws.isPublic ? "Public" : "Privé"}
              </span>
            </div>
            {ws.description && (
              <div className={styles["workspace-description"]}>
                {ws.description}
              </div>
            )}
            <div className={styles["workspace-actions"]}>
              <button className={`btn`} onClick={() => onAccess?.(ws)}>
                Accéder
              </button>

              {canRequestJoin && (
                <button
                  onClick={() => onRequestJoin?.(ws)}
                  className={`btn ${styles["btn-request-join"]}`}
                  title="Demander à rejoindre"
                  aria-label="Demander à rejoindre"
                  type="button"
                >
                  Demander à rejoindre
                </button>
              )}

              {hasRequestedJoin && (
                <span className={styles["request-pending"]}>
                  Demande en cours...
                </span>
              )}

              {canInvite && (
                <button
                  onClick={() => onInvite?.(ws)}
                  className={styles["workspace-action-icon"]}
                  title="Inviter"
                  aria-label="Inviter"
                  type="button"
                >
                  <i
                    className={`fa-solid fa-user-plus ${styles["icon-invite"]}`}
                  ></i>
                </button>
              )}
              {(isOwner || isAdmin) && (
                <>
                  <button
                    onClick={() => onEdit?.(ws)}
                    className={styles["workspace-action-icon"]}
                    title="Modifier"
                    aria-label="Modifier"
                    type="button"
                  >
                    <i className={`fa-solid fa-pen ${styles["icon-edit"]}`}></i>
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Voulez-vous vraiment supprimer cet espace de travail ?"
                        )
                      ) {
                        onDelete?.(ws);
                      }
                    }}
                    className={`${styles["workspace-delete"]} ${styles["workspace-action-icon"]}`}
                    title="Supprimer"
                    aria-label="Supprimer"
                    type="button"
                  >
                    <i
                      className={`fa-solid fa-trash ${styles["icon-delete"]}`}
                    ></i>
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default WorkspaceList;
