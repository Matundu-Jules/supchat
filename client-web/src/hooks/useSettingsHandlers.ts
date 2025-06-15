import { useNavigate } from 'react-router-dom';
import { useSettingsLogic } from './useSettingsLogic';
import { settingsInteractionService } from '@services/settingsInteractionService';

export const useSettingsHandlers = () => {
  const settingsLogic = useSettingsLogic();
  const navigate = useNavigate();

  // Handler pour la connexion Google Drive avec prompt
  const handleLinkDriveWithPrompt = async () => {
    const code = settingsInteractionService.promptGoogleDriveCode();
    if (code) {
      const result = await settingsLogic.handleLinkDrive(code);
      if (result.success) {
        settingsInteractionService.showSuccess(
          settingsInteractionService.messages.integrations.googleDriveConnected
        );
      } else if (result.isAuthError) {
        settingsInteractionService.showAuthError();
      } else {
        settingsInteractionService.showError(result.error || 'Erreur inconnue');
      }
    }
  };

  // Handler pour la déconnexion Google Drive
  const handleUnlinkDriveWithFeedback = async () => {
    const result = await settingsLogic.handleUnlinkDrive();
    if (result.success) {
      settingsInteractionService.showSuccess(
        settingsInteractionService.messages.integrations.googleDriveDisconnected
      );
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  };

  // Handler pour la connexion GitHub avec prompt
  const handleLinkGithubWithPrompt = async () => {
    const token = settingsInteractionService.promptGithubToken();
    if (token) {
      const result = await settingsLogic.handleLinkGithub(token);
      if (result.success) {
        settingsInteractionService.showSuccess(
          settingsInteractionService.messages.integrations.githubConnected
        );
      } else if (result.isAuthError) {
        settingsInteractionService.showAuthError();
      } else {
        settingsInteractionService.showError(result.error || 'Erreur inconnue');
      }
    }
  };

  // Handler pour la déconnexion GitHub
  const handleUnlinkGithubWithFeedback = async () => {
    const result = await settingsLogic.handleUnlinkGithub();
    if (result.success) {
      settingsInteractionService.showSuccess(
        settingsInteractionService.messages.integrations.githubDisconnected
      );
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  };

  // Handler pour la sauvegarde du profil
  const handleSaveProfileWithFeedback = async () => {
    const result = await settingsLogic.handleSaveProfile();
    if (result.success) {
      settingsInteractionService.showSuccess(
        settingsInteractionService.messages.profile.saveSuccess
      );
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  };

  // Handler pour l'upload d'avatar
  const handleAvatarChangeWithFeedback = async (file: File) => {
    const result = await settingsLogic.handleAvatarChange(file);
    if (result.success) {
      settingsInteractionService.showSuccess(
        settingsInteractionService.messages.profile.avatarUploadSuccess
      );
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  };
  // Handler pour le changement de thème
  const handleThemeToggleWithFeedback = async () => {
    const result = await settingsLogic.handleThemeToggle();
    // Pas d'alerte pour le changement de thème - changement silencieux
    if (!result.success && result.error) {
      settingsInteractionService.showError(result.error);
    }
  }; // Handler pour la déconnexion globale
  const handleLogoutAllWithFeedback = async () => {
    const result = await settingsLogic.handleLogoutAll();
    if (result.success) {
      // Rediriger immédiatement vers login, pas de message
      navigate('/login');
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  };

  // Handler pour l'export des données
  const handleExportWithFeedback = async () => {
    const result = await settingsLogic.handleExport();
    if (result.success) {
      settingsInteractionService.showSuccess(
        settingsInteractionService.messages.security.exportSuccess
      );
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  }; // Handler pour la suppression du compte avec confirmation
  const handleDeleteAccountWithConfirmation = async () => {
    if (settingsInteractionService.confirmAccountDeletion()) {
      const result = await settingsLogic.handleDeleteAccount();
      if (result.success) {
        settingsInteractionService.showSuccess(
          settingsInteractionService.messages.security.accountDeleted
        );
        navigate('/login');
      } else {
        settingsInteractionService.showError(result.error || 'Erreur inconnue');
      }
    }
  };

  // Handler pour le changement de mot de passe avec feedback
  const handleChangePasswordWithFeedback = async () => {
    const result = await settingsLogic.handleChangePassword();
    if (result.success) {
      settingsInteractionService.showSuccess(
        'Mot de passe modifié avec succès'
      );
    } else {
      settingsInteractionService.showError(result.error || 'Erreur inconnue');
    }
  };
  return {
    // États et données depuis settingsLogic
    ...settingsLogic,

    // Handlers avec interactions utilisateur
    handleLinkDriveWithPrompt,
    handleUnlinkDriveWithFeedback,
    handleLinkGithubWithPrompt,
    handleUnlinkGithubWithFeedback,
    handleSaveProfileWithFeedback,
    handleAvatarChangeWithFeedback,
    handleThemeToggleWithFeedback,
    handleLogoutAllWithFeedback,
    handleExportWithFeedback,
    handleDeleteAccountWithConfirmation,
    handleChangePasswordWithFeedback,
  };
};
