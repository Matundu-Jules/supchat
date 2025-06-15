import React, { useState } from "react";
import {
  ChannelRole,
  getDefaultPermissions,
  hasPermission,
  getRoleLabel,
  getRoleDescription,
  getRoleIcon,
  getRoleColor,
} from "@utils/channelPermissions";
import styles from "./ChannelPermissionsManager.module.scss";

interface ChannelPermissionsManagerProps {
  channelId: string;
  currentUserRole: ChannelRole;
  targetUserId: string;
  targetUserRole: ChannelRole;
  onRoleChange?: (userId: string, newRole: ChannelRole) => void;
  onPermissionChange?: (
    userId: string,
    permission: string,
    enabled: boolean
  ) => void;
  isReadOnly?: boolean;
}

const ChannelPermissionsManager: React.FC<ChannelPermissionsManagerProps> = ({
  currentUserRole,
  targetUserId,
  targetUserRole,
  onRoleChange,
  onPermissionChange,
  isReadOnly = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChannelRole>(targetUserRole);
  const [customPermissions, setCustomPermissions] = useState<any>({});

  const canManagePermissions = hasPermission(currentUserRole, "canChangeRoles");
  const permissions = getDefaultPermissions(selectedRole);

  const handleRoleChange = (newRole: ChannelRole) => {
    if (!canManagePermissions || isReadOnly) return;

    setSelectedRole(newRole);
    setCustomPermissions({}); // Reset custom permissions
    onRoleChange?.(targetUserId, newRole);
  };

  const toggleCustomPermission = (permissionKey: string) => {
    if (!canManagePermissions || isReadOnly) return;

    const newValue = !customPermissions[permissionKey];
    const newCustomPerms = {
      ...customPermissions,
      [permissionKey]: newValue,
    };

    setCustomPermissions(newCustomPerms);
    onPermissionChange?.(targetUserId, permissionKey, newValue);
  };

  const permissionCategories = [
    {
      title: "📖 Lecture et participation",
      permissions: [
        { key: "canRead", label: "Lire les messages" },
        { key: "canWrite", label: "Écrire des messages" },
        { key: "canSendFiles", label: "Partager des fichiers" },
        { key: "canReact", label: "Ajouter des réactions" },
      ],
    },
    {
      title: "✏️ Gestion des messages",
      permissions: [
        { key: "canEditOwnMessages", label: "Modifier ses propres messages" },
        {
          key: "canDeleteOwnMessages",
          label: "Supprimer ses propres messages",
        },
        { key: "canEditAnyMessage", label: "Modifier tous les messages" },
        { key: "canDeleteAnyMessage", label: "Supprimer tous les messages" },
        { key: "canPinMessages", label: "Épingler des messages" },
      ],
    },
    {
      title: "👥 Gestion des membres",
      permissions: [
        { key: "canSeeAllMembers", label: "Voir tous les membres" },
        { key: "canInviteMembers", label: "Inviter des membres" },
        { key: "canRemoveMembers", label: "Exclure des membres" },
        { key: "canChangeRoles", label: "Changer les rôles" },
      ],
    },
    {
      title: "🔧 Administration du canal",
      permissions: [
        { key: "canEditChannel", label: "Modifier le canal" },
        { key: "canArchiveChannel", label: "Archiver le canal" },
        { key: "canDeleteChannel", label: "Supprimer le canal" },
        { key: "canModerate", label: "Modérer le canal" },
        { key: "canManageBots", label: "Gérer les bots" },
        { key: "canManageIntegrations", label: "Gérer les intégrations" },
      ],
    },
    {
      title: "🌐 Accès et navigation",
      permissions: [
        { key: "canAccessPublicChannels", label: "Accéder aux canaux publics" },
        { key: "canSearchChannels", label: "Rechercher dans les canaux" },
      ],
    },
  ];
  return (
    <div className={styles["permissionsManager"]}>
      <div className={styles["roleSection"]}>
        <h3 className={styles["sectionTitle"]}>
          <span className={styles["roleIcon"]}>
            {getRoleIcon(selectedRole)}
          </span>
          Rôle et Permissions
        </h3>

        <div className={styles["roleSelector"]}>
          <label className={styles["label"]}>Rôle :</label>
          <div className={styles["roleOptions"]}>
            {(["admin", "member", "guest"] as ChannelRole[]).map((role) => (
              <button
                key={role}
                className={`${styles["roleOption"]} ${
                  selectedRole === role ? styles["roleOptionActive"] : ""
                } ${
                  !canManagePermissions || isReadOnly ? styles["disabled"] : ""
                }`}
                onClick={() => handleRoleChange(role)}
                disabled={!canManagePermissions || isReadOnly}
                style={{
                  borderColor:
                    selectedRole === role ? getRoleColor(role) : undefined,
                  color: selectedRole === role ? getRoleColor(role) : undefined,
                }}
              >
                <span className={styles["roleOptionIcon"]}>
                  {getRoleIcon(role)}
                </span>
                <div className={styles["roleOptionContent"]}>
                  <span className={styles["roleOptionLabel"]}>
                    {getRoleLabel(role)}
                  </span>
                  <span className={styles["roleOptionDescription"]}>
                    {getRoleDescription(role)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles["permissionsSection"]}>
        <h4 className={styles["permissionsTitle"]}>
          Permissions détaillées
          {selectedRole === "guest" && (
            <span className={styles["guestNote"]}>
              ⚠️ Les invités peuvent écrire uniquement si autorisé par un admin
            </span>
          )}
        </h4>

        {permissionCategories.map((category) => (
          <div key={category.title} className={styles["permissionCategory"]}>
            <h5 className={styles["categoryTitle"]}>{category.title}</h5>
            <div className={styles["permissionsList"]}>
              {category.permissions.map((perm) => {
                const hasDefaultPermission =
                  permissions[perm.key as keyof typeof permissions];
                const hasCustomPermission = customPermissions[perm.key];
                const finalPermission =
                  hasCustomPermission !== undefined
                    ? hasCustomPermission
                    : hasDefaultPermission;

                return (
                  <div key={perm.key} className={styles["permissionItem"]}>
                    <label className={styles["permissionLabel"]}>
                      <input
                        type="checkbox"
                        checked={finalPermission}
                        onChange={() => toggleCustomPermission(perm.key)}
                        disabled={!canManagePermissions || isReadOnly}
                        className={styles["permissionCheckbox"]}
                      />
                      <span className={styles["permissionText"]}>
                        {perm.label}
                        {hasCustomPermission !== undefined && (
                          <span className={styles["customBadge"]}>
                            {hasCustomPermission ? "Accordé" : "Retiré"}
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!canManagePermissions && (
        <div className={styles["noPermissionMessage"]}>
          <i className="fa-solid fa-lock" />
          <p>
            Vous n'avez pas les permissions pour modifier les rôles et
            permissions.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChannelPermissionsManager;
