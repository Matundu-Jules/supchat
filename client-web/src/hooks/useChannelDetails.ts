import { useEffect, useState } from "react";
import { getChannelById, updateChannel } from "@services/channelApi";

export function useChannelDetails(channelId: string) {
  const [channel, setChannel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getChannelById(channelId);
      setChannel(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload: { name?: string; description?: string }) => {
    if (!channelId) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await updateChannel(channelId, payload);
      await fetchDetails();
    } catch (err: any) {
      setUpdateError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  return {
    channel,
    loading,
    error,
    fetchDetails,
    handleUpdate,
    updating,
    updateError,
  };
}
