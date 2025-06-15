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

async function getChannelPref(userId, channelId) {
    const user = await User.findById(userId).select('notificationPrefs')
    const pref = user.notificationPrefs?.find(
        (p) => String(p.channelId) === String(channelId)
    )
    return pref ? pref.mode : 'all'
}

// ✅ Envoyer un message dans un canal
exports.sendMessage = async (req, res) => {
    try {
        const { channelId, text } = req.body

        // Correction : autoriser l'envoi si un fichier est présent même si text vide
        if ((!text || text.trim() === '') && !req.file) {
            return res
                .status(400)
                .json({ message: 'Le message ne peut pas être vide.' })
        }

        const channel = await Channel.findById(channelId).populate('members')
        if (!channel) {
            return res.status(404).json({ message: 'Canal non trouvé.' })
        }

        const isMember = channel.members?.some(
            (m) => String(m._id || m) === String(req.user.id)
        )
        if (!isMember) {
            return res.status(403).json({ message: 'Accès refusé.' })
        }
        const perm = await Permission.findOne({
            userId: req.user.id,
            workspaceId: channel.workspace,
        })

        if (!perm || perm.permissions?.canPost === false) {
            return res.status(403).json({ message: 'Accès refusé.' })
        }
        const channelRole = perm.channelRoles?.find(
            (c) => String(c.channelId) === String(channel._id)
        )
        const effectiveRole = channelRole ? channelRole.role : perm.role

        // Les invités ne peuvent poster que dans les channels où ils sont explicitement invités
        if (effectiveRole === 'invité') {
            // Vérifier que l'invité est bien membre du channel
            const isChannelMember = channel.members.some(
                (m) => String(m._id || m) === String(req.user.id)
            )
            if (!isChannelMember) {
                return res.status(403).json({
                    message:
                        'Accès refusé. Les invités ne peuvent poster que dans les canaux où ils sont membres.',
                })
            }
        }

        // Correction hashtags: ne jamais créer de tableau vide
        const messageData = {
            channelId,
            userId: req.user.id,
            text: text || '', // Assure qu'on a toujours une string
        }

        // Ajouter hashtags seulement s'il y en a
        if (text && typeof text === 'string') {
            const found =
                text.match(/#([a-zA-Z0-9_-]+)/g)?.map((h) => h.slice(1)) || []
            if (found.length > 0) {
                messageData.hashtags = Array.from(new Set(found))
            }
            // Si aucun hashtag trouvé, on ne définit pas le champ du tout
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
        }

        const mentions = Array.from(
            new Set(
                text.match(/@([a-zA-Z0-9_-]+)/g)?.map((m) => m.slice(1)) || []
            )
        )
        const mentionedUsers = await User.find({ name: { $in: mentions } })
        for (const user of mentionedUsers) {
            const mode = await getChannelPref(user._id, channelId)
            if (mode === 'mute') continue
            const notif = new Notification({
                userId: user._id,
                messageId: message._id,
                channelId,
                type: 'mention',
            })
            await notif.save()
            io.to(`user_${user._id}`).emit('notification', notif)
            const room = io.sockets.adapter.rooms.get(`user_${user._id}`)
            if (!room || room.size === 0) {
                const html = renderToStaticMarkup(
                    React.createElement(NotificationEmail, {
                        userName: user.name || user.email,
                        messageText: text,
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
                const mode = await getChannelPref(member._id, channelId)
                if (mode !== 'all') continue
                const notif = new Notification({
                    userId: member._id,
                    messageId: message._id,
                    channelId,
                    type: 'message',
                })
                await notif.save()
                io.to(`user_${member._id}`).emit('notification', notif)
            }
        }

        return res
            .status(201)
            .json({ message: 'Message envoyé.', data: message })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ✅ Récupérer tous les messages d'un canal
exports.getMessagesByChannel = async (req, res) => {
    try {
        const { channelId } = req.params
        const channel = await Channel.findById(channelId)
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

        const messages = await Message.find({ channelId }).populate(
            'userId',
            'username email'
        )

        return res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
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
        const { text } = req.body
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

        if (text) {
            message.text = text
            // Correction hashtags: ne pas mettre [] si aucun hashtag
            let hashtags = undefined
            if (text && typeof text === 'string') {
                const found =
                    text.match(/#([a-zA-Z0-9_-]+)/g)?.map((h) => h.slice(1)) ||
                    []
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

        res.status(200).json(message)
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
