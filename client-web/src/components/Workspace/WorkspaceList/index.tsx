import React from "react";
import styles from "./WorkspaceList.module.scss";

type Workspace = {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  members?: any[];
};

type WorkspaceListProps = {
  workspaces: Workspace[];
  onAccess?: (workspace: Workspace) => void;
  onInvite?: (workspace: Workspace) => void;
  onEdit?: (workspace: Workspace) => void;
  onDelete?: (workspace: Workspace) => void;
};

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  onAccess,
  onInvite,
  onEdit,
  onDelete,
}) => {
  if (!workspaces.length) {
    return <p>Aucun espace de travail pour le moment.</p>;
  }

  return (
    <ul className={styles["workspace-list"]}>
      {workspaces.map((ws) => (
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
              <i className={`fa-solid fa-trash ${styles["icon-delete"]}`}></i>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default WorkspaceList;
