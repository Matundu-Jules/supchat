// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@store/authSlice';
import workspacesReducer from '@store/workspacesSlice';
import channelsReducer from '@store/channelsSlice';
import messagesReducer from '@store/messagesSlice';
import notificationsReducer from '@store/notificationsSlice';
import preferencesReducer from '@store/preferencesSlice';
import reactionsReducer from '@store/reactionsSlice';
import notificationPrefReducer from '@store/notificationPrefSlice';
import channelInvitationsReducer from '@store/channelInvitationsSlice';
import channelJoinRequestsReducer from '@store/channelJoinRequestsSlice';
import channelRolesReducer from '@store/channelRolesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspacesReducer,
    channels: channelsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
    reactions: reactionsReducer,
    notificationPrefs: notificationPrefReducer,
    channelInvitations: channelInvitationsReducer,
    channelJoinRequests: channelJoinRequestsReducer,
    channelRoles: channelRolesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
