import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  ChannelFormData,
} from '@services/channelApi';

export const fetchChannels = createAsyncThunk(
  'channels/fetchAll',
  async (workspaceId: string) => {
    return await getChannels(workspaceId);
  }
);

export const addChannel = createAsyncThunk(
  'channels/add',
  async (formData: ChannelFormData) => {
    await createChannel(formData);
    return await getChannels(formData.workspaceId);
  }
);

export const editChannel = createAsyncThunk(
  'channels/edit',
  async (params: {
    channelId: string;
    workspaceId: string;
    data: Partial<Omit<ChannelFormData, 'workspaceId'>>;
  }) => {
    await updateChannel(params.channelId, params.data);
    return await getChannels(params.workspaceId);
  }
);

export const removeChannel = createAsyncThunk(
  'channels/remove',
  async (params: { channelId: string; workspaceId: string }) => {
    await deleteChannel(params.channelId);
    return await getChannels(params.workspaceId);
  }
);

const channelsSlice = createSlice({
  name: 'channels',
  initialState: {
    items: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
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
        state.error = action.error.message || 'Erreur lors de la création';
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
        state.error = action.error.message || 'Erreur lors de la mise à jour';
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
        state.error = action.error.message || 'Erreur lors de la suppression';
      });
  },
});

export default channelsSlice.reducer;
