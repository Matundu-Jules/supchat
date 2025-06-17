const Workspace = require('../models/Workspace')
const Permission = require('../models/Permission')
const User = require('../models/User')
const { getDefaultPermissions } = require('./rolePermissionService')

function isGlobalAdmin(user) {
    return user && user.role === 'admin'
}

const findByUser = async (user) => {
    const userId = user._id || user.id // Support pour les deux formats

    if (isGlobalAdmin(user)) {
        return Workspace.find().populate('owner', 'username email')
    }

    const publicWorkspaces = await Workspace.find({ isPublic: true }).populate(
        'owner',
        'username email'
    )

    const permWorkspaceIds = await Permission.find({
        userId: userId,
    }).distinct('workspaceId')

    const privateWorkspaces = await Workspace.find({
        isPublic: false,
        $or: [
            { owner: userId },
            { _id: { $in: permWorkspaceIds } },
            { members: userId },
        ],
    }).populate('owner', 'username email')

    // Nouveauté : workspaces où l'utilisateur est invité
    const invitedWorkspaces = await Workspace.find({
        invitations: { $in: [user.email] },
    }).populate('owner', 'username email')

    const allWorkspaces = [...publicWorkspaces]
    for (const ws of privateWorkspaces) {
        if (!allWorkspaces.some((w) => w._id.equals(ws._id))) {
            allWorkspaces.push(ws)
        }
    }
    for (const ws of invitedWorkspaces) {
        if (!allWorkspaces.some((w) => w._id.equals(ws._id))) {
            allWorkspaces.push(ws)
        }
    }

    // Ajouter des informations sur les demandes de rejoindre pour chaque workspace
    const workspacesWithRequestInfo = allWorkspaces.map((workspace) => {
        const workspaceObj = workspace.toObject()

        // Vérifier si l'utilisateur a fait une demande pour ce workspace
        const hasRequestedJoin =
            workspace.joinRequests &&
            workspace.joinRequests.some(
                (request) => String(request.userId) === String(userId)
            ) // Vérifier si l'utilisateur est membre
        const isMember =
            workspace.members &&
            workspace.members.some(
                (memberId) => String(memberId) === String(userId)
            )

        // Vérifier si l'utilisateur est propriétaire
        const isOwner = workspace.owner
            ? String(workspace.owner._id || workspace.owner) === String(userId)
            : false

        // Vérifier si l'utilisateur est invité
        const isInvited =
            workspace.invitations && workspace.invitations.includes(user.email)

        workspaceObj.userStatus = {
            isMember,
            isOwner,
            hasRequestedJoin,
            isInvited,
        }

        return workspaceObj
    })

    return workspacesWithRequestInfo
}

const findAllPublic = async () => {
    return Workspace.find({ isPublic: true }).populate(
        'owner',
        'username email'
    )
}

const findById = (id) => {
    return Workspace.findById(id)
        .populate('owner', 'username email')
        .populate('members', 'username email')
}

const create = async ({ name, description, isPublic, type, owner }) => {
    const workspace = new Workspace({
        name,
        description,
        isPublic: typeof isPublic === 'boolean' ? isPublic : true,
        type:
            type ||
            (isPublic !== undefined
                ? isPublic
                    ? 'public'
                    : 'private'
                : 'public'),
        owner,
        members: [owner],
    })
    await workspace.save()

    await Permission.create({
        userId: owner,
        workspaceId: workspace._id,
        role: 'admin',
        permissions: [
            'post',
            'view',
            'moderate',
            'manage_members',
            'manage_channels',
            'delete_messages',
            'upload_files',
            'react',
            'invite_members',
        ],
        legacyPermissions: getDefaultPermissions('admin'),
    })
    return workspace
}

const update = async (id, { name, description, isPublic }) => {
    const workspace = await Workspace.findById(id)
    if (!workspace) {
        return null
    }
    workspace.name = name || workspace.name
    workspace.description = description || workspace.description
    if (typeof isPublic === 'boolean') {
        workspace.isPublic = isPublic
    }
    await workspace.save()
    return workspace
}

const remove = async (id) => {
    await Workspace.findByIdAndDelete(id)
    await Permission.deleteMany({ workspaceId: id })
}

const invite = async (workspaceId, email, user) => {
    console.log('🔍 workspaceService.invite - Paramètres:', {
        workspaceId,
        email,
        userId: user?.id,
        userRole: user?.role,
    })

    // Récupérer le workspace
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        throw new Error('NOT_FOUND')
    }

    let isAdmin = false
    // Vérifier si l'utilisateur est le propriétaire
    const isOwner = String(workspace.owner) === String(user.id)

    if (isOwner) {
        console.log('✅ Utilisateur est propriétaire du workspace')
        isAdmin = true
    } else if (isGlobalAdmin(user)) {
        console.log('✅ Utilisateur est admin global')
        isAdmin = true
    } else {
        console.log('🔍 Vérification des permissions workspace...')
        const perm = await Permission.findOne({
            userId: user.id,
            workspaceId,
            role: 'admin',
        })
        console.log('🔍 Permission trouvée:', perm)
        isAdmin = !!perm
    }

    console.log('🔍 isAdmin:', isAdmin)
    if (!isAdmin) {
        console.log('❌ Accès refusé - utilisateur pas admin')
        throw new Error('NOT_ALLOWED')
    } // Vérifier que l'utilisateur existe ou gérer l'invitation par email
    let invitedUser = await User.findOne({ email })
    if (!invitedUser) {
        // En production, on doit rejeter les invitations d'emails non existants
        console.log("❌ Invitation d'un email non existant:", email)
        throw new Error('USER_NOT_FOUND')
    } else {
        // Vérifier que l'utilisateur ne s'invite pas lui-même
        if (String(invitedUser._id) === String(user.id)) {
            console.log("❌ Tentative d'auto-invitation détectée")
            throw new Error('CANNOT_INVITE_YOURSELF')
        }
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const alreadyMember = await Permission.findOne({
        userId: invitedUser._id,
        workspaceId,
    })
    if (alreadyMember) {
        throw new Error('ALREADY_MEMBER')
    }

    // On retire l'unicité sur invitations : on peut ré-inviter si pas encore membre
    if (!workspace.invitations.includes(email)) {
        workspace.invitations.push(email)
        await workspace.save()
    }
    return { workspace, invitedUser }
}

const join = async (inviteCode, user) => {
    const workspace = await Workspace.findById(inviteCode)
    if (!workspace) {
        throw new Error('INVALID_INVITE')
    }

    // Sécurité supplémentaire : si workspace privé, il faut que l'email soit dans la liste d'invités
    if (!workspace.isPublic && !workspace.invitations.includes(user.email)) {
        throw new Error('INVALID_INVITE')
    }

    // Vérifie s'il est déjà membre (Permission)
    const alreadyMember = await Permission.findOne({
        userId: user.id,
        workspaceId: workspace._id,
    })
    if (alreadyMember) {
        throw new Error('ALREADY_MEMBER')
    } // Création Permission
    await Permission.create({
        userId: user.id,
        workspaceId: workspace._id,
        role: 'membre',
        permissions: getDefaultPermissions('membre'),
    })

    // Ajout dans members (évite doublons) et suppression de l'invitation
    await Workspace.findByIdAndUpdate(workspace._id, {
        $addToSet: { members: user.id },
        $pull: { invitations: user.email },
    })

    const updatedWorkspace = await Workspace.findById(workspace._id)
    await updatedWorkspace.save()
    return updatedWorkspace
}

const requestToJoin = async (workspaceId, user, message = '') => {
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    }

    // Vérifier que le workspace est public
    if (!workspace.isPublic) {
        throw new Error('WORKSPACE_NOT_PUBLIC')
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const isMember = workspace.members.some(
        (memberId) => String(memberId) === String(user.id)
    )
    if (isMember) {
        throw new Error('ALREADY_MEMBER')
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire
    if (String(workspace.owner) === String(user.id)) {
        throw new Error('ALREADY_OWNER')
    }

    // Vérifier qu'il n'y a pas déjà une demande en cours
    const existingRequest = workspace.joinRequests.find(
        (request) => String(request.userId) === String(user.id)
    )
    if (existingRequest) {
        throw new Error('REQUEST_ALREADY_EXISTS')
    }

    // Ajouter la demande
    workspace.joinRequests.push({
        userId: user.id,
        message: message,
        requestedAt: new Date(),
    })

    await workspace.save()
    return workspace
}

const approveJoinRequest = async (
    workspaceId,
    requestUserId,
    approvingUser
) => {
    console.log('🔍 Service approveJoinRequest - Paramètres:', {
        workspaceId,
        requestUserId,
        approvingUserId: approvingUser?.id,
    })

    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        console.error('❌ Workspace non trouvé:', workspaceId)
        throw new Error('WORKSPACE_NOT_FOUND')
    }

    console.log('✅ Workspace trouvé:', workspace.name)
    console.log('🔍 Demandes actuelles:', workspace.joinRequests?.length || 0)

    // Vérifier que l'utilisateur qui approuve est le propriétaire ou admin
    const isOwner = String(workspace.owner) === String(approvingUser.id)
    const isAdmin = await Permission.findOne({
        userId: approvingUser.id,
        workspaceId: workspace._id,
        role: 'admin',
    })

    if (!isOwner && !isAdmin && !isGlobalAdmin(approvingUser)) {
        throw new Error('PERMISSION_DENIED')
    } // Trouver la demande
    const requestIndex = workspace.joinRequests.findIndex(
        (request) => String(request.userId) === String(requestUserId)
    )
    console.log('🔍 Index de la demande trouvée:', requestIndex)
    console.log(
        '🔍 Demandes disponibles:',
        workspace.joinRequests.map((r) => ({ userId: r.userId, requestUserId }))
    )

    if (requestIndex === -1) {
        console.error(
            "❌ Demande non trouvée pour l'utilisateur:",
            requestUserId
        )
        throw new Error('REQUEST_NOT_FOUND')
    } // Supprimer la demande
    workspace.joinRequests.splice(requestIndex, 1)

    // Vérifier si l'utilisateur n'est pas déjà membre pour éviter les doublons
    const isMember = workspace.members.some(
        (memberId) => String(memberId) === String(requestUserId)
    )

    if (!isMember) {
        // Ajouter l'utilisateur comme membre
        workspace.members.push(requestUserId)
    }

    // Vérifier si l'utilisateur n'a pas déjà une permission pour éviter les erreurs de doublon
    const existingPermission = await Permission.findOne({
        userId: requestUserId,
        workspaceId: workspace._id,
    })

    if (!existingPermission) {
        // Créer les permissions
        await Permission.create({
            userId: requestUserId,
            workspaceId: workspace._id,
            role: 'membre',
            permissions: getDefaultPermissions('membre'),
        })
    }

    await workspace.save()
    return workspace
}

const rejectJoinRequest = async (workspaceId, requestUserId, rejectingUser) => {
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    }

    // Vérifier que l'utilisateur qui rejette est le propriétaire ou admin
    const isOwner = String(workspace.owner) === String(rejectingUser.id)
    const isAdmin = await Permission.findOne({
        userId: rejectingUser.id,
        workspaceId: workspace._id,
        role: 'admin',
    })

    if (!isOwner && !isAdmin && !isGlobalAdmin(rejectingUser)) {
        throw new Error('PERMISSION_DENIED')
    }

    // Trouver et supprimer la demande
    const requestIndex = workspace.joinRequests.findIndex(
        (request) => String(request.userId) === String(requestUserId)
    )
    if (requestIndex === -1) {
        throw new Error('REQUEST_NOT_FOUND')
    }

    workspace.joinRequests.splice(requestIndex, 1)
    await workspace.save()
    return workspace
}

const getJoinRequests = async (workspaceId, user) => {
    const workspace = await Workspace.findById(workspaceId).populate(
        'joinRequests.userId',
        'name email avatar'
    )

    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    const isOwner = String(workspace.owner) === String(user.id)
    const isAdmin = await Permission.findOne({
        userId: user.id,
        workspaceId: workspace._id,
        role: 'admin',
    })

    if (!isOwner && !isAdmin && !isGlobalAdmin(user)) {
        throw new Error('PERMISSION_DENIED')
    }

    return workspace.joinRequests
}

const removeMember = async (workspaceId, targetUserId, requestingUser) => {
    console.log("🗑️ Suppression d'un membre du workspace:", {
        workspaceId,
        targetUserId,
        requestingUserId: requestingUser.id,
    })

    const workspace = await Workspace.findById(workspaceId).populate(
        'members',
        'username email'
    )

    if (!workspace) {
        throw new Error('WORKSPACE_NOT_FOUND')
    } // Vérifier que l'utilisateur demandeur est propriétaire, admin, ou se retire lui-même
    const isOwner = String(workspace.owner) === String(requestingUser.id)
    const isAdmin = await Permission.findOne({
        userId: requestingUser.id,
        workspaceId: workspace._id,
        role: 'admin',
    })
    const isSelf = String(requestingUser.id) === String(targetUserId)

    if (!isOwner && !isAdmin && !isGlobalAdmin(requestingUser) && !isSelf) {
        console.log('❌ Permission refusée pour supprimer un membre')
        throw new Error('PERMISSION_DENIED')
    }

    // Vérifier que l'utilisateur cible existe dans le workspace
    const targetUserExists = workspace.members.some(
        (member) => String(member._id) === String(targetUserId)
    )

    if (!targetUserExists) {
        console.log('❌ Utilisateur non trouvé dans le workspace')
        throw new Error('USER_NOT_IN_WORKSPACE')
    }

    // Empêcher la suppression du propriétaire
    if (String(workspace.owner) === String(targetUserId)) {
        console.log('❌ Impossible de supprimer le propriétaire du workspace')
        throw new Error('CANNOT_REMOVE_OWNER')
    }

    // Supprimer l'utilisateur des membres
    workspace.members = workspace.members.filter(
        (member) => String(member._id) !== String(targetUserId)
    )

    await workspace.save()

    // Supprimer toutes les permissions de l'utilisateur pour ce workspace
    await Permission.deleteMany({
        userId: targetUserId,
        workspaceId: workspace._id,
    })

    console.log('✅ Membre supprimé avec succès du workspace')

    return {
        message: 'Membre supprimé avec succès',
        workspace: await Workspace.findById(workspaceId)
            .populate('members', 'username email')
            .populate('owner', 'username email'),
    }
}

/**
 * Créer une permission pour un invité dans un workspace
 * Les invités ont des permissions limitées et accès seulement aux channels spécifiés
 */
const createGuestPermission = async (
    userId,
    workspaceId,
    allowedChannels = []
) => {
    // Supprimer l'ancienne permission si elle existe
    await Permission.findOneAndDelete({ userId, workspaceId })

    // Créer les rôles de channels pour les channels autorisés
    const channelRoles = allowedChannels.map((channelId) => ({
        channelId,
        role: 'invité',
    }))

    const permission = await Permission.create({
        userId,
        workspaceId,
        role: 'invité',
        channelRoles,
        permissions: getDefaultPermissions('invité'),
    })

    return permission
}

module.exports = {
    findByUser,
    findAllPublic,
    findById,
    create,
    update,
    remove,
    invite,
    join,
    requestToJoin,
    approveJoinRequest,
    rejectJoinRequest,
    getJoinRequests,
    removeMember,
    createGuestPermission,
}
