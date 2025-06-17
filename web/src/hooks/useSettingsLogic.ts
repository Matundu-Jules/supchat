import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@store/store';
import { setTheme, setStatus, Theme, Status } from '@store/preferencesSlice';
import { updateUserProfile, logout } from '@store/authSlice';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  uploadAvatar,
  exportUserData,
} from '@services/userApi';
import {
  listIntegrations,
  linkGoogleDrive,
  unlinkGoogleDrive,
  linkGithub,
  unlinkGithub,
} from '@services/integrationApi';
import { logoutAll, deleteAccount, changePassword } from '@services/authApi';

export const useSettingsLogic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, status } = useSelector(
    (state: RootState) => state.preferences
  );
  const user = useSelector((state: RootState) => state.auth.user);
  // États locaux
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [integrations, setIntegrations] = useState({
    googleDrive: false,
    github: false,
  });

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger le profil utilisateur
        const profile = await getProfile();
        setName(profile.name);
        setAvatar(profile.avatar || '');
        setEmail(profile.email);
        dispatch(
          updateUserProfile({
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar,
          })
        );

        // Charger les préférences
        try {
          const serverPrefs = await getPreferences();
          const localTheme = localStorage.getItem('theme') as Theme;
          const localStatus = localStorage.getItem('status') as Status;

          if (localTheme && localTheme !== serverPrefs.theme) {
            dispatch(setTheme(localTheme));
            updatePreferences({ theme: localTheme, status: localStatus });
          } else if (serverPrefs.theme && serverPrefs.theme !== theme) {
            dispatch(setTheme(serverPrefs.theme));
            document.body.setAttribute('data-theme', serverPrefs.theme);
          }

          if (localStatus && localStatus !== serverPrefs.status) {
            dispatch(setStatus(localStatus));
            updatePreferences({ theme: localTheme, status: localStatus });
          } else if (serverPrefs.status && serverPrefs.status !== status) {
            dispatch(setStatus(serverPrefs.status));
          }
        } catch (error) {
          // Utilisation des préférences locales en cas d'erreur
        }

        // Charger les intégrations
        const integrationsData = await listIntegrations();
        setIntegrations(integrationsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [dispatch, theme, status]);

  // Gestion du profil
  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name });
      dispatch(updateUserProfile({ name }));

      if (avatarFile) {
        const { avatar: newUrl } = await uploadAvatar(avatarFile);
        setAvatar(newUrl);
        dispatch(updateUserProfile({ avatar: newUrl }));
        setAvatarFile(null);
      }
      setIsEditingProfile(false);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Erreur lors de la sauvegarde du profil',
      };
    }
  };

  const handleAvatarChange = async (file: File) => {
    setAvatarFile(file);
    try {
      const { avatar: newUrl } = await uploadAvatar(file);
      setAvatar(newUrl);
      dispatch(updateUserProfile({ avatar: newUrl }));
      setAvatarFile(null);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      return { success: false, error: "Erreur lors de l'upload de l'avatar" };
    }
  };

  // Gestion du thème
  const handleThemeToggle = async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      dispatch(setTheme(newTheme));
      await updatePreferences({ theme: newTheme });
      document.body.setAttribute('data-theme', newTheme);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
      return { success: false, error: 'Erreur lors du changement de thème' };
    }
  };

  // Gestion des intégrations
  const handleLinkDrive = async (code: string) => {
    try {
      await linkGoogleDrive(code);
      setIntegrations({ ...integrations, googleDrive: true });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la connexion Google Drive:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Erreur lors de la connexion Google Drive',
        isAuthError: error.response?.status === 401,
      };
    }
  };

  const handleUnlinkDrive = async () => {
    try {
      await unlinkGoogleDrive();
      setIntegrations({ ...integrations, googleDrive: false });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion Google Drive:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Erreur lors de la déconnexion Google Drive',
      };
    }
  };

  const handleLinkGithub = async (token: string) => {
    try {
      await linkGithub(token);
      setIntegrations({ ...integrations, github: true });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la connexion GitHub:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Erreur lors de la connexion GitHub',
        isAuthError: error.response?.status === 401,
      };
    }
  };

  const handleUnlinkGithub = async () => {
    try {
      await unlinkGithub();
      setIntegrations({ ...integrations, github: false });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion GitHub:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Erreur lors de la déconnexion GitHub',
      };
    }
  }; // Gestion de la sécurité
  const handleLogoutAll = async () => {
    try {
      await logoutAll();

      // Nettoyer le store Redux
      dispatch(logout());

      // Nettoyer tous les cookies (pour être sûr)
      document.cookie.split(';').forEach((c) => {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie =
          name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie =
          name +
          '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost';
        document.cookie =
          name +
          '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost';
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion globale:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Erreur lors de la déconnexion globale',
      };
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supchat-data.json';
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error: any) {
      console.error("Erreur lors de l'export:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de l'export des données",
      };
    }
  };
  const handleDeleteAccount = async () => {
    try {
      // Supprimer le compte
      await deleteAccount();

      // Nettoyer le store Redux
      dispatch(logout());

      // Nettoyer tous les cookies (pour être sûr)
      document.cookie.split(';').forEach((c) => {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie =
          name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie =
          name +
          '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost';
        document.cookie =
          name +
          '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost';
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Erreur lors de la suppression du compte',
      };
    }
  };

  // Changement de mot de passe
  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: 'Les mots de passe ne correspondent pas',
        };
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'Le mot de passe doit contenir au moins 8 caractères',
        };
      }
      const passwordData: { currentPassword?: string; newPassword: string } = {
        newPassword,
      };

      if (user?.hasPassword && currentPassword) {
        passwordData.currentPassword = currentPassword;
      }

      await changePassword(passwordData);

      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du changement de mot de passe',
      };
    }
  };

  const startEditingProfile = () => {
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    // Réinitialiser les champs du mot de passe
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // Réinitialiser les champs du profil aux valeurs originales
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  };

  return {
    // États
    user,
    theme,
    status,
    name,
    setName,
    email,
    setEmail,
    avatar,
    setAvatar,
    avatarFile,
    setAvatarFile,
    isEditingProfile,
    integrations,

    // Actions du profil
    handleSaveProfile,
    handleAvatarChange,
    startEditingProfile,
    cancelEditingProfile,

    // Actions du thème
    handleThemeToggle,

    // Actions des intégrations
    handleLinkDrive,
    handleUnlinkDrive,
    handleLinkGithub,
    handleUnlinkGithub,

    // Actions de sécurité
    handleLogoutAll,
    handleExport,
    handleDeleteAccount,

    // Action changement de mot de passe
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handleChangePassword,
  };
};
