import React, { useState, useEffect } from "react";
import {
  getChannelMembers,
  updateChannelMemberRole,
  removeChannelMember,
  addChannelMember,
} from "@services/channelApi";
import { getWorkspaceMembers } from "@services/workspaceApi";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import UserAvatar from "@components/user/UserAvatar";
import Loader from "@components/core/ui/Loader";
import styles from "./ChannelMembersManager.module.scss";

interface ChannelMember {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

interface WorkspaceMember {
  _id: string;
  username: string;
  email: string;
}

interface ChannelMembersManagerProps {
  workspaceId: string;
  channelId: string;
  channelName: string;
  onMembersChange?: () => void;
}

const ChannelMembersManager: React.FC<ChannelMembersManagerProps> = ({
  workspaceId,
  channelId,
  channelName,
  onMembersChange,
}) => {
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Utiliser le hook centralisé pour vérifier les permissions d'admin de canal
  const { canManageMembers: isChannelAdmin } = useChannelPermissions(
    channelId,
    workspaceId
  );

  useEffect(() => {
    loadData();
  }, [channelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [channelMembersData, workspaceMembersData] = await Promise.all([
        getChannelMembers(channelId),
        getWorkspaceMembers(workspaceId),
      ]);

      setMembers(channelMembersData);
      setWorkspaceMembers(workspaceMembersData);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(`role-${userId}`);
      setError(null);

      await updateChannelMemberRole(channelId, userId, newRole);

      // Mettre à jour localement
      setMembers((prev) =>
        prev.map((member) =>
          member._id === userId ? { ...member, role: newRole } : member
        )
      );

      onMembersChange?.();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du rôle:", err);
      setError(err.message || "Erreur lors de la mise à jour du rôle");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce membre du canal ?")) {
      return;
    }

    try {
      setActionLoading(`remove-${userId}`);
      setError(null);

      await removeChannelMember(channelId, userId);

      // Supprimer localement
      setMembers((prev) => prev.filter((member) => member._id !== userId));

      onMembersChange?.();
    } catch (err: any) {
      console.error("Erreur lors de la suppression du membre:", err);
      setError(err.message || "Erreur lors de la suppression du membre");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError("Veuillez sélectionner un utilisateur");
      return;
    }

    try {
      setActionLoading("add-member");
      setError(null);

      await addChannelMember(channelId, selectedUserId);

      // Ajouter localement
      const userToAdd = workspaceMembers.find((u) => u._id === selectedUserId);
      if (userToAdd) {
        setMembers((prev) => [...prev, { ...userToAdd, role: "membre" }]);
      }

      setShowAddMember(false);
      setSelectedUserId("");
      onMembersChange?.();
    } catch (err: any) {
      console.error("Erreur lors de l'ajout du membre:", err);
      setError(err.message || "Erreur lors de l'ajout du membre");
    } finally {
      setActionLoading(null);
    }
  };

  const availableUsersToAdd = workspaceMembers.filter(
    (wsUser) => !members.some((member) => member._id === wsUser._id)
  );

  if (!isChannelAdmin) {
    return (
      <div className={styles["noAccess"]}>
        <p>
          Vous n'avez pas les permissions pour gérer les membres de ce canal.
        </p>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles["channelMembersManager"]}>
      <div className={styles["header"]}>
        <h3>Membres du canal #{channelName}</h3>
        <button
          className={styles["addButton"]}
          onClick={() => setShowAddMember(true)}
          disabled={availableUsersToAdd.length === 0}
        >
          + Ajouter un membre
        </button>
      </div>

      {error && <div className={styles["error"]}>{error}</div>}

      {showAddMember && (
        <div className={styles["addMemberSection"]}>
          <h4>Ajouter un membre</h4>
          <div className={styles["addMemberForm"]}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={styles["userSelect"]}
            >
              <option value="">Sélectionner un utilisateur</option>
              {availableUsersToAdd.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
            <div className={styles["addMemberActions"]}>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId || actionLoading === "add-member"}
                className={styles["confirmButton"]}
              >
                {actionLoading === "add-member" ? "Ajout..." : "Ajouter"}
              </button>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedUserId("");
                  setError(null);
                }}
                className={styles["cancelButton"]}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles["membersList"]}>
        {members.length > 0 ? (
          members.map((member) => (
            <div key={member._id} className={styles["memberItem"]}>
              <div className={styles["memberInfo"]}>
                {/* Avatar de l'utilisateur */}
                <UserAvatar
                  avatar={(member as any).avatar}
                  username={member.username}
                  email={member.email}
                  height="2.8rem"
                  size="custom"
                  className={styles["channelMemberAvatar"]}
                />
                <div className={styles["memberDetails"]}>
                  <div className={styles["memberTextInfo"]}>
                    <span className={styles["memberName"]}>
                      {member.username}
                    </span>
                    <span className={styles["memberEmail"]}>
                      {member.email}
                    </span>
                  </div>
                </div>
                <div className={styles["memberActions"]}>
                  <div className={styles["roleSelector"]}>
                    <label>Rôle :</label>
                    <select
                      value={member.role || "membre"}
                      onChange={(e) =>
                        handleRoleChange(member._id, e.target.value)
                      }
                      disabled={actionLoading === `role-${member._id}`}
                      className={styles["roleSelect"]}
                    >
                      <option value="admin">Admin</option>
                      <option value="membre">Membre</option>
                      <option value="invité">Invité</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={actionLoading === `remove-${member._id}`}
                    className={styles["removeButton"]}
                    title="Retirer du canal"
                  >
                    {actionLoading === `remove-${member._id}` ? "..." : "🗑️"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles["emptyState"]}>
            <p>Aucun membre dans ce canal.</p>
          </div>
        )}
      </div>

      <div className={styles["helpSection"]}>
        <h4>💡 Gestion des membres :</h4>
        <ul>
          <li>
            <strong>Admin :</strong> Peut gérer tous les aspects du canal
          </li>
          <li>
            <strong>Membre :</strong> Peut voir et participer aux discussions
          </li>
          <li>
            <strong>Invité :</strong> Accès limité au canal
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChannelMembersManager;
