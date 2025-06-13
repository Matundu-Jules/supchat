const Workspace = require('../models/Workspace')
const Permission = require('../models/Permission')
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
        const userId = req.user.id

        if (isGlobalAdmin(req.user)) {
            // Admin global : accès à tous les workspaces
            const allWorkspaces = await Workspace.find()
            return res.status(200).json(allWorkspaces)
        }

        // Workspaces publics (tout le monde peut voir)
        const publicWorkspaces = await Workspace.find({ isPublic: true })

        // Workspaces privés où l'utilisateur est owner
        const privateWorkspaces = await Workspace.find({
            isPublic: false,
            owner: userId,
        })

        // Fusionner et supprimer les doublons (normalement pas de doublons ici)
        const allWorkspaces = [
            ...publicWorkspaces,
            ...privateWorkspaces.filter(
                (ws) => !publicWorkspaces.some((pub) => pub._id.equals(ws._id))
            ),
        ]

        res.status(200).json(allWorkspaces)
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

        const workspace = new Workspace({
            name,
            description,
            owner: req.user.id,
            members: [req.user.id],
        })
        await workspace.save()

        // Assigner l'utilisateur comme admin du workspace
        await Permission.create({
            userId: req.user.id,
            workspaceId: workspace._id,
            role: 'admin',
            permissions: {
                canPost: true,
                canDeleteMessages: true,
                canManageMembers: true,
                canManageChannels: true,
            },
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
        const workspace = await Workspace.findById(id).populate(
            'owner',
            'username email'
        )

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

        // Vérifier si le workspace existe
        const workspace = await Workspace.findById(id)
        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Espace de travail non trouvé' })
        }

        let isAllowed = false
        if (isGlobalAdmin(req.user)) {
            isAllowed = true
        } else if (String(workspace.owner) === String(req.user.id)) {
            isAllowed = true
        }

        if (!isAllowed) {
            return res.status(403).json({
                message:
                    'Accès refusé. Seuls le créateur ou un admin peuvent modifier cet espace.',
            })
        }

        workspace.name = name || workspace.name
        workspace.description = description || workspace.description
        await workspace.save()

        res.status(200).json({
            message: 'Espace de travail mis à jour',
            workspace,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ✅ Supprimer un workspace (public : admin global ou owner, privé : admin global ou owner)
exports.deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params

        // Vérifier si le workspace existe
        const workspace = await Workspace.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Espace non trouvé' })
        }
        console.log('workspace', workspace)

        let isAllowed = false
        if (isGlobalAdmin(req.user)) {
            isAllowed = true
        } else if (String(workspace.owner) === String(req.user.id)) {
            isAllowed = true
        }

        if (!isAllowed) {
            return res.status(403).json({
                message:
                    'Accès refusé. Seuls le créateur ou un admin peuvent supprimer cet espace.',
            })
        }

        await Workspace.findByIdAndDelete(id)
        await Permission.deleteMany({ workspaceId: id })

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

        let isAdmin = false
        if (isGlobalAdmin(req.user)) {
            isAdmin = true
        } else {
            isAdmin = await Permission.findOne({
                userId: req.user.id,
                workspaceId: id,
                role: 'admin',
            })
        }

        if (!isAdmin) {
            return res.status(403).json({
                message:
                    'Accès refusé. Seuls les admins peuvent inviter des membres.',
            })
        }

        // Ajoute l'email à la liste des invitations si pas déjà invité
        const workspace = await Workspace.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Espace non trouvé' })
        }
        if (workspace.invitations.includes(email)) {
            return res
                .status(400)
                .json({ message: 'Cet email est déjà invité.' })
        }
        workspace.invitations.push(email)
        await workspace.save()

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
        // Ici tu dois retrouver le workspace à partir du code d'invitation
        // Exemple simple : recherche par _id (à adapter selon ta logique d'invitation)
        const workspace = await Workspace.findById(inviteCode)
        if (!workspace) {
            return res
                .status(404)
                .json({ message: 'Invitation invalide ou expirée' })
        }

        // Vérifier si l'utilisateur est déjà membre
        const alreadyMember = await Permission.findOne({
            userId: req.user.id,
            workspaceId: workspace._id,
        })
        if (alreadyMember) {
            return res
                .status(400)
                .json({ message: 'Vous êtes déjà membre de cet espace.' })
        }

        // Ajouter l'utilisateur comme membre simple
        await Permission.create({
            userId: req.user.id,
            workspaceId: workspace._id,
            role: 'member',
            permissions: {
                canPost: true,
                canDeleteMessages: false,
                canManageMembers: false,
                canManageChannels: false,
            },
        })

        res.status(200).json({
            message: "Vous avez rejoint l'espace de travail",
            workspace,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la jointure', error })
    }
}
