// src/types/channel.ts

export type ChannelType = 'public' | 'private' | 'direct';

export interface ChannelMember {
  _id: string;
  username: string;
  avatar?: string;
  role?: import('./role').ChannelRole;
}

export interface Channel {
  _id: string;
  name: string;
  description?: string;
  type: ChannelType;
  workspace: string;
  createdBy: string;
  members?: ChannelMember[];
  invitations?: import('./invitation').ChannelInvitation[];
  messages?: string[];
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
}

// Payloads pour création/mise à jour de canal (aligné sur ChannelFormData)
export interface ChannelFormData {
  name: string;
  workspace: string;
  description?: string;
  type?: ChannelType;
}

export type ChannelCreatePayload = Omit<ChannelFormData, 'workspace'>;
export type ChannelUpdatePayload = Partial<Omit<ChannelFormData, 'workspace'>>;
