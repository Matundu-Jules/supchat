import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMessages,
  sendMessage,
  updateMessage as apiUpdateMessage,
  removeMessage as apiRemoveMessage,
  MessageFormData,
} from "@services/messageApi";

export const fetchMessages = createAsyncThunk(
  "messages/fetchAll",
  async (channelId: string) => {
    return await getMessages(channelId);
  }
);

export const addMessage = createAsyncThunk(
  "messages/add",
  async (formData: MessageFormData) => {
    await sendMessage(formData);
    return await getMessages(formData.channelId);
  }
);

export const editMessage = createAsyncThunk(
  "messages/edit",
  async ({ id, text, file }: { id: string; text: string; file?: File | null }) => {
    const data = await apiUpdateMessage(id, { text, file });
    return data;
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/delete",
  async (id: string) => {
    await apiRemoveMessage(id);
    return id;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    items: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    pushMessage: (state, action) => {
      state.items.push(action.payload);
    },
    replaceMessage: (state, action) => {
      const idx = state.items.findIndex((m) => m._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeMessageLocal: (state, action) => {
      state.items = state.items.filter((m) => m._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur lors du chargement";
      })
      .addCase(addMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur lors de l'envoi";
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
      });
  },
});

export const { pushMessage, replaceMessage, removeMessageLocal } =
  messagesSlice.actions;
export default messagesSlice.reducer;
