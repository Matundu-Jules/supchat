import api, { fetchCsrfToken } from "@utils/axiosInstance";

export async function getNotifications() {
  await fetchCsrfToken();
  const { data } = await api.get("/notifications");
  return data;
}

export async function markNotificationRead(id: string) {
  await fetchCsrfToken();
  await api.post(`/notifications/${id}/read`);
}
