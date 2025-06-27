// src/types/channel.ts

export type ChannelType = 'public' | 'private';

export interface ChannelMember {
  _id: string;
  username: string;
  avatar?: string;
  role?: string;
}

export interface Channel {
  _id: string;
  name: string;
  description?: string;
  type: ChannelType;
  workspaceId: string;
  members?: ChannelMember[];
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
}

// Payloads pour création/mise à jour de canal (aligné sur ChannelFormData)
export interface ChannelFormData {
  name: string;
  workspaceId: string;
  description?: string;
  type?: ChannelType;
}

export type ChannelCreatePayload = Omit<ChannelFormData, 'workspaceId'>;
export type ChannelUpdatePayload = Partial<Omit<ChannelFormData, 'workspaceId'>>;

