import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  ChannelFormData,
} from '@services/channelApi';
import api from '@utils/axiosInstance';

export const fetchChannels = createAsyncThunk(
  'channels/fetchAll',
  async (workspaceId: string) => {
    return await getChannels(workspaceId);
  }
);

export const addChannel = createAsyncThunk(
  'channels/add',
  async (formData: ChannelFormData, { rejectWithValue }) => {
    try {
      await createChannel(formData);
      return await getChannels(formData.workspaceId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const editChannel = createAsyncThunk(
  'channels/edit',
  async (
    params: {
      channelId: string;
      workspaceId: string;
      data: Partial<Omit<ChannelFormData, 'workspaceId'>>;
    },
    { rejectWithValue }
  ) => {
    try {
      await updateChannel(params.channelId, params.data);
      return await getChannels(params.workspaceId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeChannel = createAsyncThunk(
  'channels/remove',
  async (
    params: { channelId: string; workspaceId: string },
    { rejectWithValue }
  ) => {
    try {
      await deleteChannel(params.channelId);
      return await getChannels(params.workspaceId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const joinChannel = createAsyncThunk(
  'channels/join',
  async (
    params: { channelId: string; workspaceId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.post(`/api/channels/${params.channelId}/join`);
      return await getChannels(params.workspaceId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const leaveChannel = createAsyncThunk(
  'channels/leave',
  async (
    params: { channelId: string; workspaceId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.post(`/api/channels/${params.channelId}/leave`);
      return await getChannels(params.workspaceId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const channelsSlice = createSlice({
  name: 'channels',
  initialState: {
    items: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    addLocal: (state, action) => {
      // Ajoute le channel s'il n'existe pas déjà
      if (!state.items.some((c) => c._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    editLocal: (state, action) => {
      const idx = state.items.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeLocal: (state, action) => {
      state.items = state.items.filter((c) => c._id !== action.payload);
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
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la création';
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
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la mise à jour';
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
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la suppression';
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
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la jointure';
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
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors du quit';
      });
  },
});

export default channelsSlice.reducer;
