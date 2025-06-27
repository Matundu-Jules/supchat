// src/types/channel/joinRequest.ts

export interface ChannelJoinRequest {
  _id: string;
  channelId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: string;
  respondedAt?: string;
  message?: string;
}
