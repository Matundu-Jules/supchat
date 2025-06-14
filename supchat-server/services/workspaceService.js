const Workspace = require('../models/Workspace')
const Permission = require('../models/Permission')
const User = require('../models/User')

function isGlobalAdmin(user) {
    return user && user.role === 'admin'
}

const findByUser = async (user) => {
    if (isGlobalAdmin(user)) {
        return Workspace.find().populate('owner', 'username email')
    }

    const publicWorkspaces = await Workspace.find({ isPublic: true }).populate(
        'owner',
        'username email'
    )

    const permWorkspaceIds = await Permission.find({
        userId: user.id,
    }).distinct('workspaceId')

    const privateWorkspaces = await Workspace.find({
        isPublic: false,
        $or: [
            { owner: user.id },
            { _id: { $in: permWorkspaceIds } },
            { members: user.id },
        ],
    }).populate('owner', 'username email')

    const allWorkspaces = [...publicWorkspaces]
    for (const ws of privateWorkspaces) {
        if (!allWorkspaces.some((w) => w._id.equals(ws._id))) {
            allWorkspaces.push(ws)
        }
    }
    return allWorkspaces
}

const findById = (id) => {
    return Workspace.findById(id)
        .populate('owner', 'username email')
        .populate('members', 'username email')
}

const create = async ({ name, description, isPublic, owner }) => {
    const workspace = new Workspace({
        name,
        description,
        isPublic: typeof isPublic === 'boolean' ? isPublic : true,
        owner,
        members: [owner],
    })
    await workspace.save()
    await Permission.create({
        userId: owner,
        workspaceId: workspace._id,
        role: 'admin',
        permissions: {
            canPost: true,
            canDeleteMessages: true,
            canManageMembers: true,
            canManageChannels: true,
        },
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
    let isAdmin = false
    if (isGlobalAdmin(user)) {
        isAdmin = true
    } else {
        const perm = await Permission.findOne({
            userId: user.id,
            workspaceId,
            role: 'admin',
        })
        isAdmin = !!perm
    }
    if (!isAdmin) {
        throw new Error('NOT_ALLOWED')
    }

    // Vérifier que l'utilisateur existe
    const invitedUser = await User.findOne({ email })
    if (!invitedUser) {
        throw new Error('USER_NOT_FOUND')
    }

    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
        throw new Error('NOT_FOUND')
    }
    // On autorise la ré-invitation si l'utilisateur n'est pas encore membre
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
    return workspace
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
    }

    // Création Permission
    await Permission.create({
        userId: user.id,
        workspaceId: workspace._id,
        role: 'membre',
        permissions: {
            canPost: true,
            canDeleteMessages: false,
            canManageMembers: false,
            canManageChannels: false,
        },
    })

    // Ajout dans members (évite doublons)
    await Workspace.findByIdAndUpdate(workspace._id, {
        $addToSet: { members: user.id },
    })

    return workspace
}

module.exports = {
    findByUser,
    findById,
    create,
    update,
    remove,
    invite,
    join,
}
