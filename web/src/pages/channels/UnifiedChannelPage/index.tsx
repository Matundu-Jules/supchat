import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useChannels } from "@hooks/useChannels";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import { useChannelMembers } from "@hooks/useChannelMembers";
import { useRightPanel, type RightPanelView } from "@hooks/useRightPanel";
import { useChannelNavigation } from "@hooks/useChannelNavigation";
import { ChannelRole } from "@utils/channelPermissions";
import styles from "./UnifiedChannelPage.module.scss";

// Components
import MessageItem from "@components/messaging/Message/MessageItem";
import MessageInput from "@components/core/forms/MessageInput";
import ChannelEditModal from "@components/messaging/Channel/ChannelEditModal";
import ChannelCreateForm from "@components/messaging/Channel/ChannelCreateForm";
import ChannelRolesManager from "@components/messaging/Channel/ChannelRolesManager";
import ChannelMembersManager from "@components/messaging/Channel/ChannelMembersManager";
import ChannelPermissionsManager from "@components/messaging/Channel/ChannelPermissionsManager";
import ChannelInviteModal from "@components/messaging/Channel/ChannelInviteModal";
import Loader from "@components/core/ui/Loader";
import { getWorkspaceMembers } from "@services/workspaceApi";

interface UnifiedChannelPageProps {}

const UnifiedChannelPage: React.FC<UnifiedChannelPageProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Hooks personnalisés pour la gestion de l'état
  const { workspaceId, activeChannelId, selectChannel, clearChannel } =
    useChannelNavigation();

  const {
    rightPanelView,
    isOpen: isRightPanelOpen,
    openPanel: openRightPanel,
    closePanel: closeRightPanel,
    togglePanel: toggleRightPanel,
  } = useRightPanel();

  // État local pour les modales et autres
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

  // Hooks
  const {
    channels,
    loading: channelsLoading,
    fetchChannels,
    handleCreateChannel,
  } = useChannels(workspaceId || "");

  const {
    messages,
    loading: messagesLoading,
    send,
    update: updateMsg,
    remove,
    error: messagesError,
  } = useMessages(activeChannelId);

  const {
    channel,
    loading: channelLoading,
    handleUpdate,
    handleDelete,
    updating,
    updateError,
  } = useChannelDetails(activeChannelId);

  const { canEdit: canEditChannel, canManageMembers } = useChannelPermissions(
    activeChannelId,
    workspaceId || ""
  );

  // Gestion membres canal privé
  const {
    invite,
    remove: removeMember,
    loading: inviteLoading,
    error: inviteError,
    success: inviteSuccess,
  } = useChannelMembers(activeChannelId);

  const [workspaceUsers, setWorkspaceUsers] = useState<any[]>([]);
  useEffect(() => {
    if (workspaceId) {
      getWorkspaceMembers(workspaceId)
        .then((response) => {
          // L'API retourne { members: [...] } ou directement [...]
          const members = response.members || response;
          setWorkspaceUsers(members);
        })
        .catch(() => setWorkspaceUsers([]));
    }
  }, [workspaceId]);

  // Nettoyer les messages optimistes lors du changement de channel
  useEffect(() => {
    setOptimisticMessages([]);
  }, [activeChannelId]);

  // Logique permissions
  const getCurrentUserRole = (): ChannelRole => {
    if (!user) return "guest";
    if (user.role === "admin") return "admin";
    if (!channel) return "member";

    if (channel.owner) {
      if (
        channel.owner._id === (user as any)._id ||
        channel.owner.email === user.email
      ) {
        return "admin";
      }
    }

    if (!channel.owner && channel.members) {
      const memberInChannel = channel.members.find(
        (m: any) => m._id === (user as any)._id || m.email === user.email
      );
      if (memberInChannel) {
        return "admin";
      }
    }

    const memberInChannel = channel.members?.find(
      (m: any) => m._id === (user as any)._id || m.email === user.email
    );

    if (memberInChannel) {
      if (memberInChannel.role) {
        return memberInChannel.role as ChannelRole;
      }
      return "member";
    }

    if (channel.type === "public") {
      return "member";
    }

    return "guest";
  };
  const userChannelRole = getCurrentUserRole();
  const canActuallyWrite =
    channel &&
    userChannelRole !== "guest" &&
    (channel.type === "public" ||
      channel.members?.some((m: any) => m._id === (user as any)?._id));
  // Contrôle d'accès à l'affichage du canal
  useEffect(() => {
    if (!channel || !user) return;
    if (channel.type === "private") {
      const isMember = channel.members?.some((m: any) => m._id === user.id);
      if (!isMember) {
        clearChannel();
        navigate(`/workspaces/${workspaceId}/channels`, { replace: true });
      }
    }
  }, [channel, user, workspaceId, navigate, clearChannel]);

  // Contrôle création canal
  const canCreateChannels =
    user && (user.role === "admin" || user.role === "membre");
  // Handlers
  const handleChannelSelect = (channelId: string) => {
    selectChannel(channelId);
    closeRightPanel(); // Fermer le panel droit
    navigate(`/workspaces/${workspaceId}/channels/${channelId}`);
  };

  const handleChannelUpdate = async (data: any) => {
    await handleUpdate(data);
    setShowEditModal(false);
    fetchChannels();
  };

  const handleChannelDelete = async () => {
    await handleDelete();
    clearChannel();
    closeRightPanel();
    fetchChannels();
    navigate(`/workspaces/${workspaceId}/channels`);
  };

  const handleCreateChannelSubmit = async (data: any) => {
    await handleCreateChannel(data);
    setShowCreateChannel(false);
    fetchChannels();
  };
  const handleSendMessage = async (content: string, file?: File | null) => {
    if (!content.trim() && !file) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      content,
      author: user,
      timestamp: new Date().toISOString(),
      channelId: activeChannelId,
      file: file ? { name: file.name, size: file.size } : null,
      isOptimistic: true,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    try {
      await send(content, file || undefined);
      setOptimisticMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setMessageError(null);
    } catch (err: any) {
      setOptimisticMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setMessageError(err.message || "Erreur lors de l'envoi du message");
    }
  };

  const handleEditMessage = async (
    id: string,
    newContent: string,
    file?: File | null
  ) => {
    try {
      await updateMsg(id, newContent, file);
      setMessageError(null);
    } catch (err: any) {
      setMessageError(
        err.message || "Erreur lors de la modification du message"
      );
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await remove(id);
      setMessageError(null);
    } catch (err: any) {
      setMessageError(
        err.message || "Erreur lors de la suppression du message"
      );
    }
  };

  // Rendu du contenu principal
  const renderMainContent = () => {
    if (!activeChannelId) {
      return (
        <div className={styles["emptyState"]}>
          <div className={styles["emptyStateIcon"]}>💬</div>
          <h3>Bienvenue dans les canaux</h3>
          <p>Sélectionnez un canal dans la liste pour commencer à discuter</p>
          {canCreateChannels && channels.length === 0 && (
            <button
              className={styles["createFirstChannelBtn"]}
              onClick={() => setShowCreateChannel(true)}
            >
              <i className="fa-solid fa-plus" />
              Créer votre premier canal
            </button>
          )}
        </div>
      );
    }

    if (channelLoading) {
      return <Loader />;
    }

    return (
      <div className={styles["chatContainer"]}>
        {/* Header du canal */}
        <div className={styles["chatHeader"]}>
          <div className={styles["channelInfo"]}>
            <h2 className={styles["channelTitle"]}>
              {channel?.type === "private" ? "🔒" : "#"}{" "}
              {channel?.name || "Canal"}
            </h2>
            {channel?.description && (
              <p className={styles["channelDescription"]}>
                {channel.description}
              </p>
            )}
          </div>

          <div className={styles["channelActions"]}>
            <div className={styles["userRoleInfo"]}>
              <span className={styles["roleIndicator"]}>
                {userChannelRole === "admin"
                  ? "👑 Admin"
                  : userChannelRole === "member"
                  ? "👤 Membre"
                  : "🔒 Invité"}
              </span>
            </div>
            <div className={styles["actionButtons"]}>
              <button
                className={`${styles["actionButton"]} ${
                  rightPanelView === "members" ? styles["active"] : ""
                }`}
                onClick={() => toggleRightPanel("members")}
                title="Voir les membres"
              >
                <i className="fa-solid fa-users" />
                Membres ({channel?.members?.length || 0})
              </button>

              {canEditChannel && (
                <button
                  className={`${styles["actionButton"]} ${
                    rightPanelView === "settings" ? styles["active"] : ""
                  }`}
                  onClick={() => toggleRightPanel("settings")}
                  title="Paramètres du canal"
                >
                  <i className="fa-solid fa-cog" />
                  Paramètres
                </button>
              )}

              {(canManageMembers || canEditChannel) && (
                <button
                  className={`${styles["actionButton"]} ${
                    rightPanelView === "roles" ? styles["active"] : ""
                  }`}
                  onClick={() => toggleRightPanel("roles")}
                  title="Gérer les rôles"
                >
                  <i className="fa-solid fa-crown" />
                  Rôles
                </button>
              )}
            </div>
          </div>
        </div>{" "}
        {/* Zone des messages */}
        <div className={styles["messagesContainer"]}>
          <ul className={styles["messagesList"]}>
            {(() => {
              // Assurer que nous avons des tableaux
              const safeMessages = Array.isArray(messages) ? messages : [];
              const safeOptimistic = Array.isArray(optimisticMessages)
                ? optimisticMessages
                : [];
              return [...safeMessages, ...safeOptimistic]
                .filter((message: any) => message && message._id) // 🔧 CORRECTION: Filtrer les messages sans _id
                .map((message: any) => (
                  <MessageItem
                    key={`msg-${message._id}`} // 🔧 CORRECTION: Préfixe pour éviter les conflits
                    message={message}
                    onEdit={(text: string, file?: File | null) =>
                      handleEditMessage(message._id, text, file)
                    }
                    onDelete={() => handleDeleteMessage(message._id)}
                  />
                ));
            })()}
            {!messagesLoading &&
              Array.isArray(messages) &&
              messages.length === 0 && (
                <li className={styles["emptyMessages"]}>
                  Aucun message pour le moment. Soyez le premier à écrire !
                </li>
              )}
          </ul>
          {messagesLoading && <Loader />}
          {messageError && (
            <div className={styles["error"]}>{messageError}</div>
          )}
          {messagesError && (
            <div className={styles["error"]}>{messagesError}</div>
          )}
        </div>
        {/* Zone de saisie */}
        {canActuallyWrite ? (
          <div className={styles["messageInputContainer"]}>
            <MessageInput
              onSend={handleSendMessage}
              canWrite={canActuallyWrite}
            />
          </div>
        ) : (
          <div className={styles["noWritePermission"]}>
            <i className="fa-solid fa-lock" />
            Vous n'avez pas la permission d'écrire dans ce canal
          </div>
        )}
      </div>
    );
  };

  // Rendu du panel droit
  const renderRightPanel = () => {
    if (!rightPanelView || !channel) return null;

    switch (rightPanelView) {
      case "members":
        return (
          <div className={styles["rightPanel"]}>
            {" "}
            <div className={styles["rightPanelHeader"]}>
              <h3>Membres du canal</h3>
              <button
                className={styles["closePanelBtn"]}
                onClick={() => closeRightPanel()}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <div className={styles["rightPanelContent"]}>
              {(canManageMembers || canEditChannel) && (
                <button
                  className={styles["inviteBtn"]}
                  onClick={() => setShowInviteModal(true)}
                >
                  <i className="fa-solid fa-plus" />
                  Inviter des membres
                </button>
              )}

              <ul className={styles["membersList"]}>
                {channel.members?.map((member: any) => (
                  <li key={member._id} className={styles["memberItem"]}>
                    <div className={styles["memberInfo"]}>
                      <span className={styles["memberName"]}>
                        {member.username || member.email}
                      </span>
                      <span className={styles["memberRole"]}>
                        {member.role || "membre"}
                      </span>
                    </div>
                    {(canManageMembers || canEditChannel) &&
                      member._id !== user?.id && (
                        <button
                          className={styles["removeMemberBtn"]}
                          onClick={() => removeMember(member._id)}
                          disabled={inviteLoading}
                          title="Retirer du canal"
                        >
                          <i className="fa-solid fa-times" />
                        </button>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className={styles["rightPanel"]}>
            {" "}
            <div className={styles["rightPanelHeader"]}>
              <h3>Paramètres du canal</h3>
              <button
                className={styles["closePanelBtn"]}
                onClick={() => closeRightPanel()}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <div className={styles["rightPanelContent"]}>
              <div className={styles["settingsInfo"]}>
                <div className={styles["infoGroup"]}>
                  <label>Nom :</label>
                  <span>#{channel.name}</span>
                </div>
                <div className={styles["infoGroup"]}>
                  <label>Description :</label>
                  <span>{channel.description || "Aucune description"}</span>
                </div>
                <div className={styles["infoGroup"]}>
                  <label>Type :</label>
                  <span
                    className={
                      channel.type === "public"
                        ? styles["typePublic"]
                        : styles["typePrivate"]
                    }
                  >
                    {channel.type === "public" ? "Public" : "Privé"}
                  </span>
                </div>
                <div className={styles["infoGroup"]}>
                  <label>Membres :</label>
                  <span>{channel.members?.length || 0} membre(s)</span>
                </div>
              </div>

              {canEditChannel && (
                <div className={styles["settingsActions"]}>
                  <button
                    className={styles["editBtn"]}
                    onClick={() => setShowEditModal(true)}
                  >
                    <i className="fa-solid fa-edit" />
                    Modifier le canal
                  </button>
                  <button
                    className={styles["deleteBtn"]}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Voulez-vous vraiment supprimer ce canal ?"
                        )
                      ) {
                        handleChannelDelete();
                      }
                    }}
                  >
                    <i className="fa-solid fa-trash" />
                    Supprimer le canal
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "roles":
        return (
          <div className={styles["rightPanel"]}>
            {" "}
            <div className={styles["rightPanelHeader"]}>
              <h3>Gestion des rôles</h3>
              <button
                className={styles["closePanelBtn"]}
                onClick={() => closeRightPanel()}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>{" "}
            <div className={styles["rightPanelContent"]}>
              <div className={styles["rolesNote"]}>
                <p>Gestion des rôles pour le canal actuel</p>
              </div>
              {channel && (
                <ChannelRolesManager
                  workspaceId={workspaceId || ""}
                  channels={channels}
                  isOwnerOrAdmin={canManageMembers}
                  channel={channel}
                  currentUserId={(user as any)?._id || ""}
                  onPromote={(userId: string, role: string) => {
                    // TODO: Implémenter la promotion
                    console.log("Promote user", userId, "to", role);
                  }}
                  onDemote={(userId: string, role: string) => {
                    // TODO: Implémenter la rétrogradation
                    console.log("Demote user", userId, "to", role);
                  }}
                  canEdit={canEditChannel}
                />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (channelsLoading) {
    return (
      <div className={styles["container"]}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles["unifiedChannelPage"]}>
      {/* Sidebar gauche avec liste des canaux */}
      <aside className={styles["leftSidebar"]}>
        <div className={styles["sidebarHeader"]}>
          <h2>Canaux</h2>
          {canCreateChannels && (
            <button
              className={styles["createChannelBtn"]}
              onClick={() => setShowCreateChannel(true)}
              title="Créer un nouveau canal"
            >
              <i className="fa-solid fa-plus" />
            </button>
          )}
        </div>
        {/* Recherche */}
        <div className={styles["searchContainer"]}>
          <input
            type="text"
            placeholder="Rechercher un canal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles["searchInput"]}
          />
        </div>{" "}
        {/* Liste des canaux */}
        <div className={styles["channelsList"]}>
          {channels.length === 0 ? (
            <div className={styles["noChannels"]}>
              <p>Aucun canal disponible</p>
              {canCreateChannels && (
                <button
                  className={styles["createFirstChannelBtn"]}
                  onClick={() => setShowCreateChannel(true)}
                >
                  <i className="fa-solid fa-plus" />
                  Créer le premier canal
                </button>
              )}
            </div>
          ) : (
            channels
              .filter((channel) =>
                channel.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((channel: any) => (
                <button
                  key={channel._id}
                  className={`${styles["channelItem"]} ${
                    activeChannelId === channel._id ? styles["active"] : ""
                  }`}
                  onClick={() => handleChannelSelect(channel._id)}
                >
                  <span className={styles["channelIcon"]}>
                    {channel.type === "private" ? "🔒" : "#"}
                  </span>
                  <span className={styles["channelName"]}>{channel.name}</span>
                  {channel.unreadCount && (
                    <span className={styles["unreadBadge"]}>
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))
          )}
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={styles["mainContent"]}>{renderMainContent()}</main>

      {/* Panel droit (membres/paramètres/rôles) */}
      {renderRightPanel()}

      {/* Modales */}
      {showEditModal && channel && (
        <ChannelEditModal
          channel={channel}
          onUpdate={handleChannelUpdate}
          onDelete={handleChannelDelete}
          onClose={() => setShowEditModal(false)}
          loading={updating}
          error={updateError}
        />
      )}

      {showCreateChannel && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <div className={styles["modalHeader"]}>
              <h3>Créer un nouveau canal</h3>
              <button
                className={styles["closeButton"]}
                onClick={() => setShowCreateChannel(false)}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <ChannelCreateForm
              workspaceId={workspaceId || ""}
              onCreate={handleCreateChannelSubmit}
              onCreated={() => setShowCreateChannel(false)}
            />
          </div>
        </div>
      )}

      {showInviteModal && channel && (
        <ChannelInviteModal
          channel={channel}
          users={workspaceUsers.filter(
            (u) => !channel.members?.some((m: any) => m._id === u.id)
          )}
          onInvite={async (userIds) => {
            await invite(userIds);
            fetchChannels();
            setShowInviteModal(false);
          }}
          onClose={() => setShowInviteModal(false)}
          loading={inviteLoading}
          error={inviteError}
          success={inviteSuccess}
        />
      )}
    </div>
  );
};

export default UnifiedChannelPage;
