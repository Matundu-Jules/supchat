import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  markNotificationRead,
} from "@services/notificationApi";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async () => {
    return await getNotifications();
  }
);

export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string) => {
    await markNotificationRead(id);
    return id;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [] as any[],
    loading: false,
    unread: 0,
    error: null as string | null,
  },
  reducers: {
    pushNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) state.unread += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unread = action.payload.filter((n: any) => !n.read).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur lors du chargement";
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.read) {
          n.read = true;
          if (state.unread > 0) state.unread -= 1;
        }
      });
  },
});

export const { pushNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
