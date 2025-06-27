import React from "react";
import styles from "./WorkspaceRolesManager.module.scss";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface WorkspaceRolesManagerProps {
  users: User[];
  currentUserId: string;
  onPromote: (userId: string, newRole: string) => void;
  onDemote: (userId: string, newRole: string) => void;
  canEdit: boolean;
}

const ROLES = ["admin", "membre", "invité"];

const WorkspaceRolesManager: React.FC<WorkspaceRolesManagerProps> = ({
  users,
  currentUserId,
  onPromote,
  onDemote,
  canEdit,
}) => {
  return (
    <div className={styles["manager"]}>
      <h3>Rôles du workspace</h3>
      <ul className={styles["userList"]}>
        {users.map((u) => (
          <li key={u.id} className={styles["userItem"]}>
            <span>{u.username || u.email}</span>
            <span className={styles["roleBadge"]}>{u.role}</span>
            {canEdit && u.id !== currentUserId && (
              <div className={styles["actions"]}>
                {u.role !== "admin" && (
                  <button
                    className="btn"
                    onClick={() => onPromote(u.id, "admin")}
                  >
                    Promouvoir admin
                  </button>
                )}
                {u.role === "admin" && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onDemote(u.id, "membre")}
                  >
                    Rétrograder membre
                  </button>
                )}
                {u.role === "membre" && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onDemote(u.id, "invité")}
                  >
                    Rétrograder invité
                  </button>
                )}
                {u.role === "invité" && (
                  <button
                    className="btn"
                    onClick={() => onPromote(u.id, "membre")}
                  >
                    Promouvoir membre
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkspaceRolesManager;
