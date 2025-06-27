import api, { fetchCsrfToken } from '@utils/axiosInstance';

export interface ReactionPayload {
  messageId: string;
  emoji: string;
}

export async function getReactions(messageId: string) {
  // Ne pas faire d'appel API pour les messages temporaires
  if (!messageId || messageId.startsWith('temp-')) {
    console.warn(
      "⚠️ Tentative d'accès aux réactions d'un message temporaire:",
      messageId
    );
    return [];
  }

  await fetchCsrfToken();
  const { data } = await api.get(`/reactions/${messageId}`);
  return data;
}

export async function addReaction(payload: ReactionPayload) {
  // Ne pas permettre l'ajout de réactions sur les messages temporaires
  if (!payload.messageId || payload.messageId.startsWith('temp-')) {
    console.warn(
      "⚠️ Tentative d'ajout de réaction sur un message temporaire:",
      payload.messageId
    );
    return null;
  }

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
  // Ne pas supprimer de réactions sur les messages temporaires
  if (!id || id.startsWith('temp-')) {
    console.warn(
      '⚠️ Tentative de suppression de réaction sur un message temporaire:',
      id
    );
    return;
  }

  await fetchCsrfToken();
  await api.delete(`/reactions/${id}`);
}
