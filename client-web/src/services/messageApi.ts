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

export async function updateMessage(
  id: string,
  payload: { text: string; file?: File | null }
) {
  try {
    await fetchCsrfToken();
    const dataToSend = new FormData();
    dataToSend.append("text", payload.text);
    if (payload.file) dataToSend.append("file", payload.file);
    const { data } = await api.put(`/messages/${id}`, dataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err.message || "Erreur lors de la mise à jour"
    );
  }
}

export async function removeMessage(id: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(`/messages/${id}`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err.message || "Erreur lors de la suppression"
    );
  }
}
