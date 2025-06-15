import api, { fetchCsrfToken } from '@utils/axiosInstance';

export interface ReactionPayload {
  messageId: string;
  emoji: string;
}

export async function getReactions(messageId: string) {
  await fetchCsrfToken();
  const { data } = await api.get(`/reactions/${messageId}`);
  return data;
}

export async function addReaction(payload: ReactionPayload) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post('/reactions', payload);
    return data;
  } catch (error: any) {
    // Si la réaction existe déjà (409), on ne lance pas d'erreur
    if (error.response?.status === 409) {
      console.log('Réaction déjà existante');
      return null;
    }
    throw error;
  }
}

export async function removeReaction(id: string) {
  await fetchCsrfToken();
  await api.delete(`/reactions/${id}`);
}
