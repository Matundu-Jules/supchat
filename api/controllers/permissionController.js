const Permission = require('../models/Permission')
const Workspace = require('../models/Workspace')
const Channel = require('../models/Channel')
const User = require('../models/User')

// ✅ Créer une permission (nouvelle API compatible avec les tests)
exports.createPermission = async (req, res) => {
    try {
        const {
            userId,
            resourceType,
            resourceId,
            permissions,
            workspaceId,
            role,
            channelRoles,
        } = req.body

        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }

        // Déterminer la ressource appropriée
        let targetWorkspaceId = workspaceId
        let targetResourceId = resourceId

        if (resourceType === 'channel' && resourceId) {
            const channel = await Channel.findById(resourceId)
            if (!channel) {
                return res.status(404).json({ message: 'Channel non trouvé.' })
            }
            targetWorkspaceId = channel.workspace
            targetResourceId = resourceId
        } else if (resourceType === 'workspace' && resourceId) {
            const workspace = await Workspace.findById(resourceId)
            if (!workspace) {
                return res
                    .status(404)
                    .json({ message: 'Workspace non trouvé.' })
            }
            targetWorkspaceId = resourceId
        } else if (workspaceId) {
            const workspace = await Workspace.findById(workspaceId)
            if (!workspace) {
                return res
                    .status(404)
                    .json({ message: 'Workspace non trouvé.' })
            }
            targetWorkspaceId = workspaceId
        }

        // Vérifier si l'utilisateur actuel est admin du workspace
        const currentUserPermission = await Permission.findOne({
            userId: req.user.id,
            workspaceId: targetWorkspaceId,
            role: 'admin',
        })

        // Vérifier aussi si l'utilisateur est le propriétaire du workspace
        if (targetWorkspaceId) {
            const workspace = await Workspace.findById(targetWorkspaceId)
            const isOwner =
                workspace && String(workspace.owner) === String(req.user.id)

            if (
                !currentUserPermission &&
                !isOwner &&
                req.user.role !== 'admin'
            ) {
                return res.status(403).json({
                    message: 'Seuls les admins peuvent gérer les permissions.',
                })
            }
        }

        // Créer la permission
        const permission = new Permission({
            userId,
            workspaceId: targetWorkspaceId,
            resourceType: resourceType || 'workspace',
            resourceId: targetResourceId,
            role: role || 'membre',
            permissions: permissions || ['post', 'view'],
            channelRoles: channelRoles || [],
        })

        await permission.save()
        res.status(201).json({ message: 'Permission créée.', permission })
    } catch (error) {
        console.error('Erreur dans createPermission:', error)
        res.status(500).json({
            message: 'Erreur serveur.',
            error: error.message,
        })
    }
}

// ✅ Vérifier les permissions d'un utilisateur
exports.checkPermission = async (req, res) => {
    try {
        const { userId, resourceType, resourceId, permission } = req.query

        if (!userId || !resourceType || !permission) {
            return res.status(400).json({
                message:
                    'Paramètres manquants: userId, resourceType et permission sont requis.',
            })
        }

        // Chercher les permissions de l'utilisateur
        const userPermissions = await Permission.find({
            userId,
            $or: [
                { resourceType, resourceId },
                { resourceType: 'workspace', workspaceId: resourceId },
            ],
        })

        let hasPermission = false

        // Vérifier dans les permissions trouvées
        for (const perm of userPermissions) {
            if (perm.permissions && perm.permissions.includes(permission)) {
                hasPermission = true
                break
            }

            // Vérifier les rôles spéciaux
            if (perm.role === 'admin') {
                hasPermission = true
                break
            }
        }

        // Si c'est un channel, vérifier aussi les permissions du workspace parent
        if (!hasPermission && resourceType === 'channel' && resourceId) {
            const channel = await Channel.findById(resourceId)
            if (channel && channel.workspace) {
                const workspacePermissions = await Permission.find({
                    userId,
                    resourceType: 'workspace',
                    workspaceId: channel.workspace,
                })

                for (const perm of workspacePermissions) {
                    if (
                        perm.permissions &&
                        perm.permissions.includes(permission)
                    ) {
                        hasPermission = true
                        break
                    }
                    if (perm.role === 'admin') {
                        hasPermission = true
                        break
                    }
                }
            }
        }

        res.status(200).json({ hasPermission })
    } catch (error) {
        console.error('Erreur dans checkPermission:', error)
        res.status(500).json({
            message: 'Erreur serveur.',
            error: error.message,
        })
    }
}

// ✅ Assigner une permission à un utilisateur dans un workspace
exports.setPermission = async (req, res) => {
    try {
        const { userId, workspaceId, role, permissions, channelRoles } =
            req.body

        // Vérifier si le workspace existe
        const workspace = await Workspace.findById(workspaceId)
        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé.' })
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }

        // Vérifier si l'utilisateur actuel est admin du workspace
        const isAdmin = await Permission.findOne({
            userId: req.user.id,
            workspaceId,
            role: 'admin',
        })

        if (!isAdmin) {
            return res.status(403).json({
                message: 'Seuls les admins peuvent gérer les permissions.',
            })
        }

        // Créer ou mettre à jour la permission
        let permission = await Permission.findOne({ userId, workspaceId })
        if (permission) {
            permission.role = role
            permission.permissions = permissions
            if (channelRoles) permission.channelRoles = channelRoles
        } else {
            permission = new Permission({
                userId,
                workspaceId,
                role,
                permissions,
                channelRoles,
            })
        }

        await permission.save()
        res.status(201).json({ message: 'Permission assignée.', permission })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ✅ Récupérer toutes les permissions (accessible aux membres du workspace)
exports.getPermissions = async (req, res) => {
    try {
        const { workspaceId } = req.query

        if (!workspaceId) {
            return res.status(400).json({
                message:
                    'ID du workspace requis pour récupérer les permissions.',
            })
        }

        let isAuthorized = false

        // Vérifier si l'utilisateur est admin global
        if (req.user && req.user.role === 'admin') {
            isAuthorized = true
        } else {
            // Vérifier si l'utilisateur est propriétaire du workspace
            const workspace = await Workspace.findById(workspaceId)
            if (workspace && String(workspace.owner) === String(req.user.id)) {
                isAuthorized = true
            } else {
                // Essayer de s'assurer que l'utilisateur a une permission (si membre)
                const userPermission = await ensureUserPermission(
                    req.user.id,
                    workspaceId
                )
                if (userPermission) {
                    isAuthorized = true
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({
                message:
                    'Accès refusé. Vous devez être membre du workspace pour voir les permissions.',
            })
        }

        // Récupérer les permissions du workspace
        const permissions = await Permission.find({ workspaceId })
            .populate('userId', 'username email avatar')
            .populate('workspaceId', 'name description')
            .sort({ createdAt: -1 })

        res.status(200).json(permissions)
    } catch (error) {
        console.error('Erreur dans getPermissions:', error)
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération des permissions.',
            error: error.message,
        })
    }
}

// ✅ Fonction utilitaire pour s'assurer qu'un utilisateur a une permission dans un workspace
const ensureUserPermission = async (userId, workspaceId) => {
    try {
        // Vérifier si l'utilisateur a déjà une permission
        let permission = await Permission.findOne({ userId, workspaceId })
        if (permission) {
            return permission
        }

        // Vérifier si l'utilisateur est membre du workspace
        const workspace = await Workspace.findById(workspaceId)
        if (!workspace) {
            throw new Error('Workspace non trouvé')
        }

        // Si l'utilisateur est propriétaire, créer permission admin
        if (String(workspace.owner) === String(userId)) {
            permission = new Permission({
                userId,
                workspaceId,
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
            })
            await permission.save()
            return permission
        }

        // Si l'utilisateur est dans les membres, créer permission membre
        const isMember =
            workspace.members &&
            workspace.members.some(
                (memberId) => String(memberId) === String(userId)
            )
        if (isMember) {
            permission = new Permission({
                userId,
                workspaceId,
                role: 'membre',
                permissions: ['post', 'view', 'upload_files', 'react'],
            })
            await permission.save()
            return permission
        }

        return null
    } catch (error) {
        console.error('Erreur dans ensureUserPermission:', error)
        return null
    }
}

// Stub temporaire pour éviter l'erreur Express
exports.getPermissionById = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' })
}
exports.updatePermission = async (req, res) => {
    try {
        const { id } = req.params
        const { role, permissions, channelRoles } = req.body

        // Vérifier que la permission existe
        const permission = await Permission.findById(id).populate(
            'workspaceId',
            'owner'
        )
        if (!permission) {
            return res.status(404).json({ message: 'Permission non trouvée.' })
        }

        // Vérifier que l'utilisateur actuel a le droit de modifier cette permission
        const workspace = permission.workspaceId
        const isOwner =
            workspace && String(workspace.owner) === String(req.user.id)

        // Vérifier si l'utilisateur est admin du workspace
        const userPermission = await Permission.findOne({
            userId: req.user.id,
            workspaceId: workspace._id,
            role: { $in: ['admin', 'owner'] },
        })

        // Seuls les propriétaires, admins du workspace ou admins globaux peuvent modifier les permissions
        if (!isOwner && !userPermission && req.user.role !== 'admin') {
            return res.status(403).json({
                message:
                    'Seuls les propriétaires et admins peuvent modifier les permissions.',
            })
        }

        // Empêcher l'utilisateur de modifier ses propres permissions (sécurité)
        if (String(permission.userId) === String(req.user.id)) {
            return res.status(403).json({
                message: 'Vous ne pouvez pas modifier vos propres permissions.',
            })
        }

        // Préparer les mises à jour
        const updates = {}

        if (role !== undefined) {
            // Valider le rôle
            if (!['admin', 'membre', 'invité'].includes(role)) {
                return res.status(400).json({
                    message:
                        'Rôle invalide. Valeurs autorisées: admin, membre, invité',
                })
            }
            updates.role = role

            // Mettre à jour les permissions par défaut selon le rôle
            const {
                getDefaultPermissions,
            } = require('../services/rolePermissionService')
            updates.legacyPermissions = getDefaultPermissions(role)

            // Mettre à jour les permissions modernes selon le rôle
            switch (role) {
                case 'admin':
                    updates.permissions = [
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
                    break
                case 'membre':
                    updates.permissions = [
                        'post',
                        'view',
                        'upload_files',
                        'react',
                    ]
                    break
                case 'invité':
                    updates.permissions = ['view']
                    break
            }
        }

        if (permissions !== undefined) {
            updates.permissions = permissions
        }

        if (channelRoles !== undefined) {
            updates.channelRoles = channelRoles
        }

        // Mettre à jour la permission
        const updatedPermission = await Permission.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('userId', 'username email avatar')
            .populate('workspaceId', 'name description')

        res.status(200).json({
            message: 'Permission mise à jour avec succès.',
            permission: updatedPermission,
        })
    } catch (error) {
        console.error('Erreur dans updatePermission:', error)
        res.status(500).json({
            message: 'Erreur serveur lors de la mise à jour de la permission.',
            error: error.message,
        })
    }
}
exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params

        // Vérifier que la permission existe
        const permission = await Permission.findById(id).populate(
            'workspaceId',
            'owner'
        )
        if (!permission) {
            return res.status(404).json({ message: 'Permission non trouvée.' })
        }

        // Vérifier que l'utilisateur actuel a le droit de supprimer cette permission
        const workspace = permission.workspaceId
        const isOwner =
            workspace && String(workspace.owner) === String(req.user.id)

        // Vérifier si l'utilisateur est admin du workspace
        const userPermission = await Permission.findOne({
            userId: req.user.id,
            workspaceId: workspace._id,
            role: { $in: ['admin', 'owner'] },
        })

        // Seuls les propriétaires, admins du workspace ou admins globaux peuvent supprimer les permissions
        if (!isOwner && !userPermission && req.user.role !== 'admin') {
            return res.status(403).json({
                message:
                    'Seuls les propriétaires et admins peuvent supprimer les permissions.',
            })
        }

        // Empêcher l'utilisateur de supprimer ses propres permissions (sécurité)
        if (String(permission.userId) === String(req.user.id)) {
            return res.status(403).json({
                message:
                    'Vous ne pouvez pas supprimer vos propres permissions.',
            })
        }

        // Empêcher la suppression de la permission du propriétaire du workspace
        if (String(permission.userId) === String(workspace.owner)) {
            return res.status(403).json({
                message:
                    'Impossible de supprimer les permissions du propriétaire du workspace.',
            })
        }

        // Supprimer la permission
        await Permission.findByIdAndDelete(id)

        // Retirer l'utilisateur des membres du workspace s'il n'a plus de permissions
        const remainingPermissions = await Permission.find({
            userId: permission.userId,
            workspaceId: workspace._id,
        })

        if (remainingPermissions.length === 0) {
            await Workspace.findByIdAndUpdate(workspace._id, {
                $pull: { members: permission.userId },
            })
        }

        res.status(200).json({
            message: 'Permission supprimée avec succès.',
        })
    } catch (error) {
        console.error('Erreur dans deletePermission:', error)
        res.status(500).json({
            message: 'Erreur serveur lors de la suppression de la permission.',
            error: error.message,
        })
    }
}

module.exports = exports
