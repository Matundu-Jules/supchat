const { faker } = require('@faker-js/faker')

const permissionFactory = (overrides = {}) => {
    let permissions

    // Si des permissions sont fournies en array (nouveau format), les utiliser
    if (overrides.permissions && Array.isArray(overrides.permissions)) {
        permissions = overrides.permissions
    } else {
        // Sinon, utiliser les permissions par défaut basées sur le rôle
        const role = overrides.role || 'membre'
        if (role === 'admin') {
            permissions = [
                'post',
                'view',
                'moderate',
                'manage_members',
                'manage_channels',
                'delete_messages',
                'upload_files',
                'react',
                'invite_members',
            ]
        } else if (role === 'membre') {
            permissions = ['post', 'view', 'upload_files', 'react']
        } else {
            permissions = ['post', 'view']
        }
    }

    return {
        userId: overrides.userId,
        workspaceId: overrides.workspaceId,
        resourceType: overrides.resourceType || 'workspace',
        resourceId: overrides.resourceId,
        role: overrides.role || 'membre',
        channelRoles: overrides.channelRoles || [],
        permissions: permissions,
        legacyPermissions: {
            canPost: true,
            canDeleteMessages: false,
            canManageMembers: false,
            canManageChannels: false,
            ...(overrides.legacyPermissions || {}),
        },
        ...overrides,
    }
}

module.exports = { permissionFactory }
