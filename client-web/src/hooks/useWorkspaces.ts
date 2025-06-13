import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@store/store';
import { fetchWorkspaces, addWorkspace } from '@store/workspacesSlice';
import {
  inviteToWorkspace as inviteToWorkspaceApi,
  joinWorkspace as joinWorkspaceApi,
} from '@services/workspaceApi';

/**
 * Hook personnalisé pour gérer les workspaces avec Redux
 */
export function useWorkspaces() {
  const dispatch = useDispatch<AppDispatch>();
  const workspaces = useSelector((state: RootState) => state.workspaces.items);
  const loading = useSelector((state: RootState) => state.workspaces.loading);
  const error = useSelector((state: RootState) => state.workspaces.error);

  // Récupérer la liste des workspaces
  const fetchAll = () => {
    dispatch(fetchWorkspaces());
  };

  // Créer un workspace
  const handleCreateWorkspace = async (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    await dispatch(addWorkspace(formData));
  };

  // Inviter un membre à un workspace
  const handleInvite = async (workspaceId: string, email: string) => {
    try {
      const response = await inviteToWorkspaceApi(workspaceId, email);
      alert(`Invitation envoyée à ${email}`);
      return response;
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'invitation");
      throw err;
    }
  };

  // Rejoindre un workspace via un code d'invitation
  const handleJoin = async (inviteCode: string) => {
    try {
      const response = await joinWorkspaceApi(inviteCode);
      fetchAll();
      alert("Vous avez rejoint l'espace de travail !");
      return response;
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la jointure');
      throw err;
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces: fetchAll,
    handleCreateWorkspace,
    handleInvite,
    handleJoin,
  };
}
