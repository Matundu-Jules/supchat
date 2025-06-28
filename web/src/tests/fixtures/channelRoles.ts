import { users } from './users';
import { channels } from './channels';
import type { ChannelMemberRole } from '@ts_types/channel';

export const roles: ChannelMemberRole[] = [
  {
    userId: users[0]._id,
    channelId: channels[0]._id,
    role: 'admin',
    updatedAt: '2024-06-01T12:00:00.000Z',
  },
  {
    userId: users[1]._id,
    channelId: channels[0]._id,
    role: 'member',
    updatedAt: '2024-06-01T12:05:00.000Z',
  },
  {
    userId: users[2]._id,
    channelId: channels[1]._id,
    role: 'guest',
    updatedAt: '2024-06-01T12:10:00.000Z',
  },
];
