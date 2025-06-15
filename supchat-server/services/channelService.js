const Channel = require('../models/Channel')
const Permission = require('../models/Permission')
const Workspace = require('../models/Workspace')
const User = require('../models/User')
const {
    canCreateChannels,
    canAccessChannel,
} = require('./rolePermissionService')

const isAdminOrOwner = async (userId, workspaceId) => {
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    }
    if (String(workspace.owner) === String(userId)) {
        return true
    }
    const perm = await Permission.findOne({ userId, workspaceId })
    if (!perm) return false
    return perm.role === 'admin' || perm.permissions?.canManageChannels
}

const isChannelAdmin = async (userId, channel) => {
    const workspace = await Workspace.findById(channel.workspace)
    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    }
    if (String(workspace.owner) === String(userId)) {
        return true
    }
    const perm = await Permission.findOne({
        userId,
        workspaceId: workspace._id,
    })
    if (!perm) return false
    if (perm.role === 'admin' || perm.permissions?.canManageChannels)
        return true
    const chanRole = perm.channelRoles?.find(
        (c) => String(c.channelId) === String(channel._id)
    )
    return chanRole && chanRole.role === 'admin'
}

const create = async ({ name, workspaceId, description, type }, user) => {
    // Vérifier les permissions de création
    const perm = await Permission.findOne({ userId: user.id, workspaceId })
    if (!perm) {
        throw new Error('NOT_ALLOWED')
    }

    // Vérifier si l'utilisateur peut créer des channels
    const canCreate =
        canCreateChannels(perm.role, type) ||
        (await isAdminOrOwner(user.id, workspaceId))
    if (!canCreate) {
        throw new Error('NOT_ALLOWED')
    }

    const channel = new Channel({
        name,
        workspace: workspaceId,
        description: description || '',
        type,
        members: [user.id],
    })
    await channel.save()
    await Workspace.findByIdAndUpdate(workspaceId, {
        $addToSet: { channels: channel._id },
    })
    return channel
}

const findByWorkspace = async (workspaceId, user) => {
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    }

    const isOwner = String(workspace.owner) === String(user.id)
    const perm = await Permission.findOne({ userId: user.id, workspaceId })
    const isMember = workspace.members?.some(
        (m) => String(m._id || m) === String(user.id)
    )

    if (!isOwner && !perm && !isMember) {
        throw new Error('NOT_ALLOWED')
    }

    const allChannels = await Channel.find({ workspace: workspaceId })
    // Si c'est un invité, filtrer les channels selon ses permissions
    if (perm && perm.role === 'invité') {
        // Les invités ne voient que les channels où ils sont explicitement membres
        return allChannels.filter((channel) =>
            channel.members.some(
                (memberId) => String(memberId) === String(user.id)
            )
        )
    }

    // Admins et membres voient tous les channels
    return allChannels
}

const findById = (id) => {
    return Channel.findById(id)
}

const update = async (id, { name, description }, user) => {
    const channel = await Channel.findById(id)
    if (!channel) {
        return null
    }
    const allowed =
        (await isAdminOrOwner(user.id, channel.workspace)) ||
        (await isChannelAdmin(user.id, channel))
    if (!allowed) {
        throw new Error('NOT_ALLOWED')
    }
    if (name) {
        channel.name = name
    }
    if (description !== undefined) {
        channel.description = description
    }
    await channel.save()
    return channel
}

const remove = async (id, user) => {
    const channel = await Channel.findById(id)
    if (!channel) {
        return null
    }
    const allowed =
        (await isAdminOrOwner(user.id, channel.workspace)) ||
        (await isChannelAdmin(user.id, channel))
    if (!allowed) {
        throw new Error('NOT_ALLOWED')
    }
    await Workspace.findByIdAndUpdate(channel.workspace, {
        $pull: { channels: channel._id },
    })
    await Permission.updateMany(
        { workspaceId: channel.workspace },
        { $pull: { channelRoles: { channelId: channel._id } } }
    )
    return Channel.findByIdAndDelete(id)
}

const invite = async (channelId, email, user) => {
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new Error('NOT_FOUND')
    }
    const allowed =
        (await isAdminOrOwner(user.id, channel.workspace)) ||
        (await isChannelAdmin(user.id, channel))
    if (!allowed) {
        throw new Error('NOT_ALLOWED')
    }
    const invitedUser = await User.findOne({ email })
    if (!invitedUser) {
        throw new Error('USER_NOT_FOUND')
    }
    if (channel.members.some((m) => String(m) === String(invitedUser._id))) {
        throw new Error('ALREADY_MEMBER')
    }
    if (!channel.invitations.includes(email)) {
        channel.invitations.push(email)
        await channel.save()
    }
    return channel
}

const join = async (channelId, user) => {
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new Error('NOT_FOUND')
    }
    if (channel.members.some((m) => String(m) === String(user.id))) {
        throw new Error('ALREADY_MEMBER')
    }
    if (
        channel.type === 'private' &&
        !channel.invitations.includes(user.email)
    ) {
        throw new Error('INVALID_INVITE')
    }
    await Channel.findByIdAndUpdate(channelId, {
        $addToSet: { members: user.id },
        $pull: { invitations: user.email },
    })
    return Channel.findById(channelId)
}

const leave = async (channelId, user) => {
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new Error('NOT_FOUND')
    }
    await Channel.findByIdAndUpdate(channelId, {
        $pull: { members: user.id },
    })
    return Channel.findById(channelId)
}

// Obtenir les membres d'un canal avec leurs rôles
const getChannelMembers = async (channelId, user) => {
    const channel = await Channel.findById(channelId).populate('workspace')
    if (!channel) {
        throw new Error('CHANNEL_NOT_FOUND')
    }

    // Vérifier que l'utilisateur a accès au canal
    const hasAccess =
        (await isChannelAdmin(user.id, channel)) ||
        channel.members.includes(user.id)

    if (!hasAccess) {
        throw new Error('NOT_ALLOWED')
    }

    // Récupérer tous les membres avec leurs permissions
    const permissions = await Permission.find({
        userId: { $in: channel.members },
        workspaceId: channel.workspace._id,
    }).populate('userId', 'username email')

    const membersWithRoles = permissions.map((perm) => {
        const channelRole = perm.channelRoles.find(
            (cr) => String(cr.channelId) === String(channelId)
        )

        return {
            user: perm.userId,
            workspaceRole: perm.role,
            channelRole: channelRole ? channelRole.role : 'membre',
            permissions: perm.permissions,
        }
    })

    return membersWithRoles
}

// Changer le rôle d'un membre dans un canal
const updateChannelMemberRole = async (
    channelId,
    userId,
    newRole,
    adminUser
) => {
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new Error('CHANNEL_NOT_FOUND')
    }

    // Vérifier que l'admin a les droits
    const isAdmin = await isChannelAdmin(adminUser.id, channel)
    if (!isAdmin) {
        throw new Error('NOT_ALLOWED')
    }

    // Vérifier que l'utilisateur cible est membre du canal
    if (!channel.members.includes(userId)) {
        throw new Error('USER_NOT_IN_CHANNEL')
    }

    // Trouver ou créer la permission pour cet utilisateur
    let permission = await Permission.findOne({
        userId,
        workspaceId: channel.workspace,
    })

    if (!permission) {
        // Créer une nouvelle permission si elle n'existe pas
        permission = new Permission({
            userId,
            workspaceId: channel.workspace,
            role: 'membre',
            channelRoles: [],
        })
    }

    // Mettre à jour ou ajouter le rôle de canal
    const existingChannelRole = permission.channelRoles.find(
        (cr) => String(cr.channelId) === String(channelId)
    )

    if (existingChannelRole) {
        existingChannelRole.role = newRole
    } else {
        permission.channelRoles.push({
            channelId,
            role: newRole,
        })
    }

    await permission.save()
    return permission
}

// Supprimer un membre d'un canal
const removeChannelMember = async (channelId, userId, adminUser) => {
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new Error('CHANNEL_NOT_FOUND')
    }

    // Vérifier que l'admin a les droits
    const isAdmin = await isChannelAdmin(adminUser.id, channel)
    if (!isAdmin) {
        throw new Error('NOT_ALLOWED')
    }

    // Empêcher la suppression du propriétaire du workspace
    const workspace = await Workspace.findById(channel.workspace)
    if (String(workspace.owner) === String(userId)) {
        throw new Error('CANNOT_REMOVE_OWNER')
    }

    // Retirer l'utilisateur du canal
    channel.members = channel.members.filter(
        (memberId) => String(memberId) !== String(userId)
    )
    await channel.save()

    // Supprimer le rôle de canal de ses permissions
    const permission = await Permission.findOne({
        userId,
        workspaceId: channel.workspace,
    })

    if (permission) {
        permission.channelRoles = permission.channelRoles.filter(
            (cr) => String(cr.channelId) !== String(channelId)
        )
        await permission.save()
    }

    return channel
}

// Ajouter un membre à un canal
const addChannelMember = async (channelId, userId, adminUser) => {
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new Error('CHANNEL_NOT_FOUND')
    }

    // Vérifier que l'admin a les droits
    const isAdmin = await isChannelAdmin(adminUser.id, channel)
    if (!isAdmin) {
        throw new Error('NOT_ALLOWED')
    }

    // Vérifier que l'utilisateur est membre du workspace
    const workspace = await Workspace.findById(channel.workspace)
    if (!workspace.members.includes(userId)) {
        throw new Error('USER_NOT_IN_WORKSPACE')
    }

    // Vérifier que l'utilisateur n'est pas déjà membre du canal
    if (channel.members.includes(userId)) {
        throw new Error('USER_ALREADY_IN_CHANNEL')
    }

    // Ajouter l'utilisateur au canal
    channel.members.push(userId)
    await channel.save()

    return channel
}

module.exports = {
    create,
    findByWorkspace,
    findById,
    update,
    remove,
    invite,
    join,
    leave,
    getChannelMembers,
    updateChannelMemberRole,
    removeChannelMember,
    addChannelMember,
}
