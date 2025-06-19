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
    isInvited?: boolean; // Ajouté pour la gestion des invitations
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
  onAcceptInvite?: (workspace: Workspace) => void; // Ajouté pour accepter une invitation
  showOnlyJoinActions?: boolean;
  requestJoinLoading?: boolean;
  acceptInviteLoading?: string | null; // Ajouté pour gérer le chargement du bouton 'Rejoindre'
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
  onAcceptInvite, // Ajouté
  showOnlyJoinActions = false,
  requestJoinLoading = false,
  acceptInviteLoading = null, // Ajouté
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
        const isInvited = ws.userStatus?.isInvited || false; // Invitation : seuls owner ou admin peuvent inviter
        const canInvite = isOwner || isAdmin;

        // Peut demander à rejoindre : workspace public, utilisateur connecté, pas déjà membre, pas propriétaire, pas déjà demandé, et pas admin
        const canRequestJoin =
          user &&
          ws.isPublic &&
          !isMember &&
          !isOwner &&
          !isAdmin &&
          !hasRequestedJoin &&
          !isInvited;

        // Peut rejoindre via invitation : utilisateur invité, pas encore membre
        const canAcceptInvite = isInvited && !isMember;
        return (
          <li key={ws._id} className={styles["workspace-list-item"]}>
            <div className={styles["workspace-list-header"]}>
              <h3>{ws.name}</h3>
              <div className={styles["workspace-badges"]}>
                <span
                  className={
                    `${styles["workspace-badge"]} ` +
                    (ws.isPublic ? styles["public"] : styles["private"])
                  }
                >
                  {ws.isPublic ? "Public" : "Privé"}
                </span>
                {isInvited && !isMember && (
                  <span className={styles["workspace-invited-badge"]}>
                    <i className="fa-solid fa-envelope"></i> Invitation reçue
                  </span>
                )}
              </div>
            </div>
            {ws.description && (
              <p className={styles["workspace-description"]}>
                {ws.description}
              </p>
            )}{" "}
            <div className={styles["workspace-actions"]}>
              {/* Action principale : Accéder (membre/propriétaire/admin et pas en mode joinActions) */}
              {!showOnlyJoinActions && (isMember || isOwner || isAdmin) && (
                <button className={`btn`} onClick={() => onAccess?.(ws)}>
                  Accéder
                </button>
              )}
              {/* Action de demande de rejoindre (pour les workspaces publics non rejoints) */}
              {canRequestJoin && (
                <button
                  onClick={() => onRequestJoin?.(ws)}
                  className={`btn ${styles["btn-request-join"]}`}
                  title="Demander à rejoindre ce workspace"
                  aria-label="Demander à rejoindre ce workspace"
                  type="button"
                  disabled={requestJoinLoading}
                >
                  {requestJoinLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-plus"></i>
                      Demander à rejoindre
                    </>
                  )}
                </button>
              )}
              {/* Action : Rejoindre le workspace si invité */}
              {canAcceptInvite && (
                <button
                  onClick={() => onAcceptInvite?.(ws)}
                  className={`btn ${styles["btn-accept-invite"]}`}
                  title="Rejoindre ce workspace (invitation)"
                  aria-label="Rejoindre ce workspace (invitation)"
                  type="button"
                  disabled={acceptInviteLoading === ws._id}
                >
                  {acceptInviteLoading === ws._id ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                      Rejoindre...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-door-open"></i> Rejoindre le
                      workspace
                    </>
                  )}
                </button>
              )}
              {/* État : Demande en attente */}
              {hasRequestedJoin && (
                <span className={styles["request-pending"]}>
                  <i className="fa-solid fa-clock"></i>
                  Demande en attente de validation
                </span>
              )}
              {/* Actions de gestion (inviter) - seulement pour les propriétaires/admins et pas en mode joinActions */}
              {!showOnlyJoinActions && canInvite && (
                <button
                  onClick={() => onInvite?.(ws)}
                  className={styles["workspace-action-icon"]}
                  title="Inviter des utilisateurs"
                  aria-label="Inviter des utilisateurs"
                  type="button"
                >
                  <i
                    className={`fa-solid fa-user-plus ${styles["icon-invite"]}`}
                  ></i>
                </button>
              )}
              {!showOnlyJoinActions && (isOwner || isAdmin) && (
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
