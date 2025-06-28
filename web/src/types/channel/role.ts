// src/types/channel/role.ts

// Rôle d'un utilisateur au sein d'un canal
// Harmonisé avec utils/channelPermissions.ts
export type ChannelRole = 'admin' | 'member' | 'guest' | 'invité';

export interface ChannelMemberRole {
  userId: string;
  channelId: string;
  role: ChannelRole;
  updatedAt: string;
}
