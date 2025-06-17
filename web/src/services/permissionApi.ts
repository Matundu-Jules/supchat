import api, { fetchCsrfToken } from "@utils/axiosInstance";

export async function getWorkspacePermissions(workspaceId: string) {
  await fetchCsrfToken();
  const { data } = await api.get("/permissions", { params: { workspaceId } });
  return data;
}

export async function updatePermission(
  permissionId: string,
  payload: { role?: string; channelRoles?: any[] }
) {
  await fetchCsrfToken();
  const { data } = await api.put(`/permissions/${permissionId}`, payload);
  return data;
}

