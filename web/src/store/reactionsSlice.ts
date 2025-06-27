import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getReactions,
  addReaction,
  removeReaction,
  ReactionPayload,
} from '@services/reactionApi';

export const fetchReactions = createAsyncThunk(
  'reactions/fetch',
  async (messageId: string) => {
    return await getReactions(messageId);
  }
);

export const sendReaction = createAsyncThunk(
  'reactions/add',
  async (payload: ReactionPayload) => {
    return await addReaction(payload);
  }
);

export const deleteReaction = createAsyncThunk(
  'reactions/delete',
  async (id: string) => {
    await removeReaction(id);
    return id;
  }
);

const reactionsSlice = createSlice({
  name: 'reactions',
  initialState: {
    items: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    pushReaction: (state, action) => {
      state.items.push(action.payload);
    },
    removeReactionLocal: (state, action) => {
      state.items = state.items.filter((r) => r._id !== action.payload);
    },
    clearReactions: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reactions
      .addCase(fetchReactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchReactions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Erreur lors du chargement des réactions';
        console.warn('❌ Erreur fetchReactions:', action.error);
      })
      // Send reaction
      .addCase(sendReaction.pending, (state) => {
        state.error = null;
      })
      .addCase(sendReaction.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      })
      .addCase(sendReaction.rejected, (state, action) => {
        state.error =
          action.error.message || "Erreur lors de l'ajout de réaction";
        console.warn('❌ Erreur sendReaction:', action.error);
      })
      // Delete reaction
      .addCase(deleteReaction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteReaction.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteReaction.rejected, (state, action) => {
        state.error =
          action.error.message || 'Erreur lors de la suppression de réaction';
        console.warn('❌ Erreur deleteReaction:', action.error);
      });
  },
});

export const { pushReaction, removeReactionLocal, clearReactions, clearError } =
  reactionsSlice.actions;
export default reactionsSlice.reducer;
