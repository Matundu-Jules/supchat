const channelService = require('../services/channelService')
const Notification = require('../models/Notification')
const { getIo } = require('../socket')
const User = require('../models/User')
const ChannelInvitation = require('../models/ChannelInvitation')
const Channel = require('../models/Channel')

// ✅ Créer un canal
exports.createChannel = async (req, res) => {
    try {
        const { name, workspaceId, description, type } = req.body

        if (!name || !workspaceId) {
            return res
                .status(400)
                .json({ message: 'Nom et ID du workspace requis' })
        }

        const newChannel = await channelService.create(
            { name, workspaceId, description, type },
            req.user
        )

        return res
            .status(201)
            .json({ message: 'Canal créé avec succès', channel: newChannel })
    } catch (error) {
        if (error.message === 'NOT_ALLOWED') {
            return res
                .status(403)
                .json({ message: 'Accès refusé. Droits insuffisants.' })
        }
        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.statusCode === 409) {
            return res.status(409).json({ message: error.message })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Récupérer tous les canaux d'un workspace
exports.getChannels = async (req, res) => {
    try {
        const { workspaceId, search } = req.query // Ajouter support de la recherche

        if (!workspaceId) {
            return res.status(400).json({ message: 'ID du workspace requis' })
        }

        const channels = await channelService.findByWorkspace(
            workspaceId,
            req.user,
            search || ''
        )
        return res.status(200).json({ channels })
    } catch (error) {
        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.message === 'NOT_ALLOWED') {
            return res
                .status(403)
                .json({ message: 'Accès refusé. Droits insuffisants.' })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Récupérer un canal par ID
exports.getChannelById = async (req, res) => {
    try {
        const { id } = req.params

        const channel = await channelService.findById(id)
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé' })
        } // Vérification d'accès selon le type de channel et le rôle de l'utilisateur
        const userId = String(req.user._id || req.user.id)
        const isMember = channel.members.some(
            (memberId) => String(memberId) === userId
        )

        // Pour les canaux privés, il faut être membre
        if (channel.type === 'private' && !isMember) {
            return res.status(403).json({
                message: 'Accès refusé. Non membre du canal privé.',
            })
        }

        // Pour les canaux publics, vérifier les permissions des invités
        if (channel.type === 'public') {
            const Permission = require('../models/Permission')
            const perm = await Permission.findOne({
                userId: req.user.id,
                workspaceId: channel.workspace,
            })

            // Si c'est un invité, il ne peut accéder aux canaux publics que s'il en est membre
            if (perm && perm.role === 'invité' && !isMember) {
                return res.status(403).json({
                    message:
                        "Accès refusé. Les invités ne peuvent accéder qu'aux canaux où ils sont membres.",
                })
            }
        }

        return res.status(200).json(channel)
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Modifier un canal
exports.updateChannel = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const channel = await channelService.update(
            id,
            { name, description },
            req.user
        )
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé' })
        }

        return res.status(200).json({ message: 'Canal mis à jour', channel })
    } catch (error) {
        if (error.message === 'NOT_ALLOWED') {
            return res
                .status(403)
                .json({ message: 'Accès refusé. Droits insuffisants.' })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Supprimer un canal
exports.deleteChannel = async (req, res) => {
    try {
        const { id } = req.params

        const deleted = await channelService.remove(id, req.user)
        if (!deleted) {
            return res.status(404).json({ message: 'Canal non trouvé' })
        }

        return res.status(200).json({ message: 'Canal supprimé' })
    } catch (error) {
        if (error.message === 'NOT_ALLOWED') {
            return res
                .status(403)
                .json({ message: 'Accès refusé. Droits insuffisants.' })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Inviter un utilisateur dans un canal
exports.inviteToChannel = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.body
        let channel
        try {
            // Trouver l'utilisateur par ID au lieu d'email
            const userToInvite = await User.findById(userId)
            if (!userToInvite) {
                return res.status(400).json({ message: 'USER_NOT_FOUND' })
            }

            channel = await channelService.invite(
                id,
                userToInvite.email,
                req.user
            )
        } catch (err) {
            if (err.message === 'NOT_ALLOWED') {
                return res
                    .status(403)
                    .json({ message: 'Accès refusé. Droits insuffisants.' })
            }
            if (err.message === 'NOT_FOUND') {
                return res.status(404).json({ message: 'Canal non trouvé' })
            }
            if (err.message === 'USER_NOT_FOUND') {
                return res.status(400).json({ message: 'USER_NOT_FOUND' })
            }
            if (err.message === 'ALREADY_MEMBER') {
                return res.status(400).json({ message: 'ALREADY_MEMBER' })
            }
            throw err
        }

        const invitedUser = await User.findById(userId)
        if (invitedUser) {
            const io = getIo()
            const notif = new Notification({
                type: 'channel_invite',
                userId: invitedUser._id,
                channelId: channel._id,
            })
            await notif.save()
            io.to(`user_${invitedUser._id}`).emit('notification', notif)
        }
        return res
            .status(200)
            .json({ message: `Invitation envoyée à l'utilisateur`, channel })
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Erreur lors de l'invitation", error })
    }
}

// Créer une invitation enrichie (ex-channelInvitationController)
exports.createInvitation = async (req, res) => {
    try {
        const { channelId, userId } = req.body
        const channel = await Channel.findById(channelId)
        if (!channel)
            return res.status(404).json({ message: 'Canal non trouvé' })
        const invitedUser = await User.findById(userId)
        if (!invitedUser)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        // Vérifier que l'utilisateur courant est membre/admin du canal
        const isMember = channel.members.some(
            (m) => m.toString() === req.user._id.toString()
        )
        if (
            !isMember &&
            channel.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: 'Seuls les membres/admins du canal peuvent inviter.',
            })
        }
        // Vérifier si déjà invité
        const existing = await ChannelInvitation.findOne({ channelId, userId })
        if (existing && existing.status === 'pending') {
            return res.status(400).json({ message: 'Déjà invité' })
        }
        const invitation = await ChannelInvitation.create({
            channelId,
            userId,
            email: invitedUser.email,
            status: 'pending',
            invitedBy: req.user._id,
            invitedAt: new Date(),
        })
        return res.status(201).json({ invitation })
    } catch (err) {
        return res
            .status(500)
            .json({ message: 'Erreur création invitation', error: err })
    }
}

// Récupérer toutes les invitations enrichies d'un canal (ex-channelInvitationController)
exports.getChannelInvitations = async (req, res) => {
    try {
        const { channelId } = req.params
        const invitations = await ChannelInvitation.find({ channelId })
            .populate('invitedBy', 'email username')
            .populate('userId', 'email username')
        // Ajouter le nom du canal pour l'UI
        const channel = await Channel.findById(channelId)
        const channelName = channel ? channel.name : ''
        const result = invitations.map((inv) => ({
            ...inv.toObject(),
            channelName,
        }))
        return res.status(200).json({ invitations: result })
    } catch (err) {
        return res
            .status(500)
            .json({ message: 'Erreur récupération invitations', error: err })
    }
}

// Accepter/refuser une invitation (ex-channelInvitationController)
exports.respondToInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params
        const { accept } = req.body
        const invitation = await ChannelInvitation.findById(invitationId)
        if (!invitation)
            return res.status(404).json({ message: 'Invitation non trouvée' })
        // Vérifier que seul le destinataire peut répondre
        if (invitation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message:
                    'Seul le destinataire peut répondre à cette invitation.',
            })
        }
        invitation.status = accept ? 'accepted' : 'declined'
        invitation.respondedAt = new Date()
        await invitation.save()
        return res.status(200).json({ invitation })
    } catch (err) {
        return res
            .status(500)
            .json({ message: 'Erreur réponse invitation', error: err })
    }
}

// ✅ Rejoindre un canal
exports.joinChannel = async (req, res) => {
    try {
        const { id } = req.params
        let channel
        try {
            channel = await channelService.join(id, req.user)
        } catch (err) {
            if (err.message === 'NOT_FOUND') {
                return res.status(404).json({ message: 'Canal non trouvé' })
            }
            if (err.message === 'ALREADY_MEMBER') {
                return res.status(400).json({ message: 'ALREADY_MEMBER' })
            }
            if (err.statusCode === 403) {
                return res.status(403).json({ message: err.message })
            }
            throw err
        }
        return res
            .status(200)
            .json({ message: 'Vous avez rejoint le canal', channel })
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Erreur lors de la jointure', error })
    }
}

// ✅ Quitter un canal
exports.leaveChannel = async (req, res) => {
    try {
        const { id } = req.params
        let channel
        try {
            channel = await channelService.leave(id, req.user)
        } catch (err) {
            if (err.message === 'NOT_FOUND') {
                return res.status(404).json({ message: 'Canal non trouvé' })
            }
            if (err.statusCode === 400) {
                return res.status(400).json({ message: err.message })
            }
            throw err
        }
        return res
            .status(200)
            .json({ message: 'Vous avez quitté le canal', channel })
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors du départ', error })
    }
}

// ✅ Obtenir les membres d'un canal
exports.getChannelMembers = async (req, res) => {
    try {
        const { id } = req.params // Utiliser id au lieu de channelId

        if (!id) {
            return res.status(400).json({ message: 'ID du canal requis' })
        }

        const members = await channelService.getChannelMembers(id, req.user)
        return res.status(200).json(members)
    } catch (error) {
        if (error.message === 'CHANNEL_NOT_FOUND') {
            return res.status(404).json({ message: 'Canal non trouvé' })
        }
        if (error.message === 'NOT_ALLOWED') {
            return res.status(403).json({ message: 'Accès refusé' })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Mettre à jour le rôle d'un membre dans un canal
exports.updateChannelMemberRole = async (req, res) => {
    try {
        const { id, userId } = req.params // Utiliser id au lieu de channelId
        const { role } = req.body

        if (!id || !userId || !role) {
            return res.status(400).json({
                message: "ID du canal, ID de l'utilisateur et rôle requis",
            })
        }

        const validRoles = ['admin', 'membre', 'invité']
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Rôle invalide. Utilisez: admin, membre, invité',
            })
        }

        const updatedPermission = await channelService.updateChannelMemberRole(
            id,
            userId,
            role,
            req.user
        )

        return res.status(200).json({
            message: 'Rôle mis à jour avec succès',
            permission: updatedPermission,
        })
    } catch (error) {
        if (error.message === 'CHANNEL_NOT_FOUND') {
            return res.status(404).json({ message: 'Canal non trouvé' })
        }
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }
        if (error.message === 'NOT_ALLOWED') {
            return res.status(403).json({ message: 'Accès refusé' })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Supprimer un membre d'un canal
exports.removeChannelMember = async (req, res) => {
    try {
        const { id, userId } = req.params // Utiliser id au lieu de channelId

        if (!id || !userId) {
            return res.status(400).json({
                message: "ID du canal et ID de l'utilisateur requis",
            })
        }

        const updatedChannel = await channelService.removeChannelMember(
            id,
            userId,
            req.user
        )

        return res.status(200).json({
            message: 'Membre supprimé avec succès',
            channel: updatedChannel,
        })
    } catch (error) {
        if (error.message === 'CHANNEL_NOT_FOUND') {
            return res.status(404).json({ message: 'Canal non trouvé' })
        }
        if (error.message === 'NOT_ALLOWED') {
            return res.status(403).json({ message: 'Accès refusé' })
        }
        if (error.message === 'CANNOT_REMOVE_OWNER') {
            return res.status(400).json({
                message: 'Impossible de supprimer le propriétaire du workspace',
            })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Ajouter un membre à un canal
exports.addChannelMember = async (req, res) => {
    try {
        const { id } = req.params // Utiliser id au lieu de channelId
        const { userId } = req.body

        if (!id || !userId) {
            return res.status(400).json({
                message: "ID du canal et ID de l'utilisateur requis",
            })
        }

        const updatedChannel = await channelService.addChannelMember(
            id,
            userId,
            req.user
        )

        return res.status(200).json({
            message: 'Membre ajouté avec succès',
            channel: updatedChannel,
        })
    } catch (error) {
        if (error.message === 'CHANNEL_NOT_FOUND') {
            return res.status(404).json({ message: 'Canal non trouvé' })
        }
        if (error.message === 'NOT_ALLOWED') {
            return res.status(403).json({ message: 'Accès refusé' })
        }
        if (error.message === 'USER_NOT_IN_WORKSPACE') {
            return res.status(400).json({
                message: "L'utilisateur n'est pas membre du workspace",
            })
        }
        if (error.message === 'USER_ALREADY_IN_CHANNEL') {
            return res.status(400).json({
                message: "L'utilisateur est déjà membre du canal",
            })
        }
        return res.status(500).json({ message: 'Erreur serveur', error })
    }
}
