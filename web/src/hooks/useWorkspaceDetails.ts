import { useEffect, useState } from 'react';
import {
  getWorkspaceDetails,
  getWorkspaceMembers,
  inviteToWorkspace,
  joinWorkspace,
  removeMemberFromWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from '@services/workspaceApi';

export function useWorkspaceDetails(workspaceId: string) {
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [workspaceData, membersData] = await Promise.all([
        getWorkspaceDetails(workspaceId),
        getWorkspaceMembers(workspaceId),
      ]);

      // Remplacer les membres du workspace par ceux avec les rôles corrects
      const workspaceWithRoles = {
        ...workspaceData,
        members: membersData,
      };

      setWorkspace(workspaceWithRoles);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await inviteToWorkspace(workspaceId, inviteEmail);
      setInviteEmail('');
      setInviteSuccess('Invitation envoyée avec succès !');
      fetchDetails();
    } catch (err: any) {
      // Gestion robuste de l'erreur
      const msg = err?.response?.data?.message || err?.message || '';
      if (
        msg === 'USER_NOT_FOUND' ||
        msg.includes('utilisateur') ||
        msg.includes('aucun utilisateur inscrit') ||
        msg.toLowerCase().includes("n'existe")
      ) {
        setInviteError(
          'Cette adresse email ne correspond à aucun utilisateur inscrit. Seuls les utilisateurs ayant un compte peuvent être invités.'
        );
      } else {
        setInviteError(msg || "Erreur lors de l'invitation");
      }
      setInviteSuccess(null);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode) return;
    setJoinLoading(true);
    try {
      await joinWorkspace(joinCode);
      alert("Vous avez rejoint l'espace de travail !");
      setJoinCode('');
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la jointure');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer ce membre du workspace ?')
    ) {
      return;
    }

    setLoading(true);
    try {
      await removeMemberFromWorkspace(workspaceId, userId);
      // Rafraîchir les détails du workspace pour mettre à jour la liste des membres
      await fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du membre');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    setEditLoading(true);
    setError(null);
    try {
      await updateWorkspace(workspaceId, formData);
      // Rafraîchir les détails du workspace après modification
      await fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du workspace');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer ce workspace ? Cette action est irréversible.'
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    try {
      await deleteWorkspace(workspaceId);
      // Rediriger vers la liste des workspaces après suppression
      window.location.href = '/workspaces';
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du workspace');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    setInviteSuccess(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);
  return {
    workspace,
    loading,
    error,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    inviteError,
    inviteSuccess,
    setInviteSuccess,
    joinCode,
    setJoinCode,
    joinLoading,
    editLoading,
    deleteLoading,
    handleInvite,
    handleJoin,
    handleRemoveMember,
    handleEdit,
    handleDelete,
    fetchDetails, // Exposer la fonction fetchDetails
  };
}
