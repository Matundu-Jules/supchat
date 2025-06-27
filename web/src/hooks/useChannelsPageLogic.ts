import { useEffect, useState } from "react";
import { useChannelNavigation } from "@hooks/useChannelNavigation";
import { useRightPanel } from "@hooks/useRightPanel";
import { useChannels } from "@hooks/useChannels";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import { useChannelMembers } from "@hooks/useChannelMembers";
import { getWorkspaceMembers } from "@services/workspaceApi";
import { ChannelRole } from "@utils/channelPermissions";

import type { User } from "@ts_types/user";
import type { Message } from "@ts_types/message";
import type { WorkspaceMember } from "@ts_types/workspace";
// NOTE: Channel n'est plus importé car non utilisé

import type { ChannelCreatePayload, ChannelUpdatePayload } from "@ts_types/channel";

interface UseChannelsPageLogicProps {
  user: User | null;
  navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
}

export function useChannelsPageLogic({ user, navigate }: UseChannelsPageLogicProps) {
  // Hooks personnalisés pour la gestion de l'état
  const { workspaceId, activeChannelId, selectChannel, clearChannel } = useChannelNavigation();
  const {
    rightPanelView,
    closePanel: closeRightPanel,
    togglePanel: toggleRightPanel,
  } = useRightPanel();

  // État local pour les modales et autres
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

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

  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceMember[]>([]);
  useEffect(() => {
    if (workspaceId) {
      getWorkspaceMembers(workspaceId)
        .then((response) => {
          const members = response.members || response;
          setWorkspaceUsers(members);
        })
        .catch(() => setWorkspaceUsers([]));
    }
  }, [workspaceId]);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [activeChannelId]);

  // Logique permissions
  const getCurrentUserRole = (): ChannelRole => {
    if (!user) return "guest";
    if (user.role === "admin") return "admin";
    if (!channel) return "member";
    // Typage partiel pour compatibilité avec les channels ayant potentiellement un owner
    const owner = (channel as { owner?: User }).owner;
    if (owner) {
      if (
        owner._id === user._id ||
        owner.email === user.email
      ) {
        return "admin";
      }
    }
    if (!owner && channel.members) {
      const memberInChannel = channel.members.find(
        (m: WorkspaceMember) => m._id === user._id || m.email === user.email
      );
      if (memberInChannel) {
        return "admin";
      }
    }
    const memberInChannel = channel.members?.find(
      (m: WorkspaceMember) => m._id === user._id || m.email === user.email
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
      channel.members?.some((m: WorkspaceMember) => m._id === user?._id));

  useEffect(() => {
    if (!channel || !user) return;
    if (channel.type === "private") {
      const isMember = channel.members?.some((m: WorkspaceMember) => m._id === user._id);
      if (!isMember) {
        clearChannel();
        navigate(`/workspaces/${workspaceId}/channels`, { replace: true });
      }
    }
  }, [channel, user, workspaceId, navigate, clearChannel]);

  const canCreateChannels = user && (user.role === "admin" || user.role === "membre");

  const handleChannelSelect = (channelId: string) => {
    selectChannel(channelId);
    closeRightPanel();
    navigate(`/workspaces/${workspaceId}/channels/${channelId}`);
  };

    const handleChannelUpdate = async (data: ChannelUpdatePayload) => {
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

    // Adaptation du type pour compatibilité ChannelFormData (type?: string)
  const handleCreateChannelSubmit = async (data: ChannelCreatePayload) => {
    // On convertit type: ChannelType -> string pour ChannelFormData attendu par ChannelCreateForm
    const payload = {
      ...data,
      type: data.type as string
    };
    await handleCreateChannel(payload);
    setShowCreateChannel(false);
    fetchChannels();
  };

  const handleSendMessage = async (
    content: string,
    file?: File | null,
    e?: React.FormEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!content.trim() && !file) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempId,
      content,
      author: user ? { email: user.email, username: user.username } : undefined,
      createdAt: new Date().toISOString(),
      channelId: activeChannelId,
      file: file ? file.name : undefined,
      filename: file ? file.name : undefined,
      mimetype: file ? file.type : undefined,
      isOptimistic: true,
    };
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    try {
      await send(content, file || undefined);
      setOptimisticMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setMessageError(null);
    } catch (err) {
      setOptimisticMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setMessageError((err as Error).message || "Erreur lors de l'envoi du message");
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
    } catch (err) {
      setMessageError((err as Error).message || "Erreur lors de la modification du message");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await remove(id);
      setMessageError(null);
    } catch (err) {
      setMessageError((err as Error).message || "Erreur lors de la suppression du message");
    }
  };

  return {
    // State et setters
    showEditModal,
    setShowEditModal,
    showCreateChannel,
    setShowCreateChannel,
    showInviteModal,
    setShowInviteModal,
    searchQuery,
    setSearchQuery,
    messageError,
    setMessageError,
    optimisticMessages,
    setOptimisticMessages,
    workspaceUsers,
    setWorkspaceUsers,
    // Hooks et data
    workspaceId,
    activeChannelId,
    selectChannel,
    clearChannel,
    rightPanelView,
    closeRightPanel,
    toggleRightPanel,
    channels,
    channelsLoading,
    fetchChannels,
    handleCreateChannel,
    messages,
    messagesLoading,
    send,
    updateMsg,
    remove,
    messagesError,
    channel,
    channelLoading,
    handleUpdate,
    handleDelete,
    updating,
    updateError,
    canEditChannel,
    canManageMembers,
    invite,
    removeMember,
    inviteLoading,
    inviteError,
    inviteSuccess,
    userChannelRole,
    canActuallyWrite,
    canCreateChannels,
    handleChannelSelect,
    handleChannelUpdate,
    handleChannelDelete,
    handleCreateChannelSubmit,
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
  };
}
