import api from '@utils/axiosInstance';

export interface SearchResult {
  type: 'message' | 'channel' | 'user';
  id: string;
  title: string;
  snippet?: string;
  channelId?: string;
  workspaceId?: string;
  userId?: string;
}

export async function searchAll(query: string): Promise<{
  messages: SearchResult[];
  channels: SearchResult[];
  users: SearchResult[];
}> {
  const res = await api.get('/api/search', { params: { query } });
  return res.data;
}
