export const notifications = [
  {
    _id: 'notif1',
    type: 'message',
    title: 'New message',
    message: 'You have a new message in #general',
    data: {
      workspaceId: 'ws1',
      channelId: 'ch1',
      messageId: 'msg1',
    },
    isRead: false,
    createdAt: '2024-01-01T10:00:00.000Z',
  },
  {
    _id: 'notif2',
    type: 'invitation',
    title: 'Workspace invitation',
    message: 'You have been invited to join "Private Team"',
    data: {
      workspaceId: 'ws2',
      inviterId: 'u1',
    },
    isRead: true,
    createdAt: '2024-01-01T09:00:00.000Z',
  },
  {
    _id: 'notif3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'John Doe mentioned you in #general',
    data: {
      workspaceId: 'ws1',
      channelId: 'ch1',
      messageId: 'msg2',
      mentionerId: 'u1',
    },
    isRead: false,
    createdAt: '2024-01-01T11:00:00.000Z',
  },
];

export const mockNotification = notifications[0];
export const mockUnreadNotifications = notifications.filter((n) => !n.isRead);
export const mockReadNotifications = notifications.filter((n) => n.isRead);
