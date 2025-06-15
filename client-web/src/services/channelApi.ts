import api, { fetchCsrfToken } from '@utils/axiosInstance';

export interface ChannelFormData {
  name: string;
  workspaceId: string;
  description?: string;
  type?: string;
}

export async function getChannels(workspaceId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get('/channels', { params: { workspaceId } });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors du chargement des canaux'
    );
  }
}

export async function createChannel(formData: ChannelFormData) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post('/channels', formData);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la création du canal'
    );
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
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la mise à jour du canal'
    );
  }
}

export async function deleteChannel(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(`/channels/${channelId}`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la suppression du canal'
    );
  }
}

export async function getChannelById(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/channels/${channelId}`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la récupération du canal'
    );
  }
}

// Fonctions pour la gestion des membres de canaux
export async function getChannelMembers(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/channels/${channelId}/members`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la récupération des membres du canal'
    );
  }
}

export async function updateChannelMemberRole(
  channelId: string,
  userId: string,
  role: string
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.put(
      `/channels/${channelId}/members/${userId}/role`,
      { role }
    );
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la mise à jour du rôle'
    );
  }
}

export async function removeChannelMember(channelId: string, userId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(
      `/channels/${channelId}/members/${userId}`
    );
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la suppression du membre'
    );
  }
}

export async function addChannelMember(channelId: string, userId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/channels/${channelId}/members`, {
      userId,
    });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de l'ajout du membre"
    );
  }
}
