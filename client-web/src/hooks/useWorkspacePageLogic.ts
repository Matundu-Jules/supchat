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
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
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
    setEditModal({
      id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      isPublic: workspace.isPublic,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    const form = e.target as HTMLFormElement;
    const name = (
      form.elements.namedItem('name') as HTMLInputElement
    ).value.trim();
    const description = (
      form.elements.namedItem('description') as HTMLInputElement
    ).value.trim();
    const isPublic = (form.elements.namedItem('isPublic') as HTMLInputElement)
      .checked;

    const errors: { name?: string; description?: string } = {};
    if (!name) {
      errors.name = 'Le nom est requis.';
    } else if (name.length < 3) {
      errors.name = 'Le nom doit contenir au moins 3 caractères.';
    }
    if (description.length > 0 && description.length < 3) {
      errors.description =
        'La description doit contenir au moins 3 caractères ou être vide.';
    }
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await updateWorkspaceApi(editModal.id, { name, description, isPublic });
    setEditModal(null);
    setEditErrors({});
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
    editErrors,
    setEditErrors,
  };
}
