const { faker } = require('@faker-js/faker')

const permissionFactory = (overrides = {}) => ({
    userId: overrides.userId,
    workspaceId: overrides.workspaceId,
    role: overrides.role || 'membre',
    channelRoles: overrides.channelRoles || [],
    permissions: {
        canPost: true,
        canDeleteMessages: false,
        canManageMembers: false,
        canManageChannels: false,
        ...(overrides.permissions || {}),
    },
    ...overrides,
})

module.exports = { permissionFactory }
