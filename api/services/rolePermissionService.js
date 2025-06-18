/**
 * Service pour gérer les permissions par défaut selon les rôles
 * Basé sur le tableau des rôles fourni par l'utilisateur
 */

const PERMISSION_MAP = {
    canPost: 'post',
    canDeleteMessages: 'delete_messages',
    canManageMembers: 'manage_members',
    canManageChannels: 'manage_channels',
    canCreateChannels: 'manage_channels', // création = gestion
    canViewAllMembers: 'view',
    canViewPublicChannels: 'view',
    canUploadFiles: 'upload_files',
    canReact: 'react',
    canInviteMembers: 'invite_members',
}

const getDefaultPermissions = (role) => {
    const permissions = {
        admin: {
            canPost: true,
            canDeleteMessages: true,
            canManageMembers: true,
            canManageChannels: true,
            canCreateChannels: true,
            canViewAllMembers: true,
            canViewPublicChannels: true,
            canUploadFiles: true,
            canReact: true,
            canInviteMembers: true,
        },
        membre: {
            canPost: true,
            canDeleteMessages: false,
            canManageMembers: false,
            canManageChannels: false,
            canCreateChannels: true, // Les membres peuvent créer des channels privés
            canViewAllMembers: true,
            canViewPublicChannels: true,
            canUploadFiles: true,
            canReact: true,
            canInviteMembers: false,
        },
        invité: {
            canPost: true,
            canDeleteMessages: false,
            canManageMembers: false,
            canManageChannels: false,
            canCreateChannels: false, // Les invités ne peuvent pas créer de channels
            canViewAllMembers: false, // Les invités ne peuvent pas voir tous les membres
            canViewPublicChannels: false, // Les invités ne voient que les channels où ils sont invités
            canUploadFiles: true,
            canReact: true,
            canInviteMembers: false,
        },
    }
    const obj = permissions[role] || permissions.membre
    // Retourner uniquement les permissions activées, format [string], sans doublons
    return Array.from(
        new Set(
            Object.entries(obj)
                .filter(([_, v]) => v)
                .map(([k, _]) => PERMISSION_MAP[k])
                .filter(Boolean)
        )
    )
}

/**
 * Vérifie si un utilisateur peut accéder à un channel selon son rôle
 */
const canAccessChannel = (
    userRole,
    channelType,
    isChannelMember,
    hasChannelInvite = false
) => {
    // Admin peut accéder à tout
    if (userRole === 'admin') {
        return true
    }

    // Pour les channels publics
    if (channelType === 'public') {
        // Les membres peuvent accéder aux channels publics
        if (userRole === 'membre') {
            return true
        }
        // Les invités ne peuvent accéder aux channels publics que s'ils sont explicitement membres
        if (userRole === 'invité') {
            return isChannelMember
        }
    }

    // Pour les channels privés
    if (channelType === 'private') {
        // Il faut être membre du channel ou avoir une invitation
        return isChannelMember || hasChannelInvite
    }

    return false
}

/**
 * Vérifie si un utilisateur peut voir la liste complète des membres du workspace
 */
const canViewAllWorkspaceMembers = (userRole) => {
    return userRole === 'admin' || userRole === 'membre'
}

/**
 * Vérifie si un utilisateur peut créer des channels
 */
const canCreateChannels = (userRole, channelType = 'private') => {
    if (userRole === 'admin') {
        return true
    }

    if (userRole === 'membre') {
        // Les membres peuvent créer des channels publics et privés
        return channelType === 'private' || channelType === 'public'
    }

    // Les invités ne peuvent pas créer de channels
    return false
}

/**
 * Vérifie si un utilisateur peut gérer les membres d'un workspace
 */
const canManageWorkspaceMembers = (userRole, isOwner = false) => {
    return userRole === 'admin' || isOwner
}

/**
 * Vérifie si un utilisateur peut gérer les paramètres du workspace
 */
const canManageWorkspaceSettings = (userRole, isOwner = false) => {
    return userRole === 'admin' || isOwner
}

module.exports = {
    getDefaultPermissions,
    canAccessChannel,
    canViewAllWorkspaceMembers,
    canCreateChannels,
    canManageWorkspaceMembers,
    canManageWorkspaceSettings,
}
