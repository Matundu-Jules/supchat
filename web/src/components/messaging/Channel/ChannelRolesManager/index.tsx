import React, { useState } from "react";
import { usePermissions } from "@hooks/usePermissions";
import RoleSelector from "@components/permissions/RoleSelector";
import UserAvatar from "@components/user/UserAvatar";
import Loader from "@components/core/ui/Loader";
import styles from "./ChannelRolesManager.module.scss";

interface ChannelRolesManagerProps {
  workspaceId: string;
  channels: any[];
  isOwnerOrAdmin: boolean;
  channel: any;
  currentUserId: string;
  onPromote: (userId: string, role: string) => void;
  onDemote: (userId: string, role: string) => void;
  canEdit: boolean;
}

const ROLES = ["admin", "moderator", "member", "guest"];

// Fournit des callbacks vides par défaut pour éviter les erreurs si non utilisés
const noop = () => {};

const ChannelRolesManager: React.FC<ChannelRolesManagerProps> = ({
  workspaceId,
  channels,
  isOwnerOrAdmin,
  channel = { members: [] },
  currentUserId = "",
  onPromote = noop,
  onDemote = noop,
  canEdit = false,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(
    channels.length > 0 ? channels[0]._id : null
  );

  const {
    permissions,
    setRole,
    loading: permLoading,
  } = usePermissions(workspaceId);

  if (!isOwnerOrAdmin) {
    return (
      <div className={styles["noAccess"]}>
        <p>Vous n'avez pas les permissions pour gérer les rôles des canaux.</p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className={styles["emptyChannels"]}>
        <p>
          Aucun canal disponible. Créez d'abord un canal pour gérer les rôles.
        </p>
      </div>
    );
  }

  const selectedChannelData = channels.find((c) => c._id === selectedChannel);

  return (
    <div className={styles["channelRolesManager"]}>
      <h3>Rôles par Canal</h3>
      <p className={styles["description"]}>
        Définissez des rôles spécifiques pour chaque canal. Ces rôles s'ajoutent
        ou remplacent les rôles du workspace pour ce canal.
      </p>

      {/* Sélecteur de canal */}
      <div className={styles["channelSelector"]}>
        <label htmlFor="channel-select">Sélectionner un canal :</label>
        <select
          id="channel-select"
          value={selectedChannel || ""}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className={styles["channelSelect"]}
        >
          {channels.map((channel) => (
            <option key={channel._id} value={channel._id}>
              # {channel.name}
            </option>
          ))}
        </select>
      </div>

      {selectedChannel && selectedChannelData && (
        <div className={styles["channelRolesSection"]}>
          <div className={styles["channelHeader"]}>
            <h4>Canal : # {selectedChannelData.name}</h4>
            <p className={styles["channelDescription"]}>
              {selectedChannelData.description || "Aucune description"}
            </p>
          </div>

          {permLoading ? (
            <Loader />
          ) : (
            <div className={styles["rolesList"]}>
              {permissions.length > 0 ? (
                permissions.map((permission) => {
                  const channelRole = permission.channelRoles?.find(
                    (cr: any) => cr.channelId === selectedChannel
                  );
                  const effectiveRole = channelRole?.role || permission.role;

                  return (
                    <div key={permission._id} className={styles["roleItem"]}>
                      <div className={styles["userInfo"]}>
                        {/* Avatar de l'utilisateur */}
                        <UserAvatar
                          avatar={(permission.userId as any).avatar}
                          username={permission.userId.username}
                          email={permission.userId.email}
                          height="3.2rem"
                          size="custom"
                          className={styles["channelRoleAvatar"]}
                        />

                        <div className={styles["userDetails"]}>
                          <span className={styles["userName"]}>
                            {permission.userId.username ||
                              permission.userId.email}
                          </span>
                          <span className={styles["userEmail"]}>
                            {permission.userId.email}
                          </span>
                          <span className={styles["baseRole"]}>
                            Rôle workspace : <strong>{permission.role}</strong>
                          </span>
                        </div>
                        <div className={styles["channelRoleSelector"]}>
                          <label>Rôle dans ce canal :</label>
                          <RoleSelector
                            value={effectiveRole}
                            onChange={(newRole) => {
                              const existingChannelRoles =
                                permission.channelRoles || [];
                              const otherChannelRoles =
                                existingChannelRoles.filter(
                                  (cr: any) => cr.channelId !== selectedChannel
                                );

                              const newChannelRoles = [
                                ...otherChannelRoles,
                                { channelId: selectedChannel, role: newRole },
                              ];

                              setRole(permission._id, {
                                channelRoles: newChannelRoles,
                              });
                            }}
                          />
                          {channelRole && (
                            <button
                              className={styles["resetButton"]}
                              onClick={() => {
                                const otherChannelRoles =
                                  permission.channelRoles.filter(
                                    (cr: any) =>
                                      cr.channelId !== selectedChannel
                                  );
                                setRole(permission._id, {
                                  channelRoles: otherChannelRoles,
                                });
                              }}
                              title="Utiliser le rôle du workspace"
                            >
                              ↻ Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles["emptyState"]}>
                  <p>Aucun membre avec des permissions trouvé.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className={styles["helpSection"]}>
        <h4>💡 Comment ça fonctionne :</h4>
        <ul>
          <li>Par défaut, les membres utilisent leur rôle du workspace</li>
          <li>Vous pouvez définir un rôle spécifique pour chaque canal</li>
          <li>
            Le rôle spécifique remplace le rôle du workspace pour ce canal
          </li>
          <li>Utilisez "Reset" pour revenir au rôle du workspace</li>
        </ul>
      </div>

      <div className={styles["manager"]}>
        <h3>Rôles du canal « {channel.name} »</h3>
        <ul className={styles["userList"]}>
          {channel.members.map((m: any) => (
            <li key={m._id} className={styles["userItem"]}>
              <span>{m.username || m.email}</span>
              <span className={styles["roleBadge"]}>{m.role || "member"}</span>
              {canEdit && m._id !== currentUserId && (
                <div className={styles["actions"]}>
                  {m.role !== "admin" && (
                    <button
                      className="btn"
                      onClick={() => onPromote(m._id, "admin")}
                    >
                      Promouvoir admin
                    </button>
                  )}
                  {m.role === "admin" && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => onDemote(m._id, "moderator")}
                    >
                      Rétrograder modérateur
                    </button>
                  )}
                  {m.role === "moderator" && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => onDemote(m._id, "member")}
                    >
                      Rétrograder membre
                    </button>
                  )}
                  {m.role === "member" && (
                    <button
                      className="btn"
                      onClick={() => onPromote(m._id, "moderator")}
                    >
                      Promouvoir modérateur
                    </button>
                  )}
                  {m.role === "guest" && (
                    <button
                      className="btn"
                      onClick={() => onPromote(m._id, "member")}
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
    </div>
  );
};

export default ChannelRolesManager;
