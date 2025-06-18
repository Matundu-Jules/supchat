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

// ✅ Récupérer toutes les permissions (accessible aux admins seulement)
exports.getPermissions = async (req, res) => {
    try {
        const { workspaceId } = req.query
        let isAdmin = false
        let isOwner = false

        // Vérifier si l'utilisateur est admin d'au moins un workspace
        if (req.user && req.user.role === 'admin') {
            isAdmin = true
        } else {
            // Vérifie la permission admin dans ce workspace
            if (workspaceId) {
                const perm = await Permission.findOne({
                    userId: req.user.id,
                    workspaceId,
                    role: 'admin',
                })
                if (perm) isAdmin = true

                // Vérifie si owner du workspace
                const workspace = await Workspace.findById(workspaceId)
                if (
                    workspace &&
                    String(workspace.owner) === String(req.user.id)
                ) {
                    isOwner = true
                }
            } else {
                // Admin global si admin sur n'importe quel workspace
                const perm = await Permission.findOne({
                    userId: req.user.id,
                    role: 'admin',
                })
                if (perm) isAdmin = true
            }
        }

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Accès refusé.' })
        }

        const query = workspaceId ? { workspaceId } : {}
        const permissions = await Permission.find(query)
            .populate('userId', 'username email')
            .populate('workspaceId', 'name')
        res.status(200).json(permissions)
    } catch (error) {
        console.error('Erreur dans getPermissions:', error)
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// Stub temporaire pour éviter l'erreur Express
exports.getPermissionById = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' })
}
exports.updatePermission = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' })
}
exports.deletePermission = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' })
}

module.exports = exports
