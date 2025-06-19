import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceDetails } from "@hooks/useWorkspaceDetails";
import styles from "./WorkspaceDetailPage.module.scss";
import Loader from "@components/Loader";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useNavigate } from "react-router-dom";
import JoinRequestsManager from "@components/Workspace/JoinRequestsManager";
import WorkspaceRolesManager from "@components/Workspace/WorkspaceRolesManager";
import EditWorkspaceModal from "@components/Workspace/EditWorkspaceModal";
import UserStatusBadge from "@components/UserStatusBadge";
import UserRoleBadge from "@components/UserRoleBadge";
import UserAvatar from "@components/UserAvatar";
import { WorkspaceMember } from "../../types/workspace";

type MenuItem = "members" | "roles" | "join-requests" | "settings";

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeMenu, setActiveMenu] = useState<MenuItem>("members");
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
    fetchDetails,
  } = useWorkspaceDetails(id || "");
  const navigate = useNavigate();

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
    { id: "members" as MenuItem, label: "Membres", icon: "👥" },
    ...(isAdminOrOwner
      ? [
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
              {" "}
              <div className={styles["membersHeader"]}>
                <h3>Liste des membres</h3>
                {workspace.members && workspace.members.length > 5 && (
                  <span className={styles["scrollIndicator"]}>
                    📜 {workspace.members.length} membres - Faites défiler pour
                    voir plus
                  </span>
                )}
              </div>
              {/* Invitation de nouveaux membres - Placée en haut pour être toujours accessible */}
              {isAdminOrOwner && (
                <div className={styles["inviteSection"]}>
                  <div className={styles["inviteHeader"]}>
                    <h4>✉️ Inviter un nouveau membre</h4>
                  </div>
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
                      placeholder="Email du nouveau membre"
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
                  )}
                  {inviteSuccess && !inviteError && (
                    <div className={styles["success"]}>{inviteSuccess}</div>
                  )}
                </div>
              )}
              <ul className={styles["membersList"]}>
                {workspace.members && workspace.members.length > 0 ? (
                  workspace.members.map((member: WorkspaceMember) => {
                    // Correction : fallback strict pour le rôle et le statut
                    let safeRole: WorkspaceMember["role"] = "membre";
                    if (
                      ["propriétaire", "admin", "membre", "invité"].includes(
                        member.role
                      )
                    ) {
                      safeRole = member.role;
                    }
                    let safeStatus: WorkspaceMember["status"] = "offline";
                    if (
                      ["online", "away", "busy", "offline"].includes(
                        member.status
                      )
                    ) {
                      safeStatus = member.status;
                    }
                    return (
                      <li key={member._id} className={styles["memberItem"]}>
                        <div className={styles["memberInfo"]}>
                          {/* Avatar de l'utilisateur */}
                          <UserAvatar
                            avatar={member.avatar}
                            username={member.username}
                            email={member.email}
                            height="3.6rem"
                            size="custom"
                            className={styles["memberAvatar"]}
                          />

                          <div className={styles["memberDetails"]}>
                            <div className={styles["memberNameContainer"]}>
                              <span className={styles["memberName"]}>
                                {member.username || member.email}
                              </span>
                              <div className={styles["memberBadges"]}>
                                <UserStatusBadge
                                  status={safeStatus}
                                  size="small"
                                  showText={true}
                                />
                                <UserRoleBadge role={safeRole} size="small" />
                              </div>
                            </div>
                          </div>

                          {/* Bouton de suppression - Visible seulement pour admin/owner et pas pour le propriétaire */}
                          {isAdminOrOwner &&
                            safeRole !== "propriétaire" &&
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
                    );
                  })
                ) : (
                  <li className={styles["empty"]}>Aucun membre</li>
                )}{" "}
              </ul>
            </div>
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
            />{" "}
          </div>
        );

      case "join-requests":
        return (
          <div className={styles["content"]}>
            <h2>Demandes d'accès au workspace</h2>{" "}
            <JoinRequestsManager
              workspaceId={id || ""}
              isOwnerOrAdmin={isAdminOrOwner}
              onRequestsChange={fetchDetails}
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
                </div>{" "}
                <div className={styles["infoItem"]}>
                  <label>Canaux :</label>
                  <span>
                    <button
                      className={styles["linkButton"]}
                      onClick={() => navigate(`/channels?workspace=${id}`)}
                    >
                      Voir tous les canaux
                    </button>
                  </span>
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
        {" "}
        <div className={styles["headerContent"]}>
          <h1 className={styles["workspaceTitle"]}>{workspace.name}</h1>
          <div className={styles["headerActions"]}>
            <button
              className={styles["channelsButton"]}
              onClick={() => navigate(`/channels?workspace=${id}`)}
              title="Accéder aux canaux"
            >
              Accéder aux Canaux
            </button>
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
                  <span className={styles["menuLabel"]}>
                    {item.label}
                    {/* Compteur dynamique pour "Demandes d'accès" */}
                    {item.id === "join-requests" &&
                      Array.isArray(workspace.joinRequests) &&
                      workspace.joinRequests.length > 0 && (
                        <span
                          style={{
                            background: "#d32f2f",
                            color: "white",
                            borderRadius: "10px",
                            padding: "2px 8px",
                            fontSize: "0.85em",
                            marginLeft: 8,
                            fontWeight: 600,
                            verticalAlign: "middle",
                          }}
                          aria-label={`${workspace.joinRequests.length} demande(s) en attente`}
                        >
                          {workspace.joinRequests.length}
                        </span>
                      )}
                  </span>
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
