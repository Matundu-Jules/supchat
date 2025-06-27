import { users } from './users';

export const channels = [
  {
    _id: 'ch1',
    name: 'general',
    description: 'General discussion channel',
    type: 'public',
    workspace: 'ws1',
    createdBy: users[0]._id,
    members: [
      { _id: users[0]._id, username: users[0].username },
      { _id: users[1]._id, username: users[1].username },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'ch2',
    name: 'random',
    description: 'Random chat channel',
    type: 'public',
    workspace: 'ws1',
    createdBy: users[0]._id,
    members: [
      { _id: users[0]._id, username: users[0].username },
      { _id: users[1]._id, username: users[1].username },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'ch3',
    name: 'private-team',
    description: 'Private team channel',
    type: 'private',
    workspace: 'ws2',
    createdBy: users[1]._id,
    members: [
      { _id: users[1]._id, username: users[1].username },
      { _id: users[2]._id, username: users[2].username },
    ],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const mockChannel = channels[0];
export const mockPrivateChannel = channels[2];

export const joinRequests = [
  {
    _id: 'jr1',
    channelId: channels[0]._id,
    userId: users[2]._id,
    status: 'pending',
    requestedAt: '2024-06-01T10:00:00.000Z',
  },
  {
    _id: 'jr2',
    channelId: channels[1]._id,
    userId: users[2]._id,
    status: 'pending',
    requestedAt: '2024-06-01T11:00:00.000Z',
  },
];
