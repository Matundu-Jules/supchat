import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationPrefs,
  updateNotificationPref,
} from "@services/notificationPrefApi";

export const fetchNotificationPrefs = createAsyncThunk(
  "notificationPrefs/fetchAll",
  async () => {
    return await getNotificationPrefs();
  }
);

export const setNotificationPref = createAsyncThunk(
  "notificationPrefs/set",
  async (params: { channelId: string; mode: "all" | "mentions" | "mute" }) => {
    await updateNotificationPref(params.channelId, params.mode);
    return params;
  }
);

const notificationPrefSlice = createSlice({
  name: "notificationPrefs",
  initialState: {
    items: [] as { channelId: string; mode: "all" | "mentions" | "mute" }[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchNotificationPrefs.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(setNotificationPref.fulfilled, (state, action) => {
      const existing = state.items.find(
        (p) => p.channelId === action.payload.channelId
      );
      if (existing) {
        existing.mode = action.payload.mode;
      } else {
        state.items.push(action.payload);
      }
    });
  },
});

export default notificationPrefSlice.reducer;
