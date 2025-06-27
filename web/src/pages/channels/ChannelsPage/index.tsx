import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useChannelsPageLogic } from "@hooks/useChannelsPageLogic";
import styles from "./ChannelsPage.module.scss";

import MessageInput from "@components/core/forms/MessageInput";
import ChannelEditModal from "@components/messaging/Channel/ChannelEditModal";
import ChannelCreateForm from "@components/messaging/Channel/ChannelCreateForm";
import ChannelRolesManager from "@components/messaging/Channel/ChannelRolesManager";
import ChannelInviteModal from "@components/messaging/Channel/ChannelInviteModal";
import Loader from "@components/core/ui/Loader";
import MessageItem from "@components/messaging/Message/MessageItem";
import ChannelInvitationsList from "@components/messaging/Channel/ChannelInvitationsList";
import ChannelJoinRequestsList from "@components/messaging/Channel/ChannelJoinRequestsList";
import FeedbackToast from "@components/core/ui/FeedbackToast";
import type { Channel, ChannelType } from "@ts_types/channel";
import type { WorkspaceMember } from "@ts_types/workspace";
import type { User } from "@ts_types/user";
import type { Message } from "@ts_types/message";

// Ajout de unreadCount au type Channel local pour le composant
interface ChannelWithUnread extends Channel {
  unreadCount?: number;
}

type ChannelsPageProps = object;

const ChannelsPage: React.FC<ChannelsPageProps> = () => {
  // const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const logic = useChannelsPageLogic({
    user,
    navigate,
  });

  // Ref pour le scroll automatique
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesLength =
    (Array.isArray(logic.messages) ? logic.messages.length : 0) +
    (Array.isArray(logic.optimisticMessages)
      ? logic.optimisticMessages.length
      : 0);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesLength, logic.activeChannelId]);

  // Adaptateur pour la prop onCreate du ChannelCreateForm
  const handleCreateChannelFormSubmit = async (
    formData: import("@services/channelApi").ChannelFormData
  ) => {
    // Conversion explicite du type string -> ChannelType (ou undefined)
    const { type, ...rest } = formData;
    let channelType: ChannelType | undefined = undefined;
    if (type === "public" || type === "private") {
      channelType = type;
    }
    await logic.handleCreateChannelSubmit({ ...rest, type: channelType });
  };

  if (logic.channelsLoading) {
    return (
      <div className={styles["container"]}>
        <Loader />
      </div>
    );
  }

  // Rendu du contenu principal (messages, input, etc.)
  const renderMainContent = () => {
    if (!logic.activeChannelId) {
      return (
        <div className={styles["emptyState"]}>
          <div className={styles["emptyStateIcon"]}>💬</div>
          <h3>Bienvenue dans les canaux</h3>
          <p>Sélectionnez un canal dans la liste pour commencer à discuter</p>
          {logic.canCreateChannels && logic.channels.length === 0 && (
            <button
              className={styles["createFirstChannelBtn"]}
              onClick={() => logic.setShowCreateChannel(true)}
            >
              <i className="fa-solid fa-plus" />
              Créer votre premier canal
            </button>
          )}
        </div>
      );
    }
    if (logic.channelLoading) {
      return <Loader />;
    }
    return (
      <div className={styles["chatContainer"]}>
        {/* Header du canal */}
        <div className={styles["chatHeader"]}>
          <div className={styles["channelInfo"]}>
            <h2 className={styles["channelTitle"]}>
              {logic.channel?.type === "private" ? "🔒" : "#"}{" "}
              {logic.channel?.name || "Canal"}
            </h2>
            {logic.channel?.description && (
              <p className={styles["channelDescription"]}>
                {logic.channel.description}
              </p>
            )}
          </div>
          <div className={styles["channelActions"]}>
            <div className={styles["userRoleInfo"]}>
              <span className={styles["roleIndicator"]}>
                {logic.userChannelRole === "admin"
                  ? "👑 Admin"
                  : logic.userChannelRole === "member"
                  ? "👤 Membre"
                  : "🔒 Invité"}
              </span>
            </div>
            <div className={styles["actionButtons"]}>
              <button
                className={`${styles["actionButton"]} ${
                  logic.rightPanelView === "members" ? styles["active"] : ""
                }`}
                onClick={() => logic.toggleRightPanel("members")}
                title="Voir les membres"
              >
                <i className="fa-solid fa-users" />
                Membres ({logic.channel?.members?.length || 0})
              </button>
              {logic.canEditChannel && (
                <button
                  className={`${styles["actionButton"]} ${
                    logic.rightPanelView === "settings" ? styles["active"] : ""
                  }`}
                  onClick={() => logic.toggleRightPanel("settings")}
                  title="Paramètres du canal"
                >
                  <i className="fa-solid fa-cog" />
                  Paramètres
                </button>
              )}
              {(logic.canManageMembers || logic.canEditChannel) && (
                <button
                  className={`${styles["actionButton"]} ${
                    logic.rightPanelView === "roles" ? styles["active"] : ""
                  }`}
                  onClick={() => logic.toggleRightPanel("roles")}
                  title="Gérer les rôles"
                >
                  <i className="fa-solid fa-crown" />
                  Rôles
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Zone des messages */}
        <div className={styles["messagesContainer"]}>
          <ul className={styles["messagesList"]}>
            {(() => {
              const safeMessages: Message[] = Array.isArray(logic.messages)
                ? logic.messages
                : [];
              const safeOptimistic: Message[] = Array.isArray(
                logic.optimisticMessages
              )
                ? logic.optimisticMessages
                : [];
              return [...safeMessages, ...safeOptimistic]
                .filter((message) => message && message._id)
                .map((message) => (
                  <MessageItem
                    key={`msg-${message._id}`}
                    message={message}
                    onEdit={(text: string, file?: File | null) =>
                      logic.handleEditMessage(message._id, text, file)
                    }
                    onDelete={() => logic.handleDeleteMessage(message._id)}
                  />
                ));
            })()}
            {!logic.messagesLoading &&
              Array.isArray(logic.messages) &&
              logic.messages.length === 0 && (
                <li className={styles["emptyMessages"]}>
                  Aucun message pour le moment. Soyez le premier à écrire !
                </li>
              )}
            {/* Élément sentinelle pour le scroll automatique */}
            <div ref={bottomRef} />
          </ul>
          {logic.messagesLoading && <Loader />}
          {logic.messageError && (
            <div className={styles["error"]}>{logic.messageError}</div>
          )}
          {logic.messagesError && (
            <div className={styles["error"]}>{logic.messagesError}</div>
          )}
        </div>
        {/* Zone de saisie */}
        {logic.canActuallyWrite ? (
          <div className={styles["messageInputContainer"]}>
            <MessageInput
              onSend={logic.handleSendMessage}
              canWrite={logic.canActuallyWrite}
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

  // Rendu du panel droit (membres, paramètres, rôles)
  const renderRightPanel = () => {
    if (!logic.rightPanelView || !logic.channel) return null;
    switch (logic.rightPanelView) {
      case "members":
        return (
          <div className={styles["rightPanel"]}>
            <div className={styles["rightPanelHeader"]}>
              <h3>Membres du canal</h3>
              <button
                className={styles["closePanelBtn"]}
                onClick={() => logic.closeRightPanel()}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <div className={styles["rightPanelContent"]}>
              {(logic.canManageMembers || logic.canEditChannel) && (
                <button
                  className={styles["inviteBtn"]}
                  onClick={() => logic.setShowInviteModal(true)}
                >
                  <i className="fa-solid fa-plus" />
                  Inviter des membres
                </button>
              )}
              <ul className={styles["membersList"]}>
                {logic.channel.members?.map((member: WorkspaceMember) => (
                  <li key={member._id} className={styles["memberItem"]}>
                    <div className={styles["memberInfo"]}>
                      <span className={styles["memberName"]}>
                        {member.username || member.email}
                      </span>
                      <span className={styles["memberRole"]}>
                        {member.role || "membre"}
                      </span>
                    </div>
                    {(logic.canManageMembers || logic.canEditChannel) &&
                      member._id !== user?._id && (
                        <button
                          className={styles["removeMemberBtn"]}
                          onClick={() => logic.removeMember(member._id)}
                          disabled={logic.inviteLoading}
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
            <div className={styles["rightPanelHeader"]}>
              <h3>Paramètres du canal</h3>
              <button
                className={styles["closePanelBtn"]}
                onClick={() => logic.closeRightPanel()}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <div className={styles["rightPanelContent"]}>
              <div className={styles["settingsInfo"]}>
                <div className={styles["infoGroup"]}>
                  <label>Nom :</label>
                  <span>#{logic.channel.name}</span>
                </div>
                <div className={styles["infoGroup"]}>
                  <label>Description :</label>
                  <span>
                    {logic.channel.description || "Aucune description"}
                  </span>
                </div>
                <div className={styles["infoGroup"]}>
                  <label>Type :</label>
                  <span
                    className={
                      logic.channel.type === "public"
                        ? styles["typePublic"]
                        : styles["typePrivate"]
                    }
                  >
                    {logic.channel.type === "public" ? "Public" : "Privé"}
                  </span>
                </div>
                <div className={styles["infoGroup"]}>
                  <label>Membres :</label>
                  <span>{logic.channel.members?.length || 0} membre(s)</span>
                </div>
              </div>
              {logic.canEditChannel && (
                <div className={styles["settingsActions"]}>
                  <button
                    className={styles["editBtn"]}
                    onClick={() => logic.setShowEditModal(true)}
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
                        logic.handleChannelDelete();
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
            <div className={styles["rightPanelHeader"]}>
              <h3>Gestion des rôles</h3>
              <button
                className={styles["closePanelBtn"]}
                onClick={() => logic.closeRightPanel()}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <div className={styles["rightPanelContent"]}>
              <div className={styles["rolesNote"]}>
                <p>Gestion des rôles pour le canal actuel</p>
              </div>
              {logic.channel && (
                <>
                  {logic.feedbacks.role && (
                    <div
                      style={{
                        color: logic.feedbacks.role.includes("Erreur")
                          ? "red"
                          : "green",
                        marginBottom: 8,
                      }}
                    >
                      {logic.feedbacks.role}
                    </div>
                  )}
                  <ChannelRolesManager
                    workspaceId={logic.workspaceId || ""}
                    channels={logic.channels as Channel[]}
                    isOwnerOrAdmin={logic.canManageMembers}
                    channel={logic.channel as Channel}
                    currentUserId={user?._id || ""}
                    onPromote={logic.handlePromoteMember}
                    onDemote={logic.handleDemoteMember}
                    canEdit={logic.canEditChannel}
                  />
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Ajout de l'affichage des invitations en attente (UI/UX)
  const renderInvitations = () => {
    if (!logic.invitations || logic.invitations.length === 0) return null;
    return (
      <ChannelInvitationsList
        invitations={logic.invitations}
        loading={logic.invitationsLoading}
        error={logic.invitationsError}
        onAccept={logic.handleAcceptInvitation}
        onDecline={logic.handleDeclineInvitation}
        feedback={logic.invitationFeedback}
      />
    );
  };

  // Affichage des demandes d'adhésion en attente
  const renderJoinRequests = () => {
    if (!logic.joinRequests || logic.joinRequests.length === 0) return null;
    return (
      <ChannelJoinRequestsList
        requests={logic.joinRequests}
        loading={logic.joinRequestsLoading}
        error={logic.joinRequestsError}
        onAccept={logic.handleAcceptJoinRequest}
        onDecline={logic.handleDeclineJoinRequest}
        feedback={logic.joinRequestFeedback}
      />
    );
  };

  return (
    <div className={styles["unifiedChannelPage"]}>
      <FeedbackToast feedbacks={logic.feedbacks} />
      {/* Sidebar gauche avec liste des canaux */}
      <aside className={styles["leftSidebar"]}>
        <div className={styles["sidebarHeader"]}>
          <h2>Canaux</h2>
          {logic.canCreateChannels && (
            <button
              className={styles["createChannelBtn"]}
              onClick={() => logic.setShowCreateChannel(true)}
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
            value={logic.searchQuery}
            onChange={(e) => logic.setSearchQuery(e.target.value)}
            className={styles["searchInput"]}
          />
        </div>
        {/* Liste des canaux */}
        <div className={styles["channelsList"]}>
          {logic.channels.length === 0 ? (
            <div className={styles["noChannels"]}>
              <p>Aucun canal disponible</p>
              {logic.canCreateChannels && (
                <button
                  className={styles["createFirstChannelBtn"]}
                  onClick={() => logic.setShowCreateChannel(true)}
                >
                  <i className="fa-solid fa-plus" />
                  Créer le premier canal
                </button>
              )}
            </div>
          ) : (
            (logic.channels as ChannelWithUnread[])
              .filter((channel) =>
                channel.name
                  .toLowerCase()
                  .includes(logic.searchQuery.toLowerCase())
              )
              .map((channel) => {
                // Détermination de l'état d'adhésion pour chaque channel public
                const isPublic = channel.type === "public";
                const isMember = channel.members?.some(
                  (m) => m._id === user?._id
                );
                const joinRequest = logic.joinRequests?.find(
                  (req) =>
                    // Optional chaining guards against undefined entries
                    req?.channelId === channel._id &&
                    req?.userId === user?._id &&
                    req?.status === "pending"
                );
                return (
                  <div
                    key={channel._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <button
                      key={channel._id}
                      className={`${styles["channelItem"]} ${
                        logic.activeChannelId === channel._id
                          ? styles["active"]
                          : ""
                      }`}
                      onClick={() => logic.handleChannelSelect(channel._id)}
                      style={{ flex: 1 }}
                      disabled={channel.type === "private" && !logic.canInvite}
                      aria-disabled={
                        channel.type === "private" && !logic.canInvite
                      }
                    >
                      <span className={styles["channelIcon"]}>
                        {channel.type === "private" ? "🔒" : "#"}
                      </span>
                      <span className={styles["channelName"]}>
                        {channel.name}
                      </span>
                      {channel.unreadCount && (
                        <span className={styles["unreadBadge"]}>
                          {channel.unreadCount}
                        </span>
                      )}
                    </button>
                    {/* Bouton Rejoindre pour channels publics si non membre */}
                    {isPublic && !isMember && (
                      <>
                        <button
                          className={styles["joinChannelBtn"]}
                          onClick={() =>
                            logic.handleSendJoinRequest(channel._id)
                          }
                          disabled={!!joinRequest || logic.joinRequestsLoading}
                          aria-disabled={
                            !!joinRequest || logic.joinRequestsLoading
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {logic.joinRequestsLoading &&
                          logic.joinRequestTarget === channel._id
                            ? "..."
                            : joinRequest
                            ? "En attente"
                            : "Rejoindre"}
                        </button>
                        {joinRequest && (
                          <span
                            className={styles["pendingBadge"]}
                            style={{
                              marginLeft: 4,
                              color: "#888",
                              fontSize: 12,
                            }}
                            aria-label="Demande en attente"
                          >
                            En attente
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </aside>
      {/* Contenu principal */}
      <main className={styles["mainContent"]}>
        {renderInvitations()}
        {renderJoinRequests()}
        {renderMainContent()}
      </main>
      {/* Panel droit (membres/paramètres/rôles) */}
      {renderRightPanel()}
      {/* Modales */}
      {logic.showEditModal && logic.channel && (
        <ChannelEditModal
          channel={logic.channel as Channel}
          onUpdate={logic.handleChannelUpdate}
          onDelete={logic.handleChannelDelete}
          onClose={() => logic.setShowEditModal(false)}
          loading={logic.updating}
          error={logic.updateError}
        />
      )}
      {logic.showCreateChannel && (
        <div className={styles["modalOverlay"]}>
          <div className={styles["modalContent"]}>
            <div className={styles["modalHeader"]}>
              <h3>Créer un nouveau canal</h3>
              <button
                className={styles["closeButton"]}
                onClick={() => logic.setShowCreateChannel(false)}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <ChannelCreateForm
              workspaceId={logic.workspaceId || ""}
              onCreate={handleCreateChannelFormSubmit}
              onCreated={() => logic.setShowCreateChannel(false)}
            />
          </div>
        </div>
      )}
      {logic.showInviteModal && logic.channel && (
        <ChannelInviteModal
          channel={logic.channel as Channel}
          users={logic.workspaceUsers
            .filter(
              (u: WorkspaceMember) =>
                !logic.channel.members?.some(
                  (m: WorkspaceMember) => m._id === u._id
                )
            )
            .map((u) => ({
              id: u._id,
              username: u.username,
              email: u.email,
              avatar: u.avatar,
            }))}
          onInvite={async (userIds) => {
            await logic.invite(userIds);
            logic.fetchChannels();
            logic.setShowInviteModal(false);
          }}
          onClose={() => logic.setShowInviteModal(false)}
          loading={logic.inviteLoading}
          error={logic.inviteError}
          success={logic.inviteSuccess}
        />
      )}
    </div>
  );
};

export default ChannelsPage;
