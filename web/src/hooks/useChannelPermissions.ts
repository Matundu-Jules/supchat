import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getWorkspacePermissions } from '@services/permissionApi';
import type { RootState } from '@store/store';

interface ChannelPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  isChannelAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useChannelPermissions(
  channelId: string,
  workspaceId?: string
): ChannelPermissions {
  const user = useSelector((state: RootState) => state.auth.user);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !user) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWorkspacePermissions(workspaceId);
        setPermissions(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [workspaceId, user]);

  if (!user || !channelId) {
    return {
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      isChannelAdmin: false,
      loading: false,
      error: null,
    };
  }

  // Si c'est un admin global, il a tous les droits
  if (user.role === 'admin') {
    return {
      canEdit: true,
      canDelete: true,
      canManageMembers: true,
      isChannelAdmin: true,
      loading,
      error,
    };
  }

  // Trouver les permissions de l'utilisateur actuel dans ce workspace
  const userId = (user as any).id || (user as any)._id;
  const userPermission = permissions.find(
    (perm: any) => String(perm.userId._id || perm.userId) === String(userId)
  );

  if (!userPermission) {
    return {
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      isChannelAdmin: false,
      loading,
      error,
    };
  }

  // Vérifier le rôle spécifique dans le canal
  const channelRole = userPermission.channelRoles?.find(
    (cr: any) => String(cr.channelId) === String(channelId)
  );

  const effectiveRole = channelRole ? channelRole.role : userPermission.role;
  const isChannelAdmin = effectiveRole === 'admin';

  // Les admins de workspace ont tous les droits
  const isWorkspaceAdmin = userPermission.role === 'admin';

  return {
    canEdit: isWorkspaceAdmin || isChannelAdmin,
    canDelete: isWorkspaceAdmin || isChannelAdmin,
    canManageMembers: isWorkspaceAdmin || isChannelAdmin,
    isChannelAdmin: isWorkspaceAdmin || isChannelAdmin,
    loading,
    error,
  };
}
