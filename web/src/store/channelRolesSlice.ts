import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ChannelRole, ChannelMemberRole } from '@ts_types/channel';
import * as channelApi from '@services/channelApi';

interface ChannelRolesState {
  items: ChannelMemberRole[];
  loading: boolean;
  error: string | null;
  statusById: Record<
    string,
    { loading: boolean; error: string | null; lastAction?: string }
  >;
}

const initialState: ChannelRolesState = {
  items: [],
  loading: false,
  error: null,
  statusById: {},
};

export const fetchChannelRoles = createAsyncThunk<
  ChannelMemberRole[],
  { channelId: string },
  { rejectValue: string }
>('channelRoles/fetchAll', async ({ channelId }, { rejectWithValue }) => {
  try {
    return await channelApi.getChannelRoles(channelId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const updateChannelMemberRole = createAsyncThunk<
  ChannelMemberRole,
  { channelId: string; userId: string; role: ChannelRole },
  { rejectValue: string }
>(
  'channelRoles/update',
  async ({ channelId, userId, role }, { rejectWithValue }) => {
    try {
      return await channelApi.updateChannelMemberRole(channelId, userId, role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

export const removeChannelMember = createAsyncThunk<
  { userId: string },
  { channelId: string; userId: string },
  { rejectValue: string }
>(
  'channelRoles/removeMember',
  async ({ channelId, userId }, { rejectWithValue }) => {
    try {
      await channelApi.removeChannelMember(channelId, userId);
      return { userId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

const channelRolesSlice = createSlice({
  name: 'channelRoles',
  initialState,
  reducers: {
    setStatusById: (
      state,
      action: PayloadAction<{
        memberId: string;
        status: Partial<{
          loading: boolean;
          error: string | null;
          lastAction?: string;
        }>;
      }>
    ) => {
      const { memberId, status } = action.payload;
      state.statusById[memberId] = {
        ...state.statusById[memberId],
        ...status,
      };
    },
    resetError: (state) => {
      state.error = null;
    },
    resetStatus: (state, action: PayloadAction<string>) => {
      delete state.statusById[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelRoles.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchChannelRoles.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors du chargement des rôles';
      })
      .addCase(updateChannelMemberRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChannelMemberRole.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (role) => role.userId === action.payload.userId
        );
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(updateChannelMemberRole.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la mise à jour du rôle';
      })
      .addCase(removeChannelMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeChannelMember.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (role) => role.userId !== action.payload.userId
        );
        state.loading = false;
      })
      .addCase(removeChannelMember.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la suppression du membre';
      });
  },
});

export const { setStatusById, resetError, resetStatus } =
  channelRolesSlice.actions;
export default channelRolesSlice.reducer;
