import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Channel } from '@ts_types/channel';
import * as channelApi from '@services/channelApi';

interface ChannelStatus {
  loading: boolean;
  error: string | null;
  lastAction?: string;
}

interface ChannelsState {
  items: Channel[];
  loading: boolean;
  error: string | null;
  statusById: Record<string, ChannelStatus>;
}

const initialState: ChannelsState = {
  items: [],
  loading: false,
  error: null,
  statusById: {},
};

export const fetchChannels = createAsyncThunk<
  Channel[],
  string,
  { rejectValue: string }
>('channels/fetchAll', async (workspaceId, { rejectWithValue }) => {
  try {
    return await channelApi.getChannels(workspaceId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const addChannel = createAsyncThunk<
  Channel[],
  channelApi.ChannelFormData,
  { rejectValue: string }
>('channels/add', async (formData, { rejectWithValue }) => {
  try {
    await channelApi.createChannel(formData);
    return await channelApi.getChannels(formData.workspaceId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const editChannel = createAsyncThunk<
  Channel[],
  { channelId: string; workspace: string; data: Partial<channelApi.ChannelFormData> },
  { rejectValue: string }
>(
  'channels/edit',
  async (params, { rejectWithValue }) => {
    try {
      await channelApi.updateChannel(params.channelId, params.data);
      return await channelApi.getChannels(params.workspace);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

export const removeChannel = createAsyncThunk<
  Channel[],
  { channelId: string; workspace: string },
  { rejectValue: string }
>('channels/remove', async (params, { rejectWithValue }) => {
  try {
    await channelApi.deleteChannel(params.channelId);
    return await channelApi.getChannels(params.workspace);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const joinChannel = createAsyncThunk<
  Channel[],
  { channelId: string; workspace: string },
  { rejectValue: string }
>('channels/join', async (params, { rejectWithValue }) => {
  try {
    await channelApi.joinChannel(params.channelId);
    return await channelApi.getChannels(params.workspace);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const leaveChannel = createAsyncThunk<
  Channel[],
  { channelId: string; workspace: string },
  { rejectValue: string }
>('channels/leave', async (params, { rejectWithValue }) => {
  try {
    await channelApi.leaveChannel(params.channelId);
    return await channelApi.getChannels(params.workspace);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setStatusById: (
      state,
      action: PayloadAction<{ channelId: string; status: Partial<ChannelStatus> }>
    ) => {
      const { channelId, status } = action.payload;
      state.statusById[channelId] = {
        ...state.statusById[channelId],
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
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement';
      })
      .addCase(addChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChannel.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Erreur lors de la création';
      })
      .addCase(editChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editChannel.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(editChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Erreur lors de la mise à jour';
      })
      .addCase(removeChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeChannel.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(removeChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Erreur lors de la suppression';
      })
      .addCase(joinChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinChannel.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(joinChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Erreur lors de la jointure';
      })
      .addCase(leaveChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveChannel.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(leaveChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Erreur lors du quit';
      });
  },
});

export const { setStatusById, resetError, resetStatus } = channelsSlice.actions;
export default channelsSlice.reducer;

