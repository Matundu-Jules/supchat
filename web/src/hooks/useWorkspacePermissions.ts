import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import type { RootState } from '@store/store';
import type { WorkspaceMember } from '../types/workspace';

interface Workspace {
  _id: string;
  owner?: {
    _id: string;
    email: string;
    username?: string;
  };
  members?: WorkspaceMember[];
}

/**
 * Hook pour vérifier les permissions d'un utilisateur dans un workspace
 */
export function useWorkspacePermissions(workspace: Workspace | null) {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const permissions = useMemo(() => {
    if (!currentUser || !workspace) {
      return {
        isOwner: false,
        isAdmin: false,
        isMember: false,
        isOwnerOrAdmin: false,
        userRole: null,
        canManageWorkspace: false,
        canManageMembers: false,
        canManageRoles: false,
      };
    }

    // Vérifier si l'utilisateur est le propriétaire du workspace
    const isOwner = workspace.owner?.email === currentUser.email;

    // Trouver le membre dans la liste des membres du workspace
    const memberInfo = workspace.members?.find(
      (member) => member.email === currentUser.email
    );

    // Déterminer le rôle dans le workspace
    const workspaceRole = memberInfo?.role || null;
    const isWorkspaceAdmin = workspaceRole === 'admin';
    const isMember = !!memberInfo;

    // Vérifier si l'utilisateur est admin global
    const isGlobalAdmin = currentUser.role === 'admin';

    // Calculer les permissions finales
    const isAdmin = isWorkspaceAdmin || isGlobalAdmin;
    const isOwnerOrAdmin = isOwner || isAdmin;
    const canManageWorkspace = isOwner || isAdmin;
    const canManageMembers = isOwner || isAdmin;
    const canManageRoles = isOwner || isAdmin;

    return {
      isOwner,
      isAdmin,
      isMember,
      isOwnerOrAdmin,
      userRole: workspaceRole,
      canManageWorkspace,
      canManageMembers,
      canManageRoles,
      isGlobalAdmin,
      isWorkspaceAdmin,
    };
  }, [currentUser, workspace]);

  return permissions;
}
