import api, { fetchCsrfToken } from "@utils/axiosInstance";

export interface MessageFormData {
  channelId: string;
  text: string;
}

export async function getMessages(channelId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/messages/channel/${channelId}`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err.message || "Erreur lors du chargement"
    );
  }
}

export async function sendMessage(formData: MessageFormData) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post("/messages", formData);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err.message || "Erreur lors de l'envoi"
    );
  }
}
