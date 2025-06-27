// Types et utilitaires pour la gestion des rôles et permissions des canaux

export type ChannelRole = 'admin' | 'member' | 'guest' | 'invité';

export interface ChannelPermissions {
  // Permissions de lecture
  canRead: boolean;

  // Permissions d'écriture
  canWrite: boolean;
  canSendFiles: boolean;
  canReact: boolean;

  // Permissions sur les messages
  canEditOwnMessages: boolean;
  canDeleteOwnMessages: boolean;
  canEditAnyMessage: boolean;
  canDeleteAnyMessage: boolean;
  canPinMessages: boolean;

  // Permissions de gestion
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;

  // Permissions de canal
  canEditChannel: boolean;
  canDeleteChannel: boolean;
  canArchiveChannel: boolean;

  // Permissions de modération
  canModerate: boolean;
  canManageBots: boolean;
  canManageIntegrations: boolean;

  // Permissions spéciales
  canSeeAllMembers: boolean;
  canAccessPublicChannels: boolean;
  canSearchChannels: boolean;
}

/**
 * Retourne les permissions par défaut pour un rôle donné
 */
export const getDefaultPermissions = (
  role: ChannelRole
): ChannelPermissions => {
  const basePermissions: ChannelPermissions = {
    canRead: false,
    canWrite: false,
    canSendFiles: false,
    canReact: false,
    canEditOwnMessages: false,
    canDeleteOwnMessages: false,
    canEditAnyMessage: false,
    canDeleteAnyMessage: false,
    canPinMessages: false,
    canManageMembers: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditChannel: false,
    canDeleteChannel: false,
    canArchiveChannel: false,
    canModerate: false,
    canManageBots: false,
    canManageIntegrations: false,
    canSeeAllMembers: false,
    canAccessPublicChannels: false,
    canSearchChannels: false,
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        // Permissions complètes pour l'admin
        canRead: true,
        canWrite: true,
        canSendFiles: true,
        canReact: true,
        canEditOwnMessages: true,
        canDeleteOwnMessages: true,
        canEditAnyMessage: true,
        canDeleteAnyMessage: true,
        canPinMessages: true,
        canManageMembers: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canChangeRoles: true,
        canEditChannel: true,
        canDeleteChannel: true,
        canArchiveChannel: true,
        canModerate: true,
        canManageBots: true,
        canManageIntegrations: true,
        canSeeAllMembers: true,
        canAccessPublicChannels: true,
        canSearchChannels: true,
      };

    case 'member':
      return {
        ...basePermissions,
        // Permissions de membre contributeur
        canRead: true,
        canWrite: true,
        canSendFiles: true,
        canReact: true,
        canEditOwnMessages: true,
        canDeleteOwnMessages: true,
        canAccessPublicChannels: true,
        canSearchChannels: true,
        // Ne peut PAS : gérer membres, modifier canal, modérer
      };
    case 'guest':
      return {
        ...basePermissions,
        // Permissions limitées pour l'invité
        canRead: true,
        // canWrite et canSendFiles requièrent autorisation explicite de l'admin
        canWrite: false, // Par défaut, les guests ne peuvent pas écrire
        canSendFiles: false, // Par défaut, les guests ne peuvent pas envoyer de fichiers
        canEditOwnMessages: true,
        canDeleteOwnMessages: true,
        // Ne peut PAS : accéder canaux publics, chercher, gérer, modérer
        canAccessPublicChannels: false,
        canSearchChannels: false,
      };
    case 'invité':
      return {
        ...basePermissions,
        // Permissions pour l'invité (invité par admin)
        canRead: true,
        canWrite: false, // Par défaut, les invités ne peuvent pas écrire
        canSendFiles: false, // Par défaut, les invités ne peuvent pas envoyer de fichiers
        canEditOwnMessages: true,
        canDeleteOwnMessages: true,
        // Ne peut PAS : accéder canaux publics, chercher, gérer, modérer
        canAccessPublicChannels: false,
        canSearchChannels: false,
      };

    default:
      return basePermissions;
  }
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = (
  userRole: ChannelRole,
  permission: keyof ChannelPermissions,
  customPermissions?: Partial<ChannelPermissions>
): boolean => {
  const defaultPerms = getDefaultPermissions(userRole);
  const finalPerms = { ...defaultPerms, ...customPermissions };
  return finalPerms[permission];
};

/**
 * Vérifie si un guest peut écrire (selon autorisation admin)
 */
export const canGuestWrite = (
  guestPermissions?: Partial<ChannelPermissions>
): boolean => {
  return guestPermissions?.canWrite === true;
};

/**
 * Vérifie si un guest peut envoyer des fichiers (selon autorisation admin)
 */
export const canGuestSendFiles = (
  guestPermissions?: Partial<ChannelPermissions>
): boolean => {
  return guestPermissions?.canSendFiles === true;
};

/**
 * Vérifie les permissions en tenant compte des autorisations spéciales pour les guests
 */
export const hasPermissionWithGuestOverride = (
  userRole: ChannelRole,
  permission: keyof ChannelPermissions,
  customPermissions?: Partial<ChannelPermissions>
): boolean => {
  // Pour les guests, vérifier les permissions personnalisées d'abord
  if (userRole === 'guest' && customPermissions) {
    if (permission === 'canWrite' && customPermissions.canWrite !== undefined) {
      return customPermissions.canWrite;
    }
    if (
      permission === 'canSendFiles' &&
      customPermissions.canSendFiles !== undefined
    ) {
      return customPermissions.canSendFiles;
    }
  }

  return hasPermission(userRole, permission, customPermissions);
};

/**
 * Retourne le label d'affichage pour un rôle
 */
export const getRoleLabel = (role: ChannelRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin de canal';
    case 'member':
      return 'Membre';
    case 'guest':
      return 'Invité';
    case 'invité':
      return 'Invité (par admin)';
    default:
      return 'Inconnu';
  }
};

/**
 * Retourne la description des permissions pour un rôle
 */
export const getRoleDescription = (role: ChannelRole): string => {
  switch (role) {
    case 'admin':
      return 'Peut renommer, archiver ou supprimer le canal. Inviter/exclure des membres, changer leurs rôles. Gérer toutes les permissions et modérer.';
    case 'member':
      return 'Peut lire tout le contenu, envoyer messages/fichiers/réactions. Modifie/supprime ses propres messages uniquement.';
    case 'guest':
      return "Peut lire les messages. L'écriture et l'envoi de fichiers dépendent des autorisations accordées par un admin.";
    case 'invité':
      return "Peut lire les messages. L'écriture et l'envoi de fichiers ne sont pas autorisés par défaut.";
    default:
      return '';
  }
};

/**
 * Retourne l'icône représentative d'un rôle
 */
export const getRoleIcon = (role: ChannelRole): string => {
  switch (role) {
    case 'admin':
      return '👑';
    case 'member':
      return '👤';
    case 'guest':
      return '🔒';
    case 'invité':
      return '🔑'; // Clé pour invité (invité par admin)
    default:
      return '❓';
  }
};

/**
 * Retourne la couleur CSS pour un rôle
 */
export const getRoleColor = (role: ChannelRole): string => {
  switch (role) {
    case 'admin':
      return 'var(--color-error)'; // Rouge pour admin
    case 'member':
      return 'var(--color-primary)'; // Bleu pour membre
    case 'guest':
      return 'var(--color-warning)'; // Orange pour invité
    case 'invité':
      return 'var(--color-info)'; // Vert pour invité (invité par admin)
    default:
      return 'var(--color-text-secondary)';
  }
};
