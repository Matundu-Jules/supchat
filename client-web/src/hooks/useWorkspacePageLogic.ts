import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaces } from '@hooks/useWorkspaces';
import { updateWorkspace as updateWorkspaceApi } from '@services/workspaceApi';
import { deleteWorkspace as deleteWorkspaceApi } from '@services/workspaceApi';

export function useWorkspacePageLogic() {
  const {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    handleCreateWorkspace,
    handleInvite,
    handleJoin,
  } = useWorkspaces();

  const [showModal, setShowModal] = useState(false);
  const [inviteModal, setInviteModal] = useState<null | {
    id: string;
    name: string;
  }>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [editModal, setEditModal] = useState<null | {
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
  }>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccess = (workspace: any) => {
    navigate(`/workspaces/${workspace._id}`);
  };

  const handleInviteClick = (workspace: any) => {
    setInviteModal({ id: workspace._id, name: workspace.name });
    setInviteEmail('');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModal) return;
    await handleInvite(inviteModal.id, inviteEmail);
    setInviteModal(null);
    setInviteEmail('');
  };

  const handleEdit = (workspace: any) => {
    setEditModal(workspace);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const description = (
      form.elements.namedItem('description') as HTMLInputElement
    ).value;
    const isPublic = (form.elements.namedItem('isPublic') as HTMLInputElement)
      .checked;

    await updateWorkspaceApi(editModal.id, { name, description, isPublic });
    setEditModal(null);
    fetchWorkspaces();
  };

  const handleDelete = async (workspace: any) => {
    if (
      !window.confirm('Voulez-vous vraiment supprimer cet espace de travail ?')
    )
      return;
    setDeleteLoading(true);
    try {
      await deleteWorkspaceApi(workspace._id);
      fetchWorkspaces();
    } catch (err: any) {
      alert(
        err.message || "Erreur lors de la suppression de l'espace de travail"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    handleCreateWorkspace,
    handleInvite,
    handleJoin,
    showModal,
    setShowModal,
    inviteModal,
    setInviteModal,
    inviteEmail,
    setInviteEmail,
    editModal,
    setEditModal,
    deleteLoading,
    handleAccess,
    handleInviteClick,
    handleInviteSubmit,
    handleEdit,
    handleEditSubmit,
    handleDelete,
  };
}
