import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/store";
import {
  fetchNotificationPrefs,
  setNotificationPref,
} from "@store/notificationPrefSlice";

export function useNotificationPrefs() {
  const dispatch = useDispatch<AppDispatch>();
  const prefs = useSelector(
    (state: RootState) => state.notificationPrefs.items
  );

  const updatePref = async (
    channelId: string,
    mode: "all" | "mentions" | "mute"
  ) => {
    await dispatch(setNotificationPref({ channelId, mode }));
  };

  useEffect(() => {
    dispatch(fetchNotificationPrefs());
  }, [dispatch]);

  return { prefs, updatePref };
}
