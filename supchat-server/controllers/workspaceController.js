const workspaceService = require('../services/workspaceService')
const nodemailer = require('nodemailer')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

// Helper pour vérifier si l'utilisateur est admin global (à adapter selon votre logique)
function isGlobalAdmin(user) {
    console.log('user', user)

    // Exemple : user.role === 'admin'
    return user && user.role === 'admin'
}

// ✅ Tout le monde voit les workspaces publics, privés visibles seulement par owner ou admin global
exports.getAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await workspaceService.findByUser(req.user)
        res.status(200).json(workspaces)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
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

        const { name, description } = req.body
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Le nom est requis' })
        }

        const workspace = await workspaceService.create({
            name,
            description,
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
            // Privé : seul owner ou admin global
            if (String(workspace.owner) !== String(req.user.id)) {
                return res.status(403).json({
                    message:
                        "Accès refusé. Vous n'êtes pas autorisé à voir cet espace de travail privé.",
                })
            }
        }

        return res.status(200).json(workspace)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Modifier un workspace (public : admin global ou owner, privé : admin global ou owner)
exports.updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const workspace = await workspaceService.findById(id)
        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé' })
        }

        const ownerId = workspace.owner && workspace.owner._id ? workspace.owner._id : workspace.owner

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

        const updated = await workspaceService.update(id, { name, description })

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
        console.log('workspace', workspace)

        const ownerId = workspace.owner && workspace.owner._id ? workspace.owner._id : workspace.owner

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
        try {
            workspace = await workspaceService.invite(id, email, req.user)
        } catch (err) {
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
            throw err
        }

        // Envoi de l'email d'invitation
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

        res.status(200).json({ message: `Invitation envoyée à ${email}` })
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'invitation", error })
    }
}

// ✅ Rejoindre un workspace via un code d'invitation
exports.joinWorkspace = async (req, res) => {
    try {
        const { inviteCode } = req.body
        let workspace
        try {
            workspace = await workspaceService.join(inviteCode, req.user)
        } catch (err) {
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
        res.status(500).json({ message: 'Erreur lors de la jointure', error })
    }
}
