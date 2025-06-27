import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ChannelJoinRequest } from '@ts_types/channel';
import * as channelApi from '@services/channelApi';

interface ChannelJoinRequestsState {
  items: ChannelJoinRequest[];
  loading: boolean;
  error: string | null;
  statusById: Record<
    string,
    { loading: boolean; error: string | null; lastAction?: string }
  >;
}

const initialState: ChannelJoinRequestsState = {
  items: [],
  loading: false,
  error: null,
  statusById: {},
};

export const fetchChannelJoinRequests = createAsyncThunk<
  ChannelJoinRequest[],
  { channelId: string },
  { rejectValue: string }
>(
  'channelJoinRequests/fetchAll',
  async ({ channelId }, { rejectWithValue }) => {
    try {
      return await channelApi.getChannelJoinRequests(channelId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

export const sendChannelJoinRequest = createAsyncThunk<
  ChannelJoinRequest,
  { channelId: string },
  { rejectValue: string }
>('channelJoinRequests/send', async ({ channelId }, { rejectWithValue }) => {
  try {
    return await channelApi.sendChannelJoinRequest(channelId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const respondToChannelJoinRequest = createAsyncThunk<
  ChannelJoinRequest,
  { requestId: string; accept: boolean },
  { rejectValue: string }
>(
  'channelJoinRequests/respond',
  async ({ requestId, accept }, { rejectWithValue }) => {
    try {
      return await channelApi.respondToChannelJoinRequest(requestId, accept);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

const channelJoinRequestsSlice = createSlice({
  name: 'channelJoinRequests',
  initialState,
  reducers: {
    setStatusById: (
      state,
      action: PayloadAction<{
        requestId: string;
        status: Partial<{
          loading: boolean;
          error: string | null;
          lastAction?: string;
        }>;
      }>
    ) => {
      const { requestId, status } = action.payload;
      state.statusById[requestId] = {
        ...state.statusById[requestId],
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
      .addCase(fetchChannelJoinRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelJoinRequests.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchChannelJoinRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors du chargement des demandes';
      })
      .addCase(sendChannelJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChannelJoinRequest.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(sendChannelJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors de la demande d'adhésion";
      })
      .addCase(respondToChannelJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToChannelJoinRequest.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (req) => req._id === action.payload._id
        );
        if (idx !== -1) state.items[idx] = action.payload;
        state.loading = false;
      })
      .addCase(respondToChannelJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors de la réponse à la demande';
      });
  },
});

export const { setStatusById, resetError, resetStatus } =
  channelJoinRequestsSlice.actions;
export default channelJoinRequestsSlice.reducer;
