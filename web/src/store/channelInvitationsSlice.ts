import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ChannelInvitation } from '@ts_types/channel/invitation';
import * as channelApi from '@services/channelApi';

interface ChannelInvitationsState {
  items: ChannelInvitation[];
  loading: boolean;
  error: string | null;
  statusById: Record<
    string,
    { loading: boolean; error: string | null; lastAction?: string }
  >;
}

const initialState: ChannelInvitationsState = {
  items: [],
  loading: false,
  error: null,
  statusById: {},
};

// Thunks strictement typés (aucun any)
// Nouvelle version : récupération des invitations pour l'utilisateur courant (API enrichie)
export const fetchChannelInvitations = createAsyncThunk<
  ChannelInvitation[],
  void,
  { rejectValue: string }
>('channelInvitations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    // À adapter selon l'API : ici on suppose GET /channel-invitations retourne toutes les invitations de l'utilisateur courant
    return await channelApi.getChannelInvitationsForUser();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return rejectWithValue(message);
  }
});

export const sendChannelInvitation = createAsyncThunk<
  ChannelInvitation,
  { channelId: string; userId: string },
  { rejectValue: string }
>(
  'channelInvitations/send',
  async ({ channelId, userId }, { rejectWithValue }) => {
    try {
      return await channelApi.createChannelInvitation(channelId, userId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

export const respondToChannelInvitation = createAsyncThunk<
  ChannelInvitation,
  { invitationId: string; accept: boolean },
  { rejectValue: string }
>(
  'channelInvitations/respond',
  async ({ invitationId, accept }, { rejectWithValue }) => {
    try {
      return await channelApi.respondToChannelInvitation(invitationId, accept);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return rejectWithValue(message);
    }
  }
);

const channelInvitationsSlice = createSlice({
  name: 'channelInvitations',
  initialState,
  reducers: {
    setStatusById: (
      state,
      action: PayloadAction<{
        invitationId: string;
        status: Partial<{
          loading: boolean;
          error: string | null;
          lastAction?: string;
        }>;
      }>
    ) => {
      const { invitationId, status } = action.payload;
      state.statusById[invitationId] = {
        ...state.statusById[invitationId],
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
      .addCase(fetchChannelInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelInvitations.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchChannelInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erreur lors du chargement des invitations';
      })
      .addCase(sendChannelInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChannelInvitation.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(sendChannelInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors de l'envoi de l'invitation";
      })
      .addCase(respondToChannelInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToChannelInvitation.fulfilled, (state, action) => {
        // Met à jour l'invitation dans le tableau
        const idx = state.items.findIndex(
          (inv) => inv._id === action.payload._id
        );
        if (idx !== -1) state.items[idx] = action.payload;
        state.loading = false;
      })
      .addCase(respondToChannelInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors de la réponse à l'invitation";
      });
  },
});

export const { setStatusById, resetError, resetStatus } =
  channelInvitationsSlice.actions;
export default channelInvitationsSlice.reducer;
