import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getChannelById, updateChannel } from '@services/channelApi';
import { removeChannel } from '@store/channelsSlice';
import type { AppDispatch } from '@store/store';

export function useChannelDetails(channelId: string) {
  const dispatch = useDispatch<AppDispatch>();
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
      console.error('❌ Erreur lors du chargement du canal:', err);

      // Gestion spécifique des erreurs 403 (Forbidden)
      if (err.response?.status === 403) {
        setError(
          "Accès refusé - Vous n'avez pas les permissions pour accéder à ce canal"
        );
      } else if (err.response?.status === 404) {
        setError('Canal introuvable');
      } else {
        setError(err.message || 'Erreur lors du chargement du canal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload: {
    name?: string;
    description?: string;
  }) => {
    if (!channelId) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await updateChannel(channelId, payload);
      await fetchDetails();
    } catch (err: any) {
      setUpdateError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!channel) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await dispatch(
        removeChannel({ channelId, workspaceId: channel.workspace })
      ).unwrap();
      return channel.workspace;
    } catch (err: any) {
      setUpdateError(err.message || 'Erreur lors de la suppression');
      throw err;
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
    handleDelete,
    updating,
    updateError,
  };
}
