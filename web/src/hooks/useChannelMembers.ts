import { useState } from 'react';
import {
  inviteMembersToChannel,
  removeMemberFromChannel,
} from '@services/channelMemberApi';

export function useChannelMembers(channelId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const invite = async (userIds: string[]) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await inviteMembersToChannel(channelId, userIds);
      setSuccess('Invitation envoyée avec succès');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (userId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await removeMemberFromChannel(channelId, userId);
      setSuccess('Membre supprimé du canal');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return { invite, remove, loading, error, success };
}
