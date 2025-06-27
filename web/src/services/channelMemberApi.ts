import api from '@utils/axiosInstance';

export async function inviteMembersToChannel(
  channelId: string,
  userIds: string[]
) {
  const res = await api.post(`/channels/${channelId}/invite`, { userIds });
  return res.data;
}

export async function removeMemberFromChannel(
  channelId: string,
  userId: string
) {
  const res = await api.delete(`/channels/${channelId}/members/${userId}`);
  return res.data;
}
