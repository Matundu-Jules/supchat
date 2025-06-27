import api, { fetchCsrfToken } from '@utils/axiosInstance';
import type { ChannelInvitation } from '@ts_types/channel/invitation';

export interface ChannelFormData {
  name: string;
  workspaceId: string;
  description?: string;
  type?: string;
}

export async function getChannels(workspaceId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/workspaces/${workspaceId}/channels`);
    return data.channels || [];
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors du chargement des canaux';
    throw new Error(message);
  }
}

export async function createChannel(formData: ChannelFormData) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(
      `/workspaces/${formData.workspaceId}/channels`,
      formData
    );
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la création du canal';
    throw new Error(message);
  }
}

export async function updateChannel(
  channelId: string,
  formData: Partial<Omit<ChannelFormData, 'workspaceId'>>
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.put(`/channels/${channelId}`, formData);
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la mise à jour du canal';
    throw new Error(message);
  }
}

export async function deleteChannel(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(`/channels/${channelId}`);
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la suppression du canal';
    throw new Error(message);
  }
}

export async function getChannelById(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/channels/${channelId}`);
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la récupération du canal';
    throw new Error(message);
  }
}

// Rôles et permissions de canal
export async function getChannelRoles(
  channelId: string
): Promise<import('@ts_types/channel').ChannelMemberRole[]> {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/channels/${channelId}/roles`);
    // On suppose que l'API retourne bien un tableau d'objets ChannelMemberRole
    return data.roles || [];
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors du chargement des rôles';
    throw new Error(message);
  }
}

// Demandes d’adhésion à un canal
export async function getChannelJoinRequests(
  channelId: string
): Promise<import('@ts_types/channel').ChannelJoinRequest[]> {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/channels/${channelId}/join-requests`);
    // Certains mocks renvoient directement un tableau
    return data.joinRequests || data || [];
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors du chargement des demandes d’adhésion';
    throw new Error(message);
  }
}

export async function sendChannelJoinRequest(
  channelId: string
): Promise<import('@ts_types/channel').ChannelJoinRequest> {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/channels/${channelId}/join-request`);
    return data.joinRequest;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la demande d’adhésion';
    throw new Error(message);
  }
}

export async function respondToChannelJoinRequest(
  requestId: string,
  accept: boolean
): Promise<import('@ts_types/channel').ChannelJoinRequest> {
  try {
    await fetchCsrfToken();
    const endpoint = accept
      ? `/channel-join-requests/${requestId}/accept`
      : `/channel-join-requests/${requestId}/decline`;
    const { data } = await api.post(endpoint);
    return data.joinRequest;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la réponse à la demande d’adhésion';
    throw new Error(message);
  }
}

export async function createChannelInvitation(
  channelId: string,
  userId: string
): Promise<ChannelInvitation> {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/channel-invitations`, {
      channelId,
      userId,
    });
    return data.invitation;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Erreur lors de l'envoi de l'invitation";
    throw new Error(message);
  }
}

export async function respondToChannelInvitation(
  invitationId: string,
  accept: boolean
): Promise<ChannelInvitation> {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(
      `/channel-invitations/respond/${invitationId}`,
      { accept }
    );
    return data.invitation;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Erreur lors de la réponse à l'invitation";
    throw new Error(message);
  }
}

/**
 * Récupère toutes les invitations de canal pour l'utilisateur courant (API enrichie)
 */
export async function getChannelInvitationsForUser(): Promise<
  ChannelInvitation[]
> {
  try {
    await fetchCsrfToken();
    const { data } = await api.get('/channel-invitations');
    return data.invitations || [];
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors du chargement des invitations';
    throw new Error(message);
  }
}

// Fonctions pour la gestion des membres de canaux
export async function getChannelMembers(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/channels/${channelId}/members`);
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la récupération des membres du canal';
    throw new Error(message);
  }
}

export async function updateChannelMemberRole(
  channelId: string,
  userId: string,
  role: import('@ts_types/channel').ChannelRole
): Promise<import('@ts_types/channel').ChannelMemberRole> {
  try {
    await fetchCsrfToken();
    const { data } = await api.put(
      `/channels/${channelId}/members/${userId}/role`,
      { role }
    );
    return data.role;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la mise à jour du rôle';
    throw new Error(message);
  }
}

export async function removeChannelMember(channelId: string, userId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(
      `/channels/${channelId}/members/${userId}`
    );
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la suppression du membre';
    throw new Error(message);
  }
}

export async function addChannelMember(channelId: string, userId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/channels/${channelId}/members`, {
      userId,
    });
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erreur lors de l'ajout du membre";
    throw new Error(message);
  }
}

// Rejoindre un canal
export async function joinChannel(channelId: string): Promise<void> {
  try {
    await fetchCsrfToken();
    await api.post(`/channels/${channelId}/join`);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la demande de rejoindre le canal';
    throw new Error(message);
  }
}

// Quitter un canal
export async function leaveChannel(channelId: string): Promise<void> {
  try {
    await fetchCsrfToken();
    await api.post(`/channels/${channelId}/leave`);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur lors de la sortie du canal';
    throw new Error(message);
  }
}
