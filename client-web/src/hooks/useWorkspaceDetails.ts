import { useEffect, useState } from "react";
import {
  getWorkspaceDetails,
  inviteToWorkspace,
  joinWorkspace,
} from "@services/workspaceApi";

export function useWorkspaceDetails(workspaceId: string) {
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkspaceDetails(workspaceId);
      setWorkspace(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      await inviteToWorkspace(workspaceId, inviteEmail);
      alert(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail("");
      fetchDetails();
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'invitation");
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
      setJoinCode("");
      fetchDetails();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la jointure");
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return {
    workspace,
    loading,
    error,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    joinCode,
    setJoinCode,
    joinLoading,
    handleInvite,
    handleJoin,
  };
}
