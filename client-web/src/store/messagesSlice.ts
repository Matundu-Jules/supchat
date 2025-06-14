import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMessages, sendMessage, MessageFormData } from "@services/messageApi";

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
      });
  },
});

export const { pushMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
