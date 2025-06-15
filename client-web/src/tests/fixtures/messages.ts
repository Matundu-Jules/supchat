import { users } from './users';

export const messages = [
  {
    _id: 'msg1',
    content: 'Hello everyone! 👋',
    author: users[0],
    channel: 'ch1',
    workspace: 'ws1',
    type: 'text',
    reactions: [
      { emoji: '👋', users: [users[1]], count: 1 },
      { emoji: '😊', users: [users[0], users[1]], count: 2 },
    ],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
  },
  {
    _id: 'msg2',
    content: 'How is everyone doing today?',
    author: users[1],
    channel: 'ch1',
    workspace: 'ws1',
    type: 'text',
    reactions: [],
    createdAt: '2024-01-01T10:05:00.000Z',
    updatedAt: '2024-01-01T10:05:00.000Z',
  },
  {
    _id: 'msg3',
    content: "Let's discuss the project roadmap",
    author: users[0],
    channel: 'ch3',
    workspace: 'ws2',
    type: 'text',
    reactions: [{ emoji: '🚀', users: [users[1], users[2]], count: 2 }],
    createdAt: '2024-01-02T14:00:00.000Z',
    updatedAt: '2024-01-02T14:00:00.000Z',
  },
];

export const mockMessage = messages[0];
export const mockMessageWithReactions = messages[0];
export const mockMessageNoReactions = messages[1];
