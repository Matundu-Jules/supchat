import { useEffect, useState } from 'react';
import {
  getWorkspaceDetails,
  inviteToWorkspace,
  joinWorkspace,
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

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkspaceDetails(workspaceId);
      setWorkspace(data);
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
        msg.toLowerCase().includes("n'existe")
      ) {
        setInviteError(
          "L'adresse e-mail saisie ne correspond à aucun utilisateur inscrit. L'invitation n'a pas été envoyée."
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
    handleInvite,
    handleJoin,
  };
}
