// Service pour gérer les interactions utilisateur dans les paramètres

export const settingsInteractionService = {
  // Prompts pour les intégrations
  promptGoogleDriveCode: (): string | null => {
    return prompt("Entrez le code d'autorisation Google OAuth:");
  },

  promptGithubToken: (): string | null => {
    return prompt("Entrez votre token d'accès GitHub:");
  },

  // Confirmations
  confirmAccountDeletion: (): boolean => {
    return confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ?\n\n' +
        'Cette action est IRRÉVERSIBLE et supprimera toutes vos données.'
    );
  },

  // Messages de succès
  showSuccess: (message: string) => {
    alert(`✅ ${message}`);
  },

  // Messages d'erreur
  showError: (message: string) => {
    alert(`❌ ${message}`);
  },

  // Messages spéciaux
  showAuthError: () => {
    alert("🔐 Erreur d'authentification. Veuillez vous reconnecter.");
  },

  // Messages spécifiques
  messages: {
    profile: {
      saveSuccess: 'Profil sauvegardé avec succès !',
      avatarUploadSuccess: 'Avatar mis à jour avec succès !',
    },
    integrations: {
      googleDriveConnected: 'Google Drive connecté avec succès !',
      googleDriveDisconnected: 'Google Drive déconnecté avec succès !',
      githubConnected: 'GitHub connecté avec succès !',
      githubDisconnected: 'GitHub déconnecté avec succès !',
    },
    security: {
      logoutAllSuccess: 'Déconnexion globale réussie !',
      exportSuccess: 'Données exportées avec succès !',
      accountDeleted: 'Compte supprimé avec succès.',
    },
    theme: {
      themeChanged: 'Thème changé avec succès !',
    },
  },
};
