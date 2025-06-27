import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function useChannelNavigation() {
  const { workspaceId, channelId } = useParams<{
    workspaceId: string;
    channelId?: string;
  }>();
  const navigate = useNavigate();

  const [activeChannelId, setActiveChannelId] = useState<string>(
    channelId || ''
  );

  // Synchroniser avec l'URL
  useEffect(() => {
    if (channelId && channelId !== activeChannelId) {
      setActiveChannelId(channelId);
    }
  }, [channelId, activeChannelId]);

  const selectChannel = useCallback(
    (newChannelId: string) => {
      setActiveChannelId(newChannelId);
      navigate(`/workspaces/${workspaceId}/channels/${newChannelId}`);
    },
    [workspaceId, navigate]
  );

  const clearChannel = useCallback(() => {
    setActiveChannelId('');
    navigate(`/workspaces/${workspaceId}/channels`);
  }, [workspaceId, navigate]);

  return {
    workspaceId: workspaceId || '',
    activeChannelId,
    selectChannel,
    clearChannel,
  };
}
