// src/store/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Role = 'admin' | 'membre' | 'invité';

export interface User {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  googleId?: string;
  facebookId?: string;
  hasPassword?: boolean; // Indique si l'utilisateur a défini un mot de passe
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<User | undefined>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      if (action.payload) state.user = action.payload;
    },

    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setAuth, login, logout, setAuthLoading, updateUserProfile } =
  authSlice.actions;
export default authSlice.reducer;
