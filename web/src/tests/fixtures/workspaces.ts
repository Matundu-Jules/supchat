import { users } from './users';

export const workspaces = [
  {
    _id: 'ws1',
    name: 'General Workspace',
    description: 'Main workspace for general discussions',
    isPublic: true,
    owner: users[0],
    members: [users[0], users[1]],
    channels: ['ch1', 'ch2'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'ws2',
    name: 'Private Team',
    description: 'Private workspace for team collaboration',
    isPublic: false,
    owner: users[1],
    members: [users[1], users[2]],
    channels: ['ch3'],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const mockWorkspace = workspaces[0];
export const mockPrivateWorkspace = workspaces[1];
