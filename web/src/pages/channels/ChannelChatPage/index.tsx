import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useChannels } from "@hooks/useChannels";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import {
  ChannelRole,
  hasPermissionWithGuestOverride,
} from "@utils/channelPermissions";
import styles from "./ChannelChatPage.module.scss";

// Components

import MessageItem from "@components/messaging/Message/MessageItem";
import MessageInput from "@components/core/forms/MessageInput";
import ChannelEditModal from "@components/messaging/Channel/ChannelEditModal";
import ChannelCreateForm from "@components/messaging/Channel/ChannelCreateForm";
import ChannelRolesManager from "@components/messaging/Channel/ChannelRolesManager";
import ChannelMembersManager from "@components/messaging/Channel/ChannelMembersManager";
import ChannelPermissionsManager from "@components/messaging/Channel/ChannelPermissionsManager";
import Loader from "@components/core/ui/Loader";

interface ChannelChatPageProps {
  workspaceId: string;
}

type SidebarSection = "chat" | "members" | "roles" | "settings";

const ChannelChatPage: React.FC<ChannelChatPageProps> = ({ workspaceId }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // État local
  const [activeChannelId, setActiveChannelId] = useState<string>(
    params.get("channel") || ""
  );
  const [activeSidebarSection, setActiveSidebarSection] =
    useState<SidebarSection>("chat");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hooks
  const {
    channels,
    loading: channelsLoading,
    fetchChannels,
    handleCreateChannel,
  } = useChannels(workspaceId);
  const {
    messages,
    loading: messagesLoading,
    send,
    update: updateMsg,
    remove,
  } = useMessages(activeChannelId);
  const {
    channel,
    loading: channelLoading,
    handleUpdate,
    handleDelete,
    updating,
    updateError,
  } = useChannelDetails(activeChannelId);
  // Utiliser le hook centralisé pour les permissions de canal
  const { canEdit: canEditChannel, canManageMembers } = useChannelPermissions(
    activeChannelId,
    workspaceId
  );

  // Garder la logique existante pour les autres permissions
  const getCurrentUserRole = (): ChannelRole => {
    if (!user) return "guest";

    // Vérifier si l'utilisateur est admin global du workspace
    if (user.role === "admin") return "admin";

    // Si pas de canal sélectionné, on considère l'utilisateur comme membre du workspace
    if (!channel) return "member";

    // Vérifier si l'utilisateur est le créateur/propriétaire du canal
    if (channel.owner) {
      // Vérifier avec l'ID
      if (channel.owner._id === (user as any)._id) {
        return "admin";
      }
      // Vérifier aussi avec l'email au cas où
      if (channel.owner.email === user.email) {
        return "admin";
      }
    }

    // SOLUTION TEMPORAIRE: Si l'utilisateur est connecté et que le canal n'a pas d'owner défini,
    // et que l'utilisateur est dans les membres, on le considère comme admin
    if (!channel.owner && channel.members) {
      const memberInChannel = channel.members.find(
        (m: any) => m._id === (user as any)._id || m.email === user.email
      );
      if (memberInChannel) {
        return "admin"; // Par défaut, le premier membre est admin
      }
    }

    // Vérifier si l'utilisateur est dans la liste des membres du canal
    const memberInChannel = channel.members?.find(
      (m: any) => m._id === (user as any)._id || m.email === user.email
    );

    if (memberInChannel) {
      // Si l'utilisateur a un rôle spécifique dans le canal
      if (memberInChannel.role) {
        return memberInChannel.role as ChannelRole;
      }
      // Sinon, c'est un membre par défaut
      return "member";
    }

    // Si l'utilisateur n'est pas explicitement membre, mais qu'il peut voir le canal
    // (par exemple, canal public dans un workspace dont il est membre), il est membre
    if (channel.type === "public") {
      return "member";
    }
    // Sinon, c'est un guest
    return "guest";
  };

  const userChannelRole = getCurrentUserRole();

  // Debug temporaire pour identifier le problème
  if (channel) {
    console.log("🔍 DEBUG PERMISSIONS:", {
      userId: (user as any)?._id,
      userEmail: user?.email,
      userRole: user?.role,
      channelId: channel._id,
      channelName: channel.name,
      channelOwner: channel.owner,
      channelMembers: channel.members,
      currentUserRole: userChannelRole,
      canEditChannel,
      canManageMembers,
    });
  }

  // Pour créer des canaux, on vérifie les permissions au niveau workspace
  // Tous les utilisateurs connectés peuvent créer des canaux
  const canCreateChannels = Boolean(user);

  // Pour les guests, vérifier les permissions spéciales accordées par l'admin
  const getGuestCustomPermissions = () => {
    if (userChannelRole !== "guest" || !channel) return {};

    // Ici, vous devriez récupérer les permissions personnalisées depuis le backend
    // Pour l'instant, nous utilisons un exemple de structure
    const memberInChannel = channel.members?.find(
      (m: any) => m._id === (user as any)._id
    );

    return memberInChannel?.customPermissions || {};
  };
  const guestCustomPermissions = getGuestCustomPermissions();
  const canWriteMessages = hasPermissionWithGuestOverride(
    userChannelRole,
    "canWrite",
    guestCustomPermissions
  );

  // SOLUTION DE SECOURS: Si l'utilisateur a accès au canal mais ne peut pas écrire,
  // et qu'il n'est pas explicitement un guest, on lui donne les droits d'écriture
  const canActuallyWrite =
    canWriteMessages || (userChannelRole !== "guest" && Boolean(user));

  // TODO: Utiliser canSendFiles pour MessageInput avec support des fichiers
  // const canSendFiles = hasPermissionWithGuestOverride(userChannelRole, "canSendFiles", guestCustomPermissions);

  // Effets
  useEffect(() => {
    const channelParam = params.get("channel");
    if (channelParam && channelParam !== activeChannelId) {
      setActiveChannelId(channelParam);
    }
  }, [params, activeChannelId]);

  // Handlers
  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    const newParams = new URLSearchParams(params);
    newParams.set("channel", channelId);
    navigate(`?${newParams.toString()}`);
  };

  const handleChannelUpdate = async (data: any) => {
    await handleUpdate(data);
    setShowEditModal(false);
    fetchChannels();
  };

  const handleChannelDelete = async () => {
    const workspaceId = await handleDelete();
    if (workspaceId) {
      navigate(`/workspaces/${workspaceId}`);
    }
  };

  const handleCreateChannelSubmit = async (channelData: any) => {
    await handleCreateChannel(channelData);
    setShowCreateChannel(false);
    fetchChannels();
  };
  // Menu items pour le sidebar
  const sidebarMenuItems = [
    { id: "chat", label: "Messages", icon: "💬" },
    { id: "members", label: "Membres", icon: "👥" },
    { id: "roles", label: "Rôles", icon: "👑" },
    { id: "settings", label: "Paramètres", icon: "⚙️" },
  ];

  // Ajouter l'option de création si l'utilisateur a les permissions
  if (canCreateChannels) {
    sidebarMenuItems.push({
      id: "create",
      label: "Créer un canal",
      icon: "➕",
    });
  }

  // Rendu du contenu principal selon la section active
  const renderMainContent = () => {
    if (!activeChannelId) {
      return (
        <div className={styles["emptyState"]}>
          <i className="fa-solid fa-comments" />
          <h3>Sélectionnez un canal</h3>
          <p>Choisissez un canal dans la liste pour commencer à discuter</p>
          {canCreateChannels && channels.length === 0 && (
            <button
              className={styles["createChannelFromEmpty"]}
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

    switch (activeSidebarSection) {
      case "chat":
        return (
          <div className={styles["chatSection"]}>
            {" "}
            <div className={styles["chatHeader"]}>
              <div className={styles["channelInfo"]}>
                <h2 className={styles["channelTitle"]}>
                  #{channel?.name || "Canal"}
                </h2>
                {channel?.description && (
                  <p className={styles["channelDescription"]}>
                    {channel.description}
                  </p>
                )}
              </div>
              <div className={styles["userRoleInfo"]}>
                <span className={styles["roleIndicator"]}>
                  {userChannelRole === "admin"
                    ? "👑 Admin"
                    : userChannelRole === "member"
                    ? "👤 Membre"
                    : "🔒 Invité"}
                </span>
              </div>
              {canEditChannel && (
                <button
                  className={styles["editChannelButton"]}
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="fa-solid fa-edit" />
                  Modifier
                </button>
              )}
            </div>{" "}
            <div className={styles["messagesContainer"]}>
              <ul className={styles["messagesList"]}>
                {messages.map((message: any) => (
                  <MessageItem
                    key={message._id}
                    message={message}
                    onEdit={(text: string, file?: File | null) =>
                      updateMsg(message._id, text, file)
                    }
                    onDelete={() => remove(message._id)}
                  />
                ))}
                {!messagesLoading && messages.length === 0 && (
                  <li className={styles["emptyMessages"]}>
                    Aucun message pour le moment. Soyez le premier à écrire !
                  </li>
                )}
              </ul>
            </div>{" "}
            {/* MessageInput avec vérification des permissions */}
            {canActuallyWrite ? (
              <MessageInput onSend={send} loading={messagesLoading} />
            ) : (
              <div className={styles["noWritePermission"]}>
                <p>
                  {userChannelRole === "guest"
                    ? "Vous ne pouvez pas écrire dans ce canal. Un admin doit vous accorder cette permission."
                    : "Vous n'avez pas les permissions pour écrire dans ce canal."}
                </p>
              </div>
            )}
          </div>
        );
      case "members":
        return (
          <div className={styles["membersSection"]}>
            <h2>Gestion des membres</h2>
            <div className={styles["membersSectionInfo"]}>
              <p>
                <strong>Votre rôle :</strong>{" "}
                {userChannelRole === "admin"
                  ? "👑 Admin de canal"
                  : userChannelRole === "member"
                  ? "👤 Membre"
                  : "🔒 Invité"}
              </p>
              {userChannelRole === "guest" && (
                <div className={styles["guestInfo"]}>
                  <p>
                    ⚠️ En tant qu'invité, vos actions sont limitées. Contactez
                    un admin pour plus de permissions.
                  </p>
                </div>
              )}
            </div>{" "}
            <ChannelMembersManager
              workspaceId={workspaceId}
              channelId={activeChannelId}
              channelName={channel?.name || ""}
              onMembersChange={fetchChannels}
            />
          </div>
        );

      case "roles":
        return (
          <div className={styles["rolesSection"]}>
            <h2>Gestion des rôles</h2>
            <div className={styles["rolesContent"]}>
              {/* Gestionnaire de permissions pour le canal actuel */}
              {activeChannelId && (
                <div className={styles["currentChannelPermissions"]}>
                  <h3>Permissions pour #{channel?.name}</h3>
                  <ChannelPermissionsManager
                    channelId={activeChannelId}
                    currentUserRole={userChannelRole}
                    targetUserId={(user as any)?._id || ""}
                    targetUserRole={userChannelRole}
                    isReadOnly={!canManageMembers}
                  />
                </div>
              )}

              {/* Gestionnaire global des rôles de canaux */}
              <div className={styles["globalChannelRoles"]}>
                <h3>Gestion globale des rôles</h3>
                <ChannelRolesManager
                  workspaceId={workspaceId}
                  channels={channels}
                  isOwnerOrAdmin={canManageMembers}
                />
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className={styles["settingsSection"]}>
            <h2>Paramètres du canal</h2>
            {channel && (
              <div className={styles["channelInfo"]}>
                <div className={styles["infoGroup"]}>
                  <label>Nom du canal :</label>
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
            )}

            {canEditChannel && (
              <div className={styles["settingsActions"]}>
                <button
                  className={styles["editButton"]}
                  onClick={() => setShowEditModal(true)}
                >
                  Modifier le canal
                </button>
                <button
                  className={styles["deleteButton"]}
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
                  Supprimer le canal
                </button>
              </div>
            )}
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
    <div className={styles["ChannelChatPage"]}>
      {/* Sidebar avec liste des canaux et menu */}
      <aside className={styles["sidebar"]}>
        {" "}
        {/* Header du sidebar */}
        <div className={styles["sidebarHeader"]}>
          <h3>Canaux</h3>
          {canCreateChannels && (
            <button
              className={styles["createChannelButton"]}
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
                  className={styles["createFirstChannelButton"]}
                  onClick={() => setShowCreateChannel(true)}
                >
                  <i className="fa-solid fa-plus" />
                  Créer le premier canal
                </button>
              )}
            </div>
          ) : Array.isArray(channels) && channels.length > 0 ? (
            channels
              .filter((channel) =>
                channel.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((channel: any) => (
                <button
                  key={channel._id}
                  className={`${styles["channelItem"]} ${
                    activeChannelId === channel._id
                      ? styles["channelItemActive"]
                      : ""
                  }`}
                  onClick={() => handleChannelSelect(channel._id)}
                >
                  <span className={styles["channelIcon"]}>
                    {channel.type === "private" ? "🔒" : "#"}
                  </span>{" "}
                  <span className={styles["channelName"]}>{channel.name}</span>
                  {channel.unreadCount && (
                    <span className={styles["unreadBadge"]}>
                      {channel.unreadCount}{" "}
                    </span>
                  )}
                </button>
              ))
          ) : (
            <div className={styles["noChannelsMessage"]}>
              Aucun canal disponible
            </div>
          )}
        </div>
        {/* Menu du sidebar */}
        {activeChannelId && (
          <div className={styles["sidebarMenu"]}>
            <h4>Navigation</h4>
            <nav className={styles["menuNav"]}>
              {sidebarMenuItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles["menuItem"]} ${
                    activeSidebarSection === item.id
                      ? styles["menuItemActive"]
                      : ""
                  } ${item.id === "create" ? styles["createMenuItem"] : ""}`}
                  onClick={() => {
                    if (item.id === "create") {
                      setShowCreateChannel(true);
                    } else {
                      setActiveSidebarSection(item.id as SidebarSection);
                    }
                  }}
                >
                  <span className={styles["menuIcon"]}>{item.icon}</span>
                  <span className={styles["menuLabel"]}>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </aside>

      {/* Contenu principal */}
      <main className={styles["mainContent"]}>{renderMainContent()}</main>

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
              workspaceId={workspaceId}
              onCreate={handleCreateChannelSubmit}
              onCreated={() => setShowCreateChannel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelChatPage;
