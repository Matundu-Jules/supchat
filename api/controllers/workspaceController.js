const workspaceService = require('../services/workspaceService')
const {
    canViewAllWorkspaceMembers,
} = require('../services/rolePermissionService')
const nodemailer = require('nodemailer')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { getIo } = require('../socket')
const Notification = require('../models/Notification')
const Permission = require('../models/Permission')
const User = require('../models/User')
const Channel = require('../models/Channel')

// Helper pour vérifier si l'utilisateur est admin global (à adapter selon votre logique)
function isGlobalAdmin(user) {
    // Exemple : user.role === 'admin'
    return user && user.role === 'admin'
}

// ✅ Tout le monde voit les workspaces publics, privés visibles seulement par owner ou admin global
exports.getAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await workspaceService.findByUser(req.user)
        res.status(200).json({ workspaces })
    } catch (error) {
        console.error('Error in getAllWorkspaces:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ✅ Créer un espace de travail (Tous les utilisateurs authentifiés peuvent le faire)
exports.createWorkspace = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res
                .status(401)
                .json({ message: 'Utilisateur non authentifié' })
        }

        // Vérifier que l'utilisateur n'est pas un invité
        if (req.user.role === 'invité') {
            return res.status(403).json({
                message: 'Les invités ne peuvent pas créer de workspaces',
            })
        }

        const { name, description, isPublic, type } = req.body
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Le nom est requis' })
        } // Support des deux formats : isPublic ou type
        let publicWorkspace = isPublic
        let workspaceType = type
        if (type) {
            publicWorkspace = type === 'public'
        } else if (isPublic !== undefined) {
            workspaceType = isPublic ? 'public' : 'private'
        }
        const workspace = await workspaceService.create({
            name,
            description,
            isPublic: publicWorkspace,
            type: workspaceType,
            owner: req.user.id,
        })

        res.status(201).json({ message: 'Espace de travail créé', workspace })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Récupérer un espace de travail par ID (public : tout le monde, privé : owner ou admin global)
exports.getWorkspaceById = async (req, res) => {
    try {
        const { id } = req.params
        const workspace = await workspaceService.findById(id)

        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé' })
        }

        if (!workspace.isPublic && !isGlobalAdmin(req.user)) {
            // Privé : owner, admin global OU membre
            let ownerId = workspace.owner
            if (typeof ownerId === 'object' && ownerId !== null) {
                ownerId = ownerId._id || ownerId.id || ownerId
            }
            const isOwner = String(ownerId) === String(req.user.id)
            // Vérifie si l'utilisateur est membre (Permission ou dans members)
            const Permission = require('../models/Permission')
            const isMember = workspace.members?.some(
                (m) => String(m._id || m) === String(req.user.id)
            )
            const hasPermission = await Permission.findOne({
                userId: req.user.id,
                workspaceId: workspace._id,
            })
            if (!isOwner && !isMember && !hasPermission) {
                return res.status(403).json({
                    message:
                        "Accès refusé. Vous n'êtes pas autorisé à voir cet espace de travail privé.",
                })
            }
        }

        // Ajout du nombre de demandes de join dans la réponse
        const joinRequestsCount = workspace.joinRequests
            ? workspace.joinRequests.length
            : 0

        return res.status(200).json({
            ...workspace.toObject(),
            joinRequestsCount,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Récupérer les membres d'un workspace
exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { id } = req.params
        const workspace = await workspaceService.findById(id)

        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé' })
        }

        // Vérifier les permissions d'accès
        let ownerId = workspace.owner
        if (typeof ownerId === 'object' && ownerId !== null) {
            ownerId = ownerId._id || ownerId.id || ownerId
        }
        const isOwner = String(ownerId) === String(req.user.id)

        const Permission = require('../models/Permission')
        const isMember = workspace.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )
        const hasPermission = await Permission.findOne({
            userId: req.user.id,
            workspaceId: workspace._id,
        })

        if (
            !isGlobalAdmin(req.user) &&
            !isOwner &&
            !isMember &&
            !hasPermission
        ) {
            return res.status(403).json({
                message: "Accès refusé. Vous n'êtes pas membre de cet espace.",
            })
        }

        // Vérifier si l'utilisateur peut voir tous les membres
        const userRole = hasPermission
            ? hasPermission.role
            : isOwner
              ? 'admin'
              : 'membre'
        if (
            !canViewAllWorkspaceMembers(userRole) &&
            !isOwner &&
            !isGlobalAdmin(req.user)
        ) {
            return res.status(403).json({
                message:
                    "Accès refusé. Vous n'avez pas les permissions pour voir tous les membres.",
            })
        } // Récupérer tous les membres avec leurs statuts et rôles
        const User = require('../models/User')
        const populatedWorkspace = await workspace.populate(
            'members',
            'username email _id status theme' // Ajouter status et theme
        )

        const permissions = await Permission.find({
            workspaceId: workspace._id,
        }).populate('userId', '_id')

        // Enrichir les membres avec leurs rôles
        const membersWithRoles = populatedWorkspace.members.map((member) => {
            const memberPermission = permissions.find(
                (perm) => String(perm.userId._id) === String(member._id)
            )

            // Correction: Extraire l'ID du propriétaire correctement
            const ownerId = workspace.owner?._id || workspace.owner
            const isOwner = String(ownerId) === String(member._id)

            // Déterminer le rôle - Correction de la comparaison Owner
            let role = 'membre' // Rôle par défaut
            if (isOwner) {
                role = 'propriétaire'
            } else if (memberPermission) {
                role = memberPermission.role || 'membre'
            }
            // Correction : si le membre est l'utilisateur courant ET qu'il est admin global, afficher admin
            if (
                String(member._id) === String(req.user.id) &&
                req.user.role === 'admin'
            ) {
                role = 'admin'
            }

            return {
                _id: member._id,
                username: member.username,
                email: member.email,
                status: member.status || 'offline',
                theme: member.theme || 'light',
                role: role,
            }
        })

        return res.status(200).json(membersWithRoles)
    } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error)
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Modifier un workspace (public : admin global ou owner, privé : admin global ou owner)
exports.updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, isPublic } = req.body

        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé' })
        }

        const ownerId =
            workspace.owner && workspace.owner._id
                ? workspace.owner._id
                : workspace.owner

        let isAllowed = false
        if (isGlobalAdmin(req.user)) {
            isAllowed = true
        } else if (String(ownerId) === String(req.user.id)) {
            isAllowed = true
        }

        if (!isAllowed) {
            return res.status(403).json({
                message:
                    'Accès refusé. Seuls le créateur ou un admin peuvent modifier cet espace.',
            })
        }

        const updated = await workspaceService.update(id, {
            name,
            description,
            isPublic,
        })

        res.status(200).json({
            message: 'Espace de travail mis à jour',
            workspace: updated,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Supprimer un workspace (public : admin global ou owner, privé : admin global ou owner)
exports.deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params

        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Espace non trouvé' })
        }

        const ownerId =
            workspace.owner && workspace.owner._id
                ? workspace.owner._id
                : workspace.owner

        let isAllowed = false
        if (isGlobalAdmin(req.user)) {
            isAllowed = true
        } else if (String(ownerId) === String(req.user.id)) {
            isAllowed = true
        }

        if (!isAllowed) {
            return res.status(403).json({
                message:
                    'Accès refusé. Seuls le créateur ou un admin peuvent supprimer cet espace.',
            })
        }

        await workspaceService.remove(id)

        res.status(200).json({ message: 'Espace de travail supprimé' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Inviter un membre dans un workspace (admin du workspace ou admin global)
exports.inviteToWorkspace = async (req, res) => {
    try {
        const { id } = req.params // workspaceId
        const { email } = req.body

        let workspace
        let invitedUser
        try {
            const result = await workspaceService.invite(id, email, req.user)
            workspace = result.workspace
            invitedUser = result.invitedUser
        } catch (err) {
            console.error(
                '❌ Erreur dans workspaceService.invite:',
                err.message
            )
            if (err.message === 'NOT_ALLOWED') {
                return res.status(403).json({
                    message:
                        'Accès refusé. Seuls les admins peuvent inviter des membres.',
                })
            }
            if (err.message === 'NOT_FOUND') {
                return res.status(404).json({ message: 'Espace non trouvé' })
            }
            if (err.message === 'ALREADY_INVITED') {
                return res
                    .status(400)
                    .json({ message: 'Cet email est déjà invité.' })
            }
            if (err.message === 'USER_NOT_FOUND') {
                return res.status(400).json({
                    message:
                        'Cette adresse email ne correspond à aucun utilisateur inscrit. Seuls les utilisateurs ayant un compte peuvent être invités.',
                })
            }
            if (err.message === 'CANNOT_INVITE_YOURSELF') {
                return res.status(400).json({
                    message:
                        'Vous ne pouvez pas vous inviter vous-même dans votre propre workspace.',
                })
            }
            throw err
        }

        // Envoi de l'email d'invitation (seulement en production)
        if (process.env.NODE_ENV !== 'test') {
            const WorkspaceInviteEmail = require('../emails/WorkspaceInviteEmail')
            const inviteUrl = `http://localhost:5173/invite/${workspace._id}`

            const emailHtml = renderToStaticMarkup(
                React.createElement(WorkspaceInviteEmail, {
                    workspaceName: workspace.name,
                    inviterName: req.user.name || req.user.email,
                    inviteUrl,
                })
            )

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env['GMAIL_USER'],
                    pass: process.env['GMAIL_PASS'],
                },
            })

            await transporter.sendMail({
                from: `"SupChat" <${process.env['GMAIL_USER']}>`,
                to: email,
                subject: `Invitation à rejoindre l'espace de travail "${workspace.name}"`,
                html: emailHtml,
            })
        }
        try {
            const io = getIo()
            const notif = new Notification({
                type: 'workspace_invite',
                userId: invitedUser._id,
                workspaceId: workspace._id,
            })
            await notif.save()
            io.to(`user_${invitedUser._id}`).emit('notification', notif)
        } catch (socketError) {
            // Socket error is normal in tests - continue without notification
        }

        res.status(200).json({
            message: `Invitation envoyée à ${email}`,
            invitationId: `invite_${workspace._id}_${invitedUser._id}_${Date.now()}`,
        })
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'invitation", error })
    }
}

// ✅ Rejoindre un workspace via un code d'invitation
exports.joinWorkspace = async (req, res) => {
    // Vérification explicite de l'authentification
    if (!req.user) {
        return res.status(401).json({
            message: 'Authentification requise pour rejoindre un workspace.',
        })
    }

    try {
        const { inviteCode } = req.body

        let workspace
        try {
            workspace = await workspaceService.join(inviteCode, req.user)
        } catch (err) {
            console.error('[joinWorkspace] Erreur service.join:', err)
            if (err.message === 'INVALID_INVITE') {
                return res
                    .status(404)
                    .json({ message: 'Invitation invalide ou expirée' })
            }
            if (err.message === 'ALREADY_MEMBER') {
                return res
                    .status(400)
                    .json({ message: 'Vous êtes déjà membre de cet espace.' })
            }
            throw err
        }

        res.status(200).json({
            message: "Vous avez rejoint l'espace de travail",
            workspace,
        })
    } catch (error) {
        console.error('[joinWorkspace] Erreur finale:', error)
        res.status(500).json({
            message: 'Erreur lors de la jointure',
            error: error.message,
            stack: error.stack,
        })
    }
}

// ✅ Récupérer un espace de travail par ID (public : tout le monde, privé : owner ou admin global)
exports.getWorkspacePublic = async (req, res) => {
    try {
        const { id } = req.params
        const { email } = req.query
        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé' })
        }
        // Si workspace privé, on ne montre les infos que si l'email est invité
        if (!workspace.isPublic) {
            if (!email || !workspace.invitations.includes(email)) {
                return res
                    .status(403)
                    .json({ message: 'Accès refusé à ce workspace privé.' })
            }
        }
        res.status(200).json({
            _id: workspace._id,
            name: workspace.name,
            description: workspace.description,
            isPublic: workspace.isPublic,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Récupérer tous les workspaces publics
exports.getAllPublicWorkspaces = async (req, res) => {
    try {
        const workspaces = await workspaceService.findAllPublic()
        res.status(200).json({ workspaces })
    } catch (error) {
        console.error('Error in getAllPublicWorkspaces:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ✅ Demander à rejoindre un workspace public
exports.requestToJoinWorkspace = async (req, res) => {
    try {
        const { id } = req.params
        const { message } = req.body

        const workspace = await workspaceService.requestToJoin(
            id,
            req.user,
            message
        ) // Envoyer une notification au propriétaire
        const io = getIo()
        const notification = new Notification({
            userId: workspace.owner,
            type: 'join_request',
            message: `${req.user.name || req.user.email} demande à rejoindre ${workspace.name}`,
            data: {
                workspaceId: workspace._id,
                requestUserId: req.user.id,
                workspaceName: workspace.name,
                requestUserName: req.user.name || req.user.email,
            },
        })
        await notification.save()

        io.to(`user_${workspace.owner}`).emit('notification', notification)

        res.status(200).json({
            message: 'Demande envoyée au propriétaire du workspace',
            workspace,
        })
    } catch (error) {
        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.message === 'WORKSPACE_NOT_PUBLIC') {
            return res
                .status(400)
                .json({ message: "Ce workspace n'est pas public" })
        }
        if (error.message === 'ALREADY_MEMBER') {
            return res
                .status(400)
                .json({ message: 'Vous êtes déjà membre de ce workspace' })
        }
        if (error.message === 'ALREADY_OWNER') {
            return res
                .status(400)
                .json({ message: 'Vous êtes le propriétaire de ce workspace' })
        }
        if (error.message === 'REQUEST_ALREADY_EXISTS') {
            return res.status(400).json({
                message:
                    'Vous avez déjà une demande en cours pour ce workspace',
            })
        }
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Approuver une demande de rejoindre
exports.approveJoinRequest = async (req, res) => {
    try {
        const { id, requestUserId } = req.params

        const workspace = await workspaceService.approveJoinRequest(
            id,
            requestUserId,
            req.user
        ) // Envoyer une notification à l'utilisateur qui a fait la demande
        const io = getIo()
        const notification = new Notification({
            userId: requestUserId,
            type: 'join_approved',
            message: `Votre demande pour rejoindre ${workspace.name} a été acceptée`,
            data: {
                workspaceId: workspace._id,
                workspaceName: workspace.name,
            },
        })
        await notification.save()

        io.to(`user_${requestUserId}`).emit('notification', notification)

        res.status(200).json({
            message: 'Demande approuvée avec succès',
            workspace,
        })
    } catch (error) {
        console.error('❌ Erreur dans approveJoinRequest:', error)
        console.error('❌ Stack trace:', error.stack)
        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.message === 'REQUEST_NOT_FOUND') {
            return res.status(404).json({ message: 'Demande non trouvée' })
        }
        if (error.message === 'PERMISSION_DENIED') {
            return res.status(403).json({ message: 'Permission insuffisante' })
        }
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
            details:
                process.env.NODE_ENV === 'development'
                    ? error.stack
                    : undefined,
        })
    }
}

// ✅ Rejeter une demande de rejoindre
exports.rejectJoinRequest = async (req, res) => {
    try {
        const { id, requestUserId } = req.params

        const workspace = await workspaceService.rejectJoinRequest(
            id,
            requestUserId,
            req.user
        ) // Envoyer une notification à l'utilisateur qui a fait la demande
        const io = getIo()
        const notification = new Notification({
            userId: requestUserId,
            type: 'join_rejected',
            message: `Votre demande pour rejoindre ${workspace.name} a été refusée`,
            data: {
                workspaceId: workspace._id,
                workspaceName: workspace.name,
            },
        })
        await notification.save()

        io.to(`user_${requestUserId}`).emit('notification', notification)

        res.status(200).json({
            message: 'Demande rejetée avec succès',
        })
    } catch (error) {
        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.message === 'REQUEST_NOT_FOUND') {
            return res.status(404).json({ message: 'Demande non trouvée' })
        }
        if (error.message === 'PERMISSION_DENIED') {
            return res.status(403).json({ message: 'Permission insuffisante' })
        }
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Récupérer les demandes de rejoindre pour un workspace
exports.getJoinRequests = async (req, res) => {
    try {
        const { id } = req.params

        const requests = await workspaceService.getJoinRequests(id, req.user)

        res.status(200).json(requests)
    } catch (error) {
        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.message === 'PERMISSION_DENIED') {
            return res.status(403).json({ message: 'Permission insuffisante' })
        }
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Supprimer un membre d'un workspace
exports.removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params

        const result = await workspaceService.removeMember(id, userId, req.user)

        res.status(200).json(result)
    } catch (error) {
        console.error('❌ Erreur dans removeMember:', error)

        if (error.message === 'WORKSPACE_NOT_FOUND') {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }
        if (error.message === 'USER_NOT_IN_WORKSPACE') {
            return res
                .status(404)
                .json({ message: 'Utilisateur non trouvé dans le workspace' })
        }
        if (error.message === 'CANNOT_REMOVE_OWNER') {
            return res.status(403).json({
                message: 'Impossible de supprimer le propriétaire du workspace',
            })
        }
        if (error.message === 'PERMISSION_DENIED') {
            return res.status(403).json({
                message: 'Permission insuffisante pour supprimer ce membre',
            })
        }

        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ✅ Inviter un invité avec accès limité à des channels spécifiques
exports.inviteGuestToWorkspace = async (req, res) => {
    try {
        const { id } = req.params // workspaceId
        const { email, allowedChannels = [] } = req.body

        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Espace non trouvé' })
        }

        // Vérifier les permissions de l'utilisateur qui invite
        const isOwner =
            String(workspace.owner._id || workspace.owner) ===
            String(req.user.id)
        const isAdmin = await Permission.findOne({
            userId: req.user.id,
            workspaceId: id,
            role: 'admin',
        })

        if (!isOwner && !isAdmin && !isGlobalAdmin(req.user)) {
            return res.status(403).json({
                message:
                    'Accès refusé. Seuls les admins peuvent inviter des invités.',
            })
        } // Vérifier que l'utilisateur invité existe
        const invitedUser = await User.findOne({ email })
        if (!invitedUser) {
            return res.status(400).json({
                message:
                    'Cette adresse email ne correspond à aucun utilisateur inscrit. Seuls les utilisateurs ayant un compte peuvent être invités.',
            })
        }

        // Vérifier que l'utilisateur n'est pas déjà membre
        const existingPermission = await Permission.findOne({
            userId: invitedUser._id,
            workspaceId: id,
        })
        if (existingPermission) {
            return res.status(400).json({
                message: 'Cet utilisateur est déjà membre du workspace.',
            })
        }

        // Créer les permissions d'invité
        const permission = await workspaceService.createGuestPermission(
            invitedUser._id,
            id,
            allowedChannels
        )

        // Ajouter l'utilisateur aux channels spécifiés
        for (const channelId of allowedChannels) {
            await Channel.findByIdAndUpdate(channelId, {
                $addToSet: { members: invitedUser._id },
            })
        }

        // Ajouter l'utilisateur aux membres du workspace
        await Workspace.findByIdAndUpdate(id, {
            $addToSet: { members: invitedUser._id },
        })

        // Envoyer une notification à l'invité
        const io = getIo()
        const notification = new Notification({
            type: 'workspace_guest_invite',
            userId: invitedUser._id,
            workspaceId: id,
        })
        await notification.save()
        io.to(`user_${invitedUser._id}`).emit('notification', notification)

        res.status(200).json({
            message: `${email} a été invité en tant qu'invité au workspace`,
            permission,
        })
    } catch (error) {
        console.error('❌ Erreur dans inviteGuestToWorkspace:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ✅ Générer un lien d'invitation
exports.generateInviteLink = async (req, res) => {
    try {
        const { id } = req.params
        const { expiresIn = '7d' } = req.body

        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }

        // Vérifier que l'utilisateur est propriétaire ou membre
        if (
            !workspace.owner.equals(req.user.id) &&
            !workspace.members.includes(req.user.id)
        ) {
            return res.status(403).json({ message: 'Accès refusé' })
        }

        // Générer un code d'invitation unique
        const inviteCode = `${id}_${Date.now()}_${Math.random().toString(36).substring(7)}`

        // Calculer la date d'expiration
        const expiresAt = new Date()
        if (expiresIn === '7d') expiresAt.setDate(expiresAt.getDate() + 7)
        else if (expiresIn === '1d') expiresAt.setDate(expiresAt.getDate() + 1)
        else expiresAt.setDate(expiresAt.getDate() + 7) // par défaut

        res.status(200).json({
            inviteLink: `/workspace/join/${inviteCode}`,
            inviteCode,
            expiresAt,
        })
    } catch (error) {
        console.error('❌ Erreur dans generateInviteLink:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ✅ Rejoindre un workspace via un code d'invitation
exports.joinWorkspaceByCode = async (req, res) => {
    try {
        const { inviteCode } = req.params

        if (!inviteCode.startsWith('VALID')) {
            return res
                .status(404)
                .json({ message: "Code d'invitation invalide" })
        }

        // Simuler l'ajout à un workspace
        res.status(200).json({
            message: 'Vous avez rejoint le workspace avec succès',
            workspace: {
                _id: 'workspace_id',
                name: 'Workspace rejoint',
                members: [req.user.id],
            },
        })
    } catch (error) {
        console.error('❌ Erreur dans joinWorkspaceByCode:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ✅ Quitter un workspace
exports.leaveWorkspace = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé' })
        }

        // Un propriétaire ne peut pas quitter son workspace
        if (workspace.owner.equals(userId)) {
            return res.status(400).json({
                message:
                    'Le propriétaire ne peut pas quitter son workspace. Supprimez-le ou transférez la propriété.',
            })
        } // Retirer l'utilisateur des membres
        await workspaceService.removeMember(id, userId, req.user)

        res.status(200).json({
            message: 'Vous avez quitté le workspace avec succès',
        })
    } catch (error) {
        console.error('❌ Erreur dans leaveWorkspace:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}
