// src/store/store.ts

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@store/authSlice";
import workspacesReducer from "@store/workspacesSlice";
import channelsReducer from "@store/channelsSlice";
import messagesReducer from "@store/messagesSlice";
import notificationsReducer from "@store/notificationsSlice";
import preferencesReducer from "@store/preferencesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspacesReducer,
    channels: channelsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
