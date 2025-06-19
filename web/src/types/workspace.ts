// src/types/workspace.ts

export interface WorkspaceMember {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  theme: 'light' | 'dark';
  role: 'propriétaire' | 'admin' | 'membre' | 'invité';
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  members?: WorkspaceMember[];
  owner?: {
    _id: string;
    email: string;
    username: string;
  };
  userStatus?: {
    isMember: boolean;
    isOwner: boolean;
    hasRequestedJoin: boolean;
    isInvited?: boolean;
  };
  joinRequests?: Array<{
    userId: {
      _id: string;
      name?: string;
      email: string;
      avatar?: string;
    };
    requestedAt: string;
    message: string;
  }>;
}
