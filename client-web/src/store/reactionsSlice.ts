import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getReactions,
  addReaction,
  removeReaction,
  ReactionPayload,
} from "@services/reactionApi";

export const fetchReactions = createAsyncThunk(
  "reactions/fetch",
  async (messageId: string) => {
    return await getReactions(messageId);
  }
);

export const sendReaction = createAsyncThunk(
  "reactions/add",
  async (payload: ReactionPayload) => {
    return await addReaction(payload);
  }
);

export const deleteReaction = createAsyncThunk(
  "reactions/delete",
  async (id: string) => {
    await removeReaction(id);
    return id;
  }
);

const reactionsSlice = createSlice({
  name: "reactions",
  initialState: {
    items: [] as any[],
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReactions.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(sendReaction.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteReaction.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      });
  },
});

export const { pushReaction, removeReactionLocal, clearReactions } =
  reactionsSlice.actions;
export default reactionsSlice.reducer;
