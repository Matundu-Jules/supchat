import api, { fetchCsrfToken } from "@utils/axiosInstance";

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
  await fetchCsrfToken();
  const { data } = await api.post("/reactions", payload);
  return data;
}

export async function removeReaction(id: string) {
  await fetchCsrfToken();
  await api.delete(`/reactions/${id}`);
}
