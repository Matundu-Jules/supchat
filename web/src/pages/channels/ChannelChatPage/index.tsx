import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useChannels } from "@hooks/useChannels";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import { useChannelMembers } from "@hooks/useChannelMembers";
import { useSocketEvents } from "@hooks/useSocketEvents";
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
import ChannelInviteModal from "@components/messaging/Channel/ChannelInviteModal";
import Loader from "@components/core/ui/Loader";
import { getWorkspaceMembers } from "@services/workspaceApi";

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
  } = useChannels(workspaceId);
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
    error: channelError,
  } = useChannelDetails(activeChannelId);
  // Utiliser le hook centralisé pour les permissions de canal
  const { canEdit: canEditChannel, canManageMembers } = useChannelPermissions(
    activeChannelId,
    workspaceId
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
  // const canCreateChannels = Boolean(user); // SUPPRIMÉ, doublon

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
  // Contrôle d'accès à l'affichage du canal
  useEffect(() => {
    if (!channel) return;
    if (channel.type === "private" && user) {
      const isMember = channel.members?.some((m: any) => m._id === user.id);
      if (!isMember) {
        navigate(`/workspaces/${workspaceId}/channels`, { replace: true });
      }
    }
  }, [channel, user, workspaceId, navigate]);

  // Gestion des erreurs de canal (403, 404, etc.)
  useEffect(() => {
    if (channelError && activeChannelId) {
      console.warn("🚫 Erreur d'accès au canal:", channelError);

      // Si erreur d'accès, rediriger vers la liste des canaux
      if (
        channelError.includes("Accès refusé") ||
        channelError.includes("introuvable")
      ) {
        // Réinitialiser le canal actif
        setActiveChannelId("");
        // Rediriger vers la liste des canaux
        navigate(`/workspaces/${workspaceId}/channels`, { replace: true });
      }
    }
  }, [channelError, activeChannelId, workspaceId, navigate]);

  // Contrôle création canal : seuls admin/membre peuvent créer
  const canCreateChannels =
    user && (user.role === "admin" || user.role === "membre");
  // Handlers
  const canAccessChannel = (channelId: string): boolean => {
    if (!channelId || !user) return false;

    const channel = channels.find((c) => c._id === channelId);
    if (!channel) return false;

    // Les canaux publics sont accessibles à tous les membres du workspace
    if (channel.type === "public") return true;

    // Les canaux privés nécessitent d'être membre ou admin
    if (channel.type === "private") {
      const isMember = channel.members?.some(
        (m: any) => m._id === (user as any)?._id || m.email === user?.email
      );
      const isAdmin = user?.role === "admin";
      return isMember || isAdmin;
    }

    return false;
  };

  const handleChannelSelect = (channelId: string) => {
    // Vérifier les permissions avant de sélectionner le canal
    if (!canAccessChannel(channelId)) {
      console.warn("🚫 Accès refusé au canal:", channelId);
      // Optionnellement, afficher un message d'erreur à l'utilisateur
      setMessageError(
        "Vous n'avez pas les permissions pour accéder à ce canal"
      );
      return;
    }

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

  // Handlers pour les messages
  const handleSendMessage = async (text: string, file?: File | null) => {
    try {
      await send(text, file);
      setMessageError(null);
    } catch (err: any) {
      setMessageError(err.message || "Erreur lors de l'envoi du message");
    }
  };

  const handleEditMessage = async (
    id: string,
    text: string,
    file?: File | null
  ) => {
    try {
      await updateMsg(id, text, file);
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
    // Gestion des erreurs d'accès au canal
    if (channelError && activeChannelId) {
      return (
        <div className={styles["emptyState"]}>
          <i className="fa-solid fa-exclamation-triangle" />
          <h3>Erreur d'accès</h3>
          <p>{channelError}</p>
          <button
            className={styles["backToChannelsButton"]}
            onClick={() => {
              setActiveChannelId("");
              navigate(`/workspaces/${workspaceId}/channels`, {
                replace: true,
              });
            }}
          >
            <i className="fa-solid fa-arrow-left" />
            Retour aux canaux
          </button>
        </div>
      );
    }

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
                {(() => {
                  // Assurer que nous avons des tableaux
                  const safeMessages = Array.isArray(messages) ? messages : [];
                  const safeOptimistic = Array.isArray(optimisticMessages)
                    ? optimisticMessages
                    : [];

                  return [...safeMessages, ...safeOptimistic].map(
                    (message: any) => (
                      <MessageItem
                        key={message._id}
                        message={message}
                        onEdit={(text: string, file?: File | null) =>
                          handleEditMessage(message._id, text, file)
                        }
                        onDelete={() => handleDeleteMessage(message._id)}
                      />
                    )
                  );
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
            {/* MessageInput avec vérification des permissions */}
            {canActuallyWrite ? (
              <MessageInput
                onSend={handleSendMessage}
                loading={messagesLoading}
                canWrite={canActuallyWrite}
              />
            ) : (
              <MessageInput
                onSend={() => {}}
                loading={messagesLoading}
                canWrite={false}
              />
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
              {/* Bouton d'invitation visible seulement pour admin canal/workspace */}
              {(canManageMembers || canEditChannel) && (
                <button
                  className="btn"
                  onClick={() => setShowInviteModal(true)}
                >
                  Inviter des membres
                </button>
              )}
            </div>{" "}
            {/* Liste membres canal avec rôles */}
            <ul className={styles["membersList"]}>
              {channel?.members?.map((member: any) => (
                <li key={member._id} className={styles["memberItem"]}>
                  <span>{member.username || member.email}</span>
                  <span className={styles["roleBadge"]}>
                    {member.role || "membre"}
                  </span>
                  {/* Suppression membre : visible pour admin canal/workspace, pas pour soi-même */}
                  {(canManageMembers || canEditChannel) &&
                    member._id !== user?.id && (
                      <button
                        className="btn btn-delete"
                        onClick={() => removeMember(member._id)}
                        disabled={inviteLoading}
                      >
                        Retirer
                      </button>
                    )}
                </li>
              ))}
            </ul>
            {/* Modal d'invitation */}
            {showInviteModal && (
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
              )}{" "}
              {/* Gestionnaire global des rôles de canaux */}
              <div className={styles["globalChannelRoles"]}>
                <h3>Gestion globale des rôles</h3>
                <ChannelRolesManager
                  workspaceId={workspaceId}
                  channels={channels}
                  isOwnerOrAdmin={canManageMembers}
                  channel={channel || { members: [] }}
                  currentUserId={(user as any)?._id || ""}
                  onPromote={(userId: string, role: string) => {
                    // TODO: Implémenter la promotion d'utilisateur
                    console.log(`Promotion: ${userId} -> ${role}`);
                  }}
                  onDemote={(userId: string, role: string) => {
                    // TODO: Implémenter la rétrogradation d'utilisateur
                    console.log(`Rétrogradation: ${userId} -> ${role}`);
                  }}
                  canEdit={canEditChannel}
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
        {canCreateChannels && (
          <button
            className={styles["createChannelButton"]}
            onClick={() => setShowCreateChannel(true)}
            title="Créer un nouveau canal"
          >
            <i className="fa-solid fa-plus" />
          </button>
        )}
        {/* Header du sidebar */}
        <div className={styles["sidebarHeader"]}>
          <h3>Canaux</h3>
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
              .filter((channel: any) => {
                // Filtrer les canaux privés auxquels l'utilisateur n'a pas accès
                if (channel.type === "private") {
                  const isMember = channel.members?.some(
                    (m: any) =>
                      m._id === (user as any)?._id || m.email === user?.email
                  );
                  const isAdmin = user?.role === "admin";
                  return isMember || isAdmin;
                }
                return true; // Canaux publics visibles par tous
              })
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
