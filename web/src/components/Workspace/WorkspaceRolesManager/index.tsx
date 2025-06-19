import React from "react";
import { useSelector } from "react-redux";
import { usePermissions } from "@hooks/usePermissions";
import RoleSelector from "@components/Permissions/RoleSelector";
import UserAvatar from "@components/UserAvatar";
import Loader from "@components/Loader";
import styles from "./WorkspaceRolesManager.module.scss";
import type { RootState } from "@store/store";

interface WorkspaceRolesManagerProps {
  workspaceId: string;
  isOwnerOrAdmin: boolean;
}

const WorkspaceRolesManager: React.FC<WorkspaceRolesManagerProps> = ({
  workspaceId,
  isOwnerOrAdmin,
}) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const {
    permissions,
    setRole,
    loading: permLoading,
  } = usePermissions(workspaceId);

  if (!isOwnerOrAdmin) {
    return (
      <div className={styles["noAccess"]}>
        <p>
          Vous n'avez pas les permissions pour gérer les rôles de ce workspace.
        </p>
      </div>
    );
  }

  return (
    <div className={styles["rolesManager"]}>
      <h3>Rôles du Workspace</h3>
      <p className={styles["description"]}>
        Gérez les rôles globaux des membres dans ce workspace. Ces rôles
        s'appliquent à l'ensemble du workspace et servent de base pour les
        permissions.
      </p>{" "}
      {permLoading ? (
        <Loader />
      ) : (
        <div className={styles["rolesList"]}>
          {(() => {
            // Filtrer les permissions valides (avec userId non null) ET exclure l'utilisateur actuel
            const validPermissions = permissions.filter(
              (permission) =>
                permission.userId !== null &&
                permission.userId.email !== currentUser?.email
            );

            if (permissions.length > 0 && validPermissions.length === 0) {
              return (
                <div className={styles["emptyState"]}>
                  <p>
                    Aucun autre membre avec des permissions spécifiques trouvé.
                  </p>
                  <p className={styles["infoText"]}>
                    💡 Vous ne pouvez pas modifier votre propre rôle. Seuls les
                    autres membres du workspace sont affichés ici.
                  </p>
                </div>
              );
            }

            if (validPermissions.length > 0) {
              return validPermissions.map((permission) => (
                <div key={permission._id} className={styles["roleItem"]}>
                  <div className={styles["userInfo"]}>
                    <UserAvatar
                      avatar={permission.userId.avatar || null}
                      username={permission.userId.username || ""}
                      email={permission.userId.email || ""}
                      height="3.2rem"
                      size="custom"
                      className={styles["roleAvatar"]}
                    />
                    <div className={styles["userDetails"]}>
                      <span className={styles["userName"]}>
                        {permission.userId.username ||
                          permission.userId.email ||
                          "Utilisateur inconnu"}
                      </span>
                      <span className={styles["userEmail"]}>
                        {permission.userId.email || "Email non disponible"}
                      </span>
                    </div>
                    <div className={styles["roleSelector"]}>
                      <label>Rôle :</label>
                      <RoleSelector
                        value={permission.role}
                        onChange={(newRole) =>
                          setRole(permission._id, { role: newRole })
                        }
                      />
                    </div>
                  </div>
                </div>
              ));
            }

            return (
              <div className={styles["emptyState"]}>
                <p>Aucun membre avec des permissions spécifiques trouvé.</p>
              </div>
            );
          })()}
        </div>
      )}
      <div className={styles["roleInfo"]}>
        <h4>Types de rôles :</h4>
        <ul>
          <li>
            <strong>admin</strong> : Peut gérer le workspace, inviter des
            membres, gérer les canaux et les rôles
          </li>
          <li>
            <strong>membre</strong> : Accès standard aux canaux auxquels il a
            été invité, peut participer aux discussions
          </li>
          <li>
            <strong>invité</strong> : Accès limité, principalement en lecture
            seule, permissions restreintes
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WorkspaceRolesManager;
