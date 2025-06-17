const Message = require('../models/Message') // Assure-toi que le modèle Message existe
const Channel = require('../models/Channel') // Assure-toi que le modèle Channel existe
const { getIo } = require('../socket')
const User = require('../models/User')
const Notification = require('../models/Notification')
const Permission = require('../models/Permission')
const Workspace = require('../models/Workspace')
const nodemailer = require('nodemailer')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const NotificationEmail = require('../emails/NotificationEmail')

// Fonction pour vérifier si les notifications pour nouveaux messages sont activées
async function shouldNotifyNewMessage(userId, channelId) {
    const user = await User.findById(userId).select('channelNotificationPrefs')
    const pref = user.channelNotificationPrefs?.find(
        (p) => String(p.channelId) === String(channelId)
    )

    // Si une préférence spécifique existe pour ce channel
    if (pref) {
        return pref.mode === 'all'
    }

    // Par défaut, les notifications sont désactivées pour les nouveaux messages
    return false
}

async function getChannelPref(userId, channelId) {
    const user = await User.findById(userId).select('channelNotificationPrefs')
    const pref = user.channelNotificationPrefs?.find(
        (p) => String(p.channelId) === String(channelId)
    )
    return pref ? pref.mode : 'all'
}

// ✅ Envoyer un message dans un canal
exports.sendMessage = async (req, res) => {
    try {
        const {
            channelId,
            text,
            content,
            mentions: providedMentions,
        } = req.body
        const messageText = text || content

        // Correction : autoriser l'envoi si un fichier est présent même si messageText vide
        if ((!messageText || messageText.trim() === '') && !req.file) {
            return res
                .status(400)
                .json({ message: 'Le message ne peut pas être vide.' })
        }
        const channel = await Channel.findById(channelId).populate('members')
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        // Vérifier les permissions dans le workspace
        const workspace = await Workspace.findById(channel.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé.' })
        }

        // Vérifier si l'utilisateur est membre du workspace
        const isWorkspaceMember = workspace.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )
        if (!isWorkspaceMember) {
            return res
                .status(403)
                .json({ message: "Vous n'êtes pas membre de ce workspace." })
        }

        const isMember = channel.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )

        // Récupérer les permissions explicites
        const perm = await Permission.findOne({
            userId: req.user.id,
            workspaceId: channel.workspace,
        })

        // Vérifier les permissions granulaires par ressource
        const channelPermission = await Permission.findOne({
            userId: req.user.id,
            resourceType: 'channel',
            resourceId: channelId,
        })

        // Déterminer si l'utilisateur peut poster
        let canPost = false

        // 1. Si c'est un channel public et l'utilisateur est membre du workspace
        if (channel.type === 'public' && isWorkspaceMember) {
            canPost = true
        }

        // 2. Si c'est un channel privé, il faut être membre OU avoir des permissions spécifiques
        if (channel.type === 'private') {
            if (isMember) {
                canPost = true
            } else if (
                channelPermission &&
                channelPermission.permissions?.includes('post')
            ) {
                canPost = true
            }
        }

        // 3. Si l'utilisateur est propriétaire du workspace
        const isOwner = String(workspace.owner) === String(req.user.id)
        if (isOwner) {
            canPost = true
        }

        // 4. Vérifier les rôles admin
        if (perm && perm.role === 'admin') {
            canPost = true
        }

        if (!canPost) {
            return res.status(403).json({ message: 'Accès refusé.' })
        }

        // Si des permissions explicites existent et interdisent de poster
        if (perm && perm.permissions?.canPost === false) {
            return res.status(403).json({
                message: "Vous n'avez pas le droit de poster dans ce channel.",
            })
        }

        // Déterminer le rôle effectif (par défaut 'membre' si pas de permissions explicites)
        let effectiveRole = 'membre'
        if (perm) {
            const channelRole = perm.channelRoles?.find(
                (c) => String(c.channelId) === String(channel._id)
            )
            effectiveRole = channelRole ? channelRole.role : perm.role
        }

        // Les invités ne peuvent poster que dans les channels où ils sont explicitement invités
        if (effectiveRole === 'invité') {
            const isChannelMember = channel.members.some(
                (m) => String(m._id || m) === String(req.user.id)
            )
            if (!isChannelMember) {
                return res.status(403).json({
                    message:
                        'Accès refusé. Les invités ne peuvent poster que dans les canaux où ils sont membres.',
                })
            }
        } // Correction hashtags: ne jamais créer de tableau vide
        const messageData = {
            channelId,
            channel: channelId, // Compatibilité avec les tests
            userId: req.user.id,
            text: messageText || '', // Assure qu'on a toujours une string
            content: messageText || '', // Supporte les deux formats
            type: 'text', // Type par défaut
        } // Ajouter hashtags seulement s'il y en a
        if (messageText && typeof messageText === 'string') {
            const found =
                messageText
                    .match(/#([a-zA-Z0-9_-]+)/g)
                    ?.map((h) => h.slice(1)) || []
            if (found.length > 0) {
                messageData.hashtags = Array.from(new Set(found))
            }
            // Si aucun hashtag trouvé, on ne définit pas le champ du tout
        } // Traiter les mentions et les ajouter au message
        const textMentions = Array.from(
            new Set(
                (messageText || '')
                    .match(/@([a-zA-Z0-9_-]+)/g)
                    ?.map((m) => m.slice(1)) || []
            )
        )

        // Combiner les mentions du texte et celles fournies directement
        let allMentions = []

        // Ajouter les mentions trouvées dans le texte (par nom d'utilisateur)
        if (textMentions.length > 0) {
            const mentionedUsersByName = await User.find({
                name: { $in: textMentions },
            })
            allMentions.push(...mentionedUsersByName.map((u) => u._id))
        }

        // Ajouter les mentions fournies directement (par ID)
        if (providedMentions && Array.isArray(providedMentions)) {
            allMentions.push(...providedMentions)
        }

        // Supprimer les doublons et valider les IDs
        if (allMentions.length > 0) {
            const uniqueMentions = Array.from(
                new Set(allMentions.map((id) => String(id)))
            )
            const validUsers = await User.find({ _id: { $in: uniqueMentions } })
            if (validUsers.length > 0) {
                messageData.mentions = validUsers.map((u) => u._id)
            }
        }

        const message = new Message(messageData)

        if (req.file) {
            message.file = `/uploads/${req.file.filename}`
            message.filename = req.file.originalname
            message.mimetype = req.file.mimetype
            message.size = req.file.size
        }

        await message.save()
        if (req.file) {
            const FileMeta = require('../models/FileMeta')
            const meta = new FileMeta({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                channelId,
                uploader: req.user.id,
            })
            await meta.save()
        }
        const io = getIo()
        try {
            io.to(channelId).emit('newMessage', message)
        } catch (e) {
            console.error('Socket emit error', e)
        } // Envoyer les notifications aux utilisateurs mentionnés
        const mentionedUsers = messageData.mentions
            ? await User.find({ _id: { $in: messageData.mentions } })
            : []

        for (const user of mentionedUsers) {
            // Ne pas créer de notification si l'utilisateur se mentionne lui-même
            if (String(user._id) === String(req.user.id)) {
                continue
            }

            const mode = await getChannelPref(user._id, channelId)
            if (mode === 'mute') continue

            let emailSent = false
            const notif = new Notification({
                userId: user._id,
                messageId: message._id,
                channelId,
                type: 'mention',
                title: 'Vous avez été mentionné',
                message: `Dans le channel ${channel.name}`,
                emailSent: false,
            })
            await notif.save()
            io.to(`user_${user._id}`).emit('notification', notif)

            const room = io.sockets.adapter.rooms.get(`user_${user._id}`)
            if (!room || room.size === 0) {
                try {
                    const html = renderToStaticMarkup(
                        React.createElement(NotificationEmail, {
                            userName: user.name || user.email,
                            messageText: messageText,
                        })
                    )
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS,
                        },
                    })
                    await transporter.sendMail({
                        from: `"SupChat" <${process.env.GMAIL_USER}>`,
                        to: user.email,
                        subject: 'Nouvelle mention SupChat',
                        html,
                    })
                    emailSent = true
                } catch (emailError) {
                    console.error('Erreur envoi email:', emailError)
                }

                // Mettre à jour la notification avec le statut d'envoi d'email
                notif.emailSent = emailSent
                await notif.save()
            }
        }
        if (channel.members && channel.members.length) {
            for (const member of channel.members) {
                if (String(member._id) === String(req.user.id)) continue
                if (
                    mentionedUsers.find(
                        (u) => String(u._id) === String(member._id)
                    )
                ) {
                    continue
                }

                // Vérifier si les notifications pour nouveaux messages sont activées
                const shouldNotify = await shouldNotifyNewMessage(
                    member._id,
                    channelId
                )
                if (!shouldNotify) continue

                const notif = new Notification({
                    userId: member._id,
                    messageId: message._id,
                    channelId,
                    type: 'new_message',
                    title: 'Nouveau message',
                    message: `Dans le channel ${channel.name}`,
                })
                await notif.save()
                io.to(`user_${member._id}`).emit('notification', notif)
            }
        }
        return res.status(201).json({ message: message, success: true })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ✅ Récupérer tous les messages d'un canal
exports.getMessagesByChannel = async (req, res) => {
    try {
        const { channelId } = req.params
        const { page = 1, limit = 50, search } = req.query

        const channel = await Channel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        const workspace = await Workspace.findById(channel.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé.' })
        }

        // Utiliser la même logique de permissions que sendMessage
        const isWorkspaceMember = workspace.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )
        if (!isWorkspaceMember) {
            return res
                .status(403)
                .json({ message: "Vous n'êtes pas membre de ce workspace." })
        }

        // Vérifier les permissions explicites
        const perm = await Permission.findOne({
            userId: req.user.id,
            workspaceId: channel.workspace,
        })

        if (perm && perm.permissions?.canRead === false) {
            return res.status(403).json({
                message: "Vous n'avez pas le droit de lire ce channel.",
            })
        } // Construire la requête de recherche
        let query = {
            $or: [{ channelId: channelId }, { channel: channelId }],
        }
        if (search) {
            query.$and = [
                { $or: query.$or }, // Assure qu'on cherche dans le bon channel
                {
                    $or: [
                        { text: { $regex: search, $options: 'i' } },
                        { content: { $regex: search, $options: 'i' } },
                    ],
                },
            ]
            delete query.$or // Remplacer par $and
        }

        // Pagination
        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)
        const skip = (pageNum - 1) * limitNum

        const [messages, totalCount] = await Promise.all([
            Message.find(query)
                .populate('userId', 'username email name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Message.countDocuments(query),
        ])

        const totalPages = Math.ceil(totalCount / limitNum)

        return res.status(200).json({
            messages,
            totalPages,
            currentPage: pageNum,
            totalCount,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
        })
    } catch (error) {
        console.error('Error getting messages:', error)
        res.status(500).json({
            message: 'Erreur serveur.',
            error: error.message,
        })
    }
}

// ✅ Récupérer un message spécifique par son ID
exports.getMessageById = async (req, res) => {
    try {
        const { id } = req.params
        const message = await Message.findById(id).populate(
            'userId',
            'username email'
        )

        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé.' })
        }

        const channel = await Channel.findById(
            message.channelId || message.channel
        )
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        const workspace = await Workspace.findById(channel.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé.' })
        }
        const isChanMember = channel.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )
        if (!isChanMember) {
            return res.status(403).json({ message: 'Accès refusé.' })
        }

        if (req.user.role !== 'admin') {
            const perm = await Permission.findOne({
                userId: req.user.id,
                workspaceId: workspace._id,
            })
            const isMember = workspace.members?.some(
                (m) => String(m._id || m) === String(req.user.id)
            )
            const isOwner = String(workspace.owner) === String(req.user.id)

            if (!perm && !isMember && !isOwner) {
                return res.status(403).json({ message: 'Accès refusé.' })
            }
        }

        return res.status(200).json(message)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ✅ Mettre à jour un message (auteur ou admin workspace)
exports.updateMessage = async (req, res) => {
    try {
        const { id } = req.params
        const { text, content } = req.body
        const messageText = text || content
        const message = await Message.findById(id)
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé.' })
        }

        const channel = await Channel.findById(
            message.channelId || message.channel
        )
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        const workspace = await Workspace.findById(channel.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé.' })
        }

        let authorized =
            String(message.userId) === req.user.id || req.user.role === 'admin'

        if (!authorized) {
            const perm = await Permission.findOne({
                userId: req.user.id,
                workspaceId: workspace._id,
            })
            if (perm && perm.role === 'admin') authorized = true
        }

        if (!authorized) {
            return res.status(403).json({ message: 'Action non autorisée.' })
        }
        if (messageText) {
            message.text = messageText
            message.content = messageText
            message.edited = true
            message.editedAt = new Date()
            // Correction hashtags: ne pas mettre [] si aucun hashtag
            let hashtags = undefined
            if (messageText && typeof messageText === 'string') {
                const found =
                    messageText
                        .match(/#([a-zA-Z0-9_-]+)/g)
                        ?.map((h) => h.slice(1)) || []
                if (found.length > 0) {
                    hashtags = Array.from(new Set(found))
                }
            }
            if (hashtags) {
                message.hashtags = hashtags
            } else {
                // Supprime le champ hashtags s'il existe et qu'il doit être vide
                message.hashtags = undefined
                if (
                    message.toObject &&
                    message.toObject().hashtags !== undefined
                ) {
                    message.set('hashtags', undefined, { strict: false })
                }
            }
        }

        if (req.file) {
            message.file = `/uploads/${req.file.filename}`
            message.filename = req.file.originalname
            message.mimetype = req.file.mimetype
            message.size = req.file.size
        }

        await message.save()

        const io = getIo()
        io.to(String(message.channelId || message.channel)).emit(
            'messageEdited',
            message
        )

        res.status(200).json({ message, success: true })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ✅ Supprimer un message (Seul l'auteur ou un admin peut le faire)
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params
        const message = await Message.findById(id)

        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé.' })
        }

        const channel = await Channel.findById(
            message.channelId || message.channel
        )
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        const workspace = await Workspace.findById(channel.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé.' })
        }

        let authorized =
            message.userId.toString() === req.user.id ||
            req.user.role === 'admin'

        if (!authorized) {
            const perm = await Permission.findOne({
                userId: req.user.id,
                workspaceId: workspace._id,
            })
            if (perm && perm.role === 'admin') authorized = true
        }

        if (!authorized) {
            return res.status(403).json({ message: 'Action non autorisée.' })
        }
        await Message.findByIdAndDelete(id)
        const io = getIo()
        io.to(String(message.channelId || message.channel)).emit(
            'messageDeleted',
            { _id: id, channelId: message.channelId }
        )
        return res.status(200).json({ message: 'Message supprimé.' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ✅ Upload de fichier
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni.' })
        }

        const { channelId, type = 'file' } = req.body
        const { filename, originalname, mimetype, size } = req.file

        // Vérifications de sécurité
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
        if (!allowedTypes.includes(mimetype)) {
            return res
                .status(400)
                .json({ message: 'Type de fichier non autorisé.' })
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        if (size > maxSize) {
            return res.status(400).json({ message: 'Fichier trop volumineux.' })
        }

        const channel = await Channel.findById(channelId).populate('workspace')
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        const workspace = await Workspace.findById(channel.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace non trouvé.' })
        }

        // Utiliser la même logique de permissions que sendMessage
        const isWorkspaceMember = workspace.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )
        if (!isWorkspaceMember) {
            return res
                .status(403)
                .json({ message: "Vous n'êtes pas membre de ce workspace." })
        }

        // Vérifier les permissions explicites
        const perm = await Permission.findOne({
            userId: req.user.id,
            workspaceId: channel.workspace,
        })

        if (perm && perm.permissions?.canPost === false) {
            return res.status(403).json({
                message: "Vous n'avez pas le droit de poster dans ce channel.",
            })
        }

        // Créer le message avec le fichier
        const message = new Message({
            text: originalname,
            content: originalname,
            userId: req.user.id,
            channelId: channelId,
            channel: channelId,
            type: type,
            fileUrl: `/uploads/${filename}`,
            fileName: originalname,
            fileSize: size,
            mimeType: mimetype,
        })

        await message.save()

        // Émettre via WebSocket
        const io = getIo()
        try {
            io.to(String(channelId)).emit('newMessage', message)
        } catch (e) {
            console.error('Socket emit error', e)
        }

        res.status(201).json({ message, success: true })
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({
            message: 'Erreur serveur.',
            error: error.message,
        })
    }
}
