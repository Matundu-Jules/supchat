import api, { fetchCsrfToken } from "@utils/axiosInstance";

export interface MessageFormData {
  channelId: string;
  text: string;
  file?: File | null;
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
    const dataToSend = new FormData();
    dataToSend.append("channelId", formData.channelId);
    dataToSend.append("text", formData.text);
    if (formData.file) dataToSend.append("file", formData.file);
    const { data } = await api.post("/messages", dataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err.message || "Erreur lors de l'envoi"
    );
  }
}
