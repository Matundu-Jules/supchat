// src/types/channel/role.ts

export type ChannelRole = 'admin' | 'membre' | 'invité';

export interface ChannelMemberRole {
  userId: string;
  channelId: string;
  role: ChannelRole;
  updatedAt: string;
}
