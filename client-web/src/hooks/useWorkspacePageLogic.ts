import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@store/store';
import { useWorkspaces } from '@hooks/useWorkspaces';
import { updateWorkspace as updateWorkspaceApi } from '@services/workspaceApi';
import { deleteWorkspace as deleteWorkspaceApi } from '@services/workspaceApi';
import { requestJoinWorkspace } from '@store/workspacesSlice';

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

  const dispatch = useDispatch<AppDispatch>();

  const [showModal, setShowModal] = useState(false);
  const [inviteModal, setInviteModal] = useState<null | {
    id: string;
    name: string;
  }>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [requestJoinLoading, setRequestJoinLoading] = useState(false);
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
    setInviteError(null);
    setInviteSuccess(null);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModal) return;
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await handleInvite(inviteModal.id, inviteEmail);
      setInviteSuccess('Invitation envoyée avec succès !');
      setInviteEmail('');
    } catch (err: any) {
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
    }
  };
  // Nouvelle fonction pour gérer l'invitation via la modale
  const handleInviteModalSubmit = async (email: string) => {
    if (!inviteModal) return;

    setInviteError(null);
    setInviteSuccess(null);
    try {
      await handleInvite(inviteModal.id, email);
      setInviteSuccess('Invitation envoyée avec succès !');
      // Ne pas fermer la modale immédiatement pour laisser voir le message de succès
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (
        msg === 'USER_NOT_FOUND' ||
        msg.includes('utilisateur') ||
        msg.includes('aucun utilisateur inscrit') ||
        msg.toLowerCase().includes("n'existe")
      ) {
        // Stocker l'erreur dans l'état pour l'afficher dans la modale
        setInviteError(
          'Cette adresse email ne correspond à aucun utilisateur inscrit. Seuls les utilisateurs ayant un compte peuvent être invités.'
        );
      } else {
        setInviteError(msg || "Erreur lors de l'invitation");
      }
    }
  };

  const handleClearInviteMessages = () => {
    setInviteError(null);
    setInviteSuccess(null);
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

  // Version simplifiée pour les données de formulaire direct
  const handleEditWorkspace = async (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    if (!editModal) return;

    const errors: { name?: string; description?: string } = {};
    if (!formData.name) {
      errors.name = 'Le nom est requis.';
    } else if (formData.name.length < 3) {
      errors.name = 'Le nom doit contenir au moins 3 caractères.';
    }
    if (
      formData.description &&
      formData.description.length > 0 &&
      formData.description.length < 3
    ) {
      errors.description =
        'La description doit contenir au moins 3 caractères ou être vide.';
    }

    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      throw new Error('Données invalides');
    }

    await updateWorkspaceApi(editModal.id, formData);
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
  const handleRequestJoin = async (workspace: any) => {
    setRequestJoinLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await dispatch(
        requestJoinWorkspace({
          workspaceId: workspace._id,
          message: `Bonjour, je souhaiterais rejoindre votre workspace "${workspace.name}".`,
        })
      );

      // Notification de succès plus élégante
      setInviteSuccess(
        'Demande envoyée avec succès ! Le propriétaire du workspace recevra votre demande.'
      );
      fetchWorkspaces(); // Rafraîchir pour mettre à jour le statut
    } catch (err: any) {
      // Gestion d'erreur plus élégante
      setInviteError(err.message || "Erreur lors de l'envoi de la demande");
    } finally {
      setRequestJoinLoading(false);
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
    inviteError,
    setInviteError,
    inviteSuccess,
    setInviteSuccess,
    editModal,
    setEditModal,
    deleteLoading,
    handleAccess,
    handleInviteClick,
    handleInviteSubmit,
    handleEdit,
    handleEditSubmit,
    handleEditWorkspace,
    handleDelete,
    handleRequestJoin,
    editErrors,
    setEditErrors,
    requestJoinLoading,
    handleInviteModalSubmit,
    handleClearInviteMessages,
  };
}
