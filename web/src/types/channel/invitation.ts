// src/types/channel/invitation.ts

export interface ChannelInvitation {
  _id: string;
  channelId: string;
  channelName?: string; // Ajouté pour l'affichage UI
  userId: string;
  email: string;
  recipient: string; // Ajouté pour compatibilité test/backend
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: string;
  respondedAt?: string;
  invitedBy?: {
    _id: string;
    email: string;
    username?: string;
  };
}
