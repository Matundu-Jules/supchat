// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@store/authSlice';
import workspacesReducer from '@store/workspacesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspacesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
