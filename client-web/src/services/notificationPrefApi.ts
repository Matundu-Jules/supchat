import api, { fetchCsrfToken } from "@utils/axiosInstance";

export async function getNotificationPrefs() {
  const { data } = await api.get("/notification-prefs");
  return data;
}

export async function updateNotificationPref(
  channelId: string,
  mode: "all" | "mentions" | "mute"
) {
  await fetchCsrfToken();
  const { data } = await api.put("/notification-prefs", { channelId, mode });
  return data;
}
