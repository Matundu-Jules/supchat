import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@store/store";
import {
  fetchChannels,
  addChannel,
} from "@store/channelsSlice";
import type { ChannelFormData } from "@services/channelApi";

export function useChannels(workspaceId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const channels = useSelector((state: RootState) => state.channels.items);
  const loading = useSelector((state: RootState) => state.channels.loading);
  const error = useSelector((state: RootState) => state.channels.error);

  const fetchAll = () => {
    if (workspaceId) {
      dispatch(fetchChannels(workspaceId));
    }
  };

  const handleCreateChannel = async (formData: Omit<ChannelFormData, "workspaceId">) => {
    if (!workspaceId) return;
    await dispatch(addChannel({ ...formData, workspaceId }));
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return { channels, loading, error, fetchChannels: fetchAll, handleCreateChannel };
}
