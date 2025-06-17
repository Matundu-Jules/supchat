import { users } from './users';

export const channels = [
  {
    _id: 'ch1',
    name: 'general',
    description: 'General discussion channel',
    type: 'text',
    workspace: 'ws1',
    isPrivate: false,
    owner: users[0],
    members: [users[0], users[1]],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'ch2',
    name: 'random',
    description: 'Random chat channel',
    type: 'text',
    workspace: 'ws1',
    isPrivate: false,
    owner: users[0],
    members: [users[0], users[1]],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'ch3',
    name: 'private-team',
    description: 'Private team channel',
    type: 'text',
    workspace: 'ws2',
    isPrivate: true,
    owner: users[1],
    members: [users[1], users[2]],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const mockChannel = channels[0];
export const mockPrivateChannel = channels[2];
