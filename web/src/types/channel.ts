// src/types/channel.ts

export type ChannelType = 'public' | 'private';

export interface Channel {
  _id: string;
  name: string;
  description?: string;
  type: ChannelType;
  workspaceId: string;
  members?: Array<{
    _id: string;
    username: string;
    avatar?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}
