import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceDetails } from "@hooks/useWorkspaceDetails";
import styles from "./WorkspaceDetailPage.module.scss";
import Loader from "@components/Loader";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import ChannelList from "@components/Channel/ChannelList";
import ChannelCreateForm from "@components/Channel/ChannelCreateForm";
import { useChannels } from "@hooks/useChannels";
import { useNavigate } from "react-router-dom";
import JoinRequestsManager from "@components/Workspace/JoinRequestsManager";
import WorkspaceRolesManager from "@components/Workspace/WorkspaceRolesManager";
import ChannelRolesManager from "@components/Workspace/ChannelRolesManager";
import ChannelMembersManager from "@components/Workspace/ChannelMembersManager";
import EditWorkspaceModal from "@components/Workspace/EditWorkspaceModal";

type MenuItem =
  | "members"
  | "channels"
  | "channel-management"
  | "roles"
  | "join-requests"
  | "settings";

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeMenu, setActiveMenu] = useState<MenuItem>("channels");
  const [showEditModal, setShowEditModal] = useState(false);
  const {
    workspace,
    loading,
    error,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    inviteError,
    inviteSuccess,
    setInviteSuccess,
    handleInvite,
    handleRemoveMember,
    editLoading,
    deleteLoading,
    handleEdit,
    handleDelete,
  } = useWorkspaceDetails(id || "");
  const navigate = useNavigate();
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
    fetchChannels,
    handleCreateChannel,
  } = useChannels(id || "");
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className={styles["container"]}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["container"]}>
        <p className={styles["error"]}>{error}</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className={styles["container"]}>
        <p className={styles["error"]}>Workspace introuvable.</p>
      </div>
    );
  }
  // Vérifie si l'utilisateur est admin ou owner du workspace
  const isAdminOrOwner =
    user &&
    workspace.owner &&
    (user.role === "admin" || user.email === workspace.owner.email);

  const handleChannelAccess = (channel: any) => {
    navigate(`/message?channel=${channel._id}`);
  };

  const handleEditWorkspace = () => {
    setShowEditModal(true);
  };

  const handleDeleteWorkspace = async () => {
    await handleDelete();
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };
  const handleEditModalSubmit = (data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    handleEdit(data);
    setShowEditModal(false);
  };
  const menuItems = [
    { id: "channels" as MenuItem, label: "Canaux", icon: "💬" },
    { id: "members" as MenuItem, label: "Membres", icon: "👥" },
    ...(isAdminOrOwner
      ? [
          {
            id: "channel-management" as MenuItem,
            label: "Gestion Canaux",
            icon: "🔧",
          },
          { id: "roles" as MenuItem, label: "Rôles", icon: "👑" },
          {
            id: "join-requests" as MenuItem,
            label: "Demandes d'accès",
            icon: "📨",
          },
          { id: "settings" as MenuItem, label: "Paramètres", icon: "⚙️" },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "members":
        return (
          <div className={styles["content"]}>
            <h2>Membres du workspace</h2>
            <div className={styles["membersSection"]}>
              <h3>Liste des membres</h3>
              <ul className={styles["membersList"]}>
                {" "}
                {workspace.members && workspace.members.length > 0 ? (
                  workspace.members.map((member: any) => (
                    <li key={member._id} className={styles["memberItem"]}>
                      <div className={styles["memberInfo"]}>
                        <div className={styles["memberDetails"]}>
                          <span className={styles["memberName"]}>
                            {member.username || member.email}
                          </span>
                          {member.email === workspace.owner?.email && (
                            <span className={styles["ownerBadge"]}>
                              Propriétaire
                            </span>
                          )}
                        </div>

                        {/* Bouton de suppression - Visible seulement pour admin/owner et pas pour le propriétaire */}
                        {isAdminOrOwner &&
                          member.email !== workspace.owner?.email && (
                            <button
                              className={styles["removeMemberButton"]}
                              onClick={() => handleRemoveMember(member._id)}
                              title="Supprimer ce membre"
                            >
                              🗑️
                            </button>
                          )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className={styles["empty"]}>Aucun membre</li>
                )}
              </ul>

              {/* Invitation de nouveaux membres */}
              {isAdminOrOwner && (
                <div className={styles["inviteSection"]}>
                  <h3>Inviter un nouveau membre</h3>
                  <form
                    className={styles["inviteForm"]}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleInvite();
                    }}
                    autoComplete="off"
                  >
                    <input
                      type="email"
                      placeholder="Email du membre"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        if (inviteSuccess) setInviteSuccess(null);
                      }}
                      className={
                        styles["input"] +
                        (inviteError ? " " + styles["inputError"] : "")
                      }
                      required
                      disabled={inviteLoading}
                    />
                    <button
                      type="submit"
                      className={styles["submitButton"]}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? "Envoi..." : "Inviter"}
                    </button>
                  </form>
                  {inviteError && (
                    <div className={styles["error"]}>{inviteError}</div>
                  )}{" "}
                  {inviteSuccess && !inviteError && (
                    <div className={styles["success"]}>{inviteSuccess}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "channels":
        return (
          <div className={styles["content"]}>
            <h2>Canaux du workspace</h2>
            <div className={styles["channelsSection"]}>
              <div className={styles["searchContainer"]}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un canal..."
                  className={styles["searchInput"]}
                />
              </div>

              <div className={styles["channelsContent"]}>
                <div className={styles["channelsList"]}>
                  <h3>Liste des canaux</h3>
                  {channelsLoading ? (
                    <Loader />
                  ) : channelsError ? (
                    <p className={styles["error"]}>{channelsError}</p>
                  ) : (
                    <ChannelList
                      channels={channels}
                      filter={search}
                      onAccess={handleChannelAccess}
                    />
                  )}
                </div>

                {isAdminOrOwner && (
                  <div className={styles["createChannelSection"]}>
                    <h3>Créer un nouveau canal</h3>
                    <ChannelCreateForm
                      workspaceId={id || ""}
                      onCreate={handleCreateChannel}
                      onCreated={fetchChannels}
                    />
                  </div>
                )}
              </div>
            </div>{" "}
          </div>
        );

      case "channel-management":
        return (
          <div className={styles["content"]}>
            <h2>Gestion des Canaux</h2>
            {channels && channels.length > 0 ? (
              <div className={styles["channelManagementSection"]}>
                <p className={styles["description"]}>
                  Sélectionnez un canal pour gérer ses membres et leurs rôles.
                </p>
                {channels.map((channel: any) => (
                  <div
                    key={channel._id}
                    className={styles["channelManagementItem"]}
                  >
                    <h3>#{channel.name}</h3>
                    <p>{channel.description || "Aucune description"}</p>
                    <ChannelMembersManager
                      workspaceId={id || ""}
                      channelId={channel._id}
                      channelName={channel.name}
                      isChannelAdmin={isAdminOrOwner} // Pour l'instant, seuls les admins/owners peuvent gérer
                      onMembersChange={() => {
                        // Optionnel : recharger les données si nécessaire
                        fetchChannels();
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles["emptyChannels"]}>
                <p>
                  Aucun canal disponible. Créez d'abord des canaux pour les
                  gérer.
                </p>
              </div>
            )}
          </div>
        );

      case "roles":
        return (
          <div className={styles["content"]}>
            <h2>Gestion des Rôles</h2>

            {/* Rôles du Workspace */}
            <WorkspaceRolesManager
              workspaceId={id || ""}
              isOwnerOrAdmin={isAdminOrOwner}
            />

            {/* Rôles par Canal */}
            <ChannelRolesManager
              workspaceId={id || ""}
              channels={channels}
              isOwnerOrAdmin={isAdminOrOwner}
            />
          </div>
        );

      case "join-requests":
        return (
          <div className={styles["content"]}>
            <h2>Demandes d'accès au workspace</h2>
            <JoinRequestsManager
              workspaceId={id || ""}
              isOwnerOrAdmin={isAdminOrOwner}
            />
          </div>
        );

      case "settings":
        return (
          <div className={styles["content"]}>
            <h2>Paramètres du workspace</h2>
            <div className={styles["settingsSection"]}>
              <div className={styles["settingGroup"]}>
                <h3>Informations générales</h3>
                <div className={styles["infoItem"]}>
                  <label>Nom :</label>
                  <span>{workspace.name}</span>
                </div>
                <div className={styles["infoItem"]}>
                  <label>Description :</label>
                  <span>{workspace.description || "Aucune description"}</span>
                </div>
                <div className={styles["infoItem"]}>
                  <label>Visibilité :</label>
                  <span
                    className={
                      workspace.isPublic
                        ? styles["badgePublic"]
                        : styles["badgePrivate"]
                    }
                  >
                    {workspace.isPublic ? "Public" : "Privé"}
                  </span>
                </div>
                <div className={styles["infoItem"]}>
                  <label>Propriétaire :</label>
                  <span>
                    {workspace.owner?.username || workspace.owner?.email}
                  </span>
                </div>
                <div className={styles["infoItem"]}>
                  <label>Nombre de membres :</label>
                  <span>{workspace.members?.length || 0}</span>
                </div>
                <div className={styles["infoItem"]}>
                  <label>Nombre de canaux :</label>
                  <span>{channels.length}</span>
                </div>
              </div>

              {isAdminOrOwner && (
                <div className={styles["settingGroup"]}>
                  <h3>Actions administrateur</h3>
                  <div className={styles["actionButtons"]}>
                    <button
                      className={styles["editButton"]}
                      onClick={handleEditWorkspace}
                      disabled={editLoading}
                    >
                      {editLoading
                        ? "Modification..."
                        : "Modifier le workspace"}
                    </button>
                    <button
                      className={styles["dangerButton"]}
                      onClick={handleDeleteWorkspace}
                      disabled={deleteLoading}
                    >
                      {deleteLoading
                        ? "Suppression..."
                        : "Supprimer le workspace"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles["workspaceLayout"]}>
      {/* En-tête du workspace */}
      <div className={styles["workspaceHeader"]}>
        <div className={styles["headerContent"]}>
          <h1 className={styles["workspaceTitle"]}>{workspace.name}</h1>
          <span
            className={
              workspace.isPublic
                ? styles["badgePublic"]
                : styles["badgePrivate"]
            }
          >
            {workspace.isPublic ? "Public" : "Privé"}
          </span>
        </div>
        {workspace.description && (
          <p className={styles["workspaceDescription"]}>
            {workspace.description}
          </p>
        )}
      </div>
      {/* Conteneur principal avec sidebar et contenu */}
      <div className={styles["mainContainer"]}>
        {/* Menu latéral */}
        <nav className={styles["sidebar"]}>
          <div className={styles["sidebarHeader"]}>
            <h3>Navigation</h3>
          </div>
          <ul className={styles["menuList"]}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles["menuItem"]} ${
                    activeMenu === item.id ? styles["menuItemActive"] : ""
                  }`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className={styles["menuIcon"]}>{item.icon}</span>
                  <span className={styles["menuLabel"]}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>{" "}
        {/* Zone de contenu principal */}
        <main className={styles["mainContent"]}>{renderContent()}</main>
      </div>{" "}
      {/* Modal d'édition du workspace */}
      {showEditModal && (
        <EditWorkspaceModal
          workspace={workspace}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onSave={handleEditModalSubmit}
          loading={editLoading}
        />
      )}
    </div>
  );
};

export default WorkspaceDetailPage;
