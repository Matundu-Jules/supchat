const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

let io

function initSocket(
    server,
    allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']
) {
    // Éviter la double initialisation
    if (io) {
        return io
    }

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    })

    // Middleware d'authentification pour les connexions WebSocket
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token
            if (!token) {
                return next(
                    new Error('Authentication error: No token provided')
                )
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'testsecret'
            )
            const user = await User.findById(decoded.id).select('-password')

            if (!user) {
                return next(new Error('Authentication error: User not found'))
            }

            socket.userId = user._id.toString()
            socket.user = user
            next()
        } catch (err) {
            next(new Error('Authentication error: Invalid token'))
        }
    })

    io.on('connection', async (socket) => {
        // Rejoindre automatiquement les channels de l'utilisateur
        try {
            const Channel = require('./models/Channel')
            const userChannels = await Channel.find({
                members: socket.userId,
            }).select('_id')
            const channelIds = userChannels.map((channel) =>
                channel._id.toString()
            )

            // Rejoindre les channels automatiquement
            channelIds.forEach((channelId) => {
                socket.join(channelId)
            })

            // Envoyer la liste des channels rejoints
            socket.emit('channels-joined', {
                success: true,
                channels: channelIds,
            })
        } catch (error) {
            console.error('Error joining channels:', error)
        } // Gérer les événements de frappe
        const typingTimeouts = new Map()
        socket.on('typing', (data) => {
            try {
                // Validation des données
                if (!data || !data.channelId) {
                    return socket.emit('error', {
                        code: 'INVALID_DATA',
                        message: 'Données invalides: channelId requis',
                    })
                }

                // Vérifier que l'utilisateur a bien accès au channel
                if (!socket.user || !socket.userId) {
                    return socket.emit('error', {
                        code: 'AUTHENTICATION_REQUIRED',
                        message: 'Authentification requise',
                    })
                }

                socket.to(data.channelId).emit('user-typing', {
                    userId: socket.userId,
                    channelId: data.channelId,
                    username: socket.user.username,
                    isTyping:
                        data.isTyping !== undefined ? data.isTyping : true,
                })

                // Gérer l'auto-stop du typing après 3 secondes
                const timeoutKey = `${socket.userId}_${data.channelId}`

                // Annuler le timeout précédent s'il existe
                if (typingTimeouts.has(timeoutKey)) {
                    clearTimeout(typingTimeouts.get(timeoutKey))
                }

                // Si l'utilisateur arrête de taper, ne pas programmer de timeout
                if (data.isTyping === false) {
                    return
                }

                // Définir un nouveau timeout pour l'arrêt automatique
                const timeout = setTimeout(() => {
                    socket.to(data.channelId).emit('user-typing', {
                        userId: socket.userId,
                        channelId: data.channelId,
                        username: socket.user.username,
                        isTyping: false,
                    })
                    typingTimeouts.delete(timeoutKey)
                }, 3000) // 3 secondes

                typingTimeouts.set(timeoutKey, timeout)
            } catch (error) {
                console.error('Error in typing event:', error)
                socket.emit('error', {
                    code: 'TYPING_ERROR',
                    message: 'Erreur lors de la gestion du typing',
                })
            }
        })

        socket.on('stop-typing', (data) => {
            try {
                // Validation des données
                if (!data || !data.channelId) {
                    return socket.emit('error', {
                        code: 'INVALID_DATA',
                        message: 'Données invalides: channelId requis',
                    })
                }

                // Vérifier que l'utilisateur a bien accès au channel
                if (!socket.user || !socket.userId) {
                    return socket.emit('error', {
                        code: 'AUTHENTICATION_REQUIRED',
                        message: 'Authentification requise',
                    })
                }

                const timeoutKey = `${socket.userId}_${data.channelId}`

                // Annuler le timeout automatique
                if (typingTimeouts.has(timeoutKey)) {
                    clearTimeout(typingTimeouts.get(timeoutKey))
                    typingTimeouts.delete(timeoutKey)
                }

                socket.to(data.channelId).emit('user-typing', {
                    userId: socket.userId,
                    channelId: data.channelId,
                    username: socket.user.username,
                    isTyping: false,
                })
            } catch (error) {
                console.error('Error in stop-typing event:', error)
                socket.emit('error', {
                    code: 'TYPING_ERROR',
                    message: 'Erreur lors de la gestion du stop-typing',
                })
            }
        }) // Gérer les messages
        socket.on('send-message', async (data) => {
            try {
                // Validation des données
                if (!data || typeof data !== 'object') {
                    return socket.emit('error', {
                        code: 'INVALID_DATA',
                        message: 'Données invalides: format incorrect',
                    })
                }
                if (
                    !data.channelId ||
                    !data.content ||
                    typeof data.content !== 'string' ||
                    data.content.trim() === ''
                ) {
                    return socket.emit('error', {
                        code: 'INVALID_DATA',
                        message:
                            'Données invalides: channelId et content (non vide) requis',
                    })
                }

                const Message = require('./models/Message')
                const Channel = require('./models/Channel')

                // Vérifier les permissions du channel
                const channel = await Channel.findById(data.channelId)
                if (!channel) {
                    return socket.emit('error', {
                        code: 'CHANNEL_NOT_FOUND',
                        message: 'Channel non trouvé',
                    })
                } // Vérifier que l'utilisateur est membre du channel
                if (!channel.members.includes(socket.userId)) {
                    return socket.emit('error', {
                        code: 'NO_PERMISSION',
                        message:
                            "Vous n'avez pas la permission d'envoyer des messages dans ce channel",
                    })
                } // Créer le message en base
                const newMessage = await Message.create({
                    content: data.content,
                    userId: socket.userId,
                    channel: data.channelId,
                    type: data.type || 'text',
                })

                await newMessage.populate('userId', 'username email')

                // Diffuser le nouveau message aux autres clients du channel
                socket.to(data.channelId).emit('new-message', {
                    _id: newMessage._id,
                    content: newMessage.content,
                    channelId: newMessage.channel.toString(),
                    author: {
                        _id: newMessage.userId._id.toString(),
                        username: newMessage.userId.username,
                        email: newMessage.userId.email,
                    },
                    type: newMessage.type,
                    createdAt: newMessage.createdAt,
                })

                // Traiter les mentions
                if (data.mentions && data.mentions.length > 0) {
                    data.mentions.forEach((mentionedUserId) => {
                        socket
                            .to(`user_${mentionedUserId}`)
                            .emit('push-notification', {
                                type: 'mention',
                                title: 'Vous avez été mentionné',
                                message: `${socket.user.username} vous a mentionné dans #${channel.name}`,
                                data: {
                                    messageId: newMessage._id,
                                    channelId: channel._id,
                                    fromUser: socket.userId,
                                },
                            })
                    })
                }

                // Notification pour les messages directs
                if (channel.type === 'direct') {
                    const otherMembers = channel.members.filter(
                        (memberId) => memberId.toString() !== socket.userId
                    )

                    otherMembers.forEach((memberId) => {
                        socket
                            .to(`user_${memberId}`)
                            .emit('push-notification', {
                                type: 'direct_message',
                                title: 'Nouveau message privé',
                                message: `${socket.user.username}: ${newMessage.content}`,
                                data: {
                                    messageId: newMessage._id,
                                    channelId: channel._id,
                                    fromUser: socket.userId,
                                },
                            })
                    })
                }

                // Confirmer à l'expéditeur
                socket.emit('message-sent', {
                    success: true,
                    message: newMessage,
                })
            } catch (error) {
                socket.emit('error', {
                    message: 'Failed to send message',
                    error: error.message,
                })
            }
        })
        socket.on('edit-message', async (data) => {
            try {
                const Message = require('./models/Message')

                const message = await Message.findOneAndUpdate(
                    { _id: data.messageId, userId: socket.userId },
                    { content: data.newContent, edited: true },
                    { new: true }
                ).populate('userId', 'username')

                if (message) {
                    socket.to(message.channel).emit('message-updated', {
                        message: {
                            _id: message._id,
                            content: message.content,
                            edited: true,
                            userId: message.userId._id.toString(),
                            channel: message.channel.toString(),
                        },
                    })
                }
            } catch (error) {
                socket.emit('error', { message: 'Failed to edit message' })
            }
        })

        socket.on('delete-message', async (data) => {
            try {
                const Message = require('./models/Message')

                const message = await Message.findOneAndDelete({
                    _id: data.messageId,
                    userId: socket.userId,
                })

                if (message) {
                    socket.to(message.channel).emit('message-deleted', {
                        messageId: message._id,
                        channelId: message.channel.toString(),
                        userId: socket.userId,
                    })
                }
            } catch (error) {
                socket.emit('error', { message: 'Failed to delete message' })
            }
        })

        socket.on('new-message', (data) => {
            // Diffuser le nouveau message aux autres clients du channel
            socket.to(data.channelId).emit('message-received', {
                ...data,
                userId: socket.userId,
                username: socket.user.username,
            })
        }) // Gérer les réactions
        socket.on('add-reaction', async (data) => {
            try {
                const Message = require('./models/Message')

                const message = await Message.findById(data.messageId)
                if (!message) {
                    return socket.emit('error', {
                        message: 'Message not found',
                    })
                }

                // Ajouter la réaction
                if (!message.reactions) {
                    message.reactions = []
                }

                const existingReaction = message.reactions.find(
                    (r) =>
                        r.emoji === data.emoji &&
                        r.userId.toString() === socket.userId
                )

                if (!existingReaction) {
                    message.reactions.push({
                        emoji: data.emoji,
                        userId: socket.userId,
                    })
                    await message.save()
                }

                socket.to(message.channel).emit('reaction-added', {
                    messageId: data.messageId,
                    reaction: {
                        emoji: data.emoji,
                        userId: socket.userId,
                    },
                })
            } catch (error) {
                socket.emit('error', { message: 'Failed to add reaction' })
            }
        })

        socket.on('remove-reaction', async (data) => {
            try {
                const Message = require('./models/Message')

                const message = await Message.findById(data.messageId)
                if (!message) {
                    return socket.emit('error', {
                        message: 'Message not found',
                    })
                }

                // Supprimer la réaction
                if (message.reactions) {
                    message.reactions = message.reactions.filter(
                        (r) =>
                            !(
                                r.userId.toString() === socket.userId &&
                                r.emoji === data.emoji
                            )
                    )
                    await message.save()
                }

                socket.to(message.channel).emit('reaction-removed', {
                    messageId: data.messageId,
                    userId: socket.userId,
                    emoji: data.emoji,
                })
            } catch (error) {
                socket.emit('error', { message: 'Failed to remove reaction' })
            }
        }) // Gérer les notifications
        socket.on('user-status', (data) => {
            // Diffuser le statut aux autres utilisateurs
            socket.broadcast.emit('user-status-updated', {
                userId: socket.userId,
                status: data.status,
                customMessage: data.customMessage,
            })
        })

        // Gérer les mentions et notifications push
        socket.on('send-notification', (data) => {
            // Envoyer une notification à un utilisateur spécifique
            socket.to(`user_${data.targetUserId}`).emit('push-notification', {
                type: data.type,
                title: data.title,
                message: data.message,
                from: {
                    userId: socket.userId,
                    username: socket.user.username,
                },
                data: data.notificationData,
            })
        })

        // Gérer la synchronisation
        socket.on('request-sync', async (data) => {
            try {
                const Channel = require('./models/Channel')
                const Message = require('./models/Message')

                // Synchroniser les messages non lus
                const userChannels = await Channel.find({
                    members: socket.userId,
                })
                const syncData = []

                for (const channel of userChannels) {
                    const unreadCount = await Message.countDocuments({
                        channel: channel._id,
                        createdAt: { $gt: data.lastSyncTime || new Date(0) },
                    })

                    syncData.push({
                        channelId: channel._id,
                        unreadCount,
                    })
                }

                socket.emit('sync-complete', {
                    channels: syncData,
                    syncTime: new Date(),
                })
            } catch (error) {
                socket.emit('error', { message: 'Sync failed' })
            }
        })

        socket.on('mark-read', (data) => {
            // Mettre à jour le compteur de non-lus
            socket.emit('unread-count-updated', {
                channelId: data.channelId,
                unreadCount: 0,
            })
        })

        // Notification de connexion
        socket.broadcast.emit('user-online', {
            userId: socket.userId,
            username: socket.user.username,
            status: 'online',
        })
        socket.on('joinChannel', (channelId) => {
            if (channelId) {
                socket.join(channelId)
                socket.to(channelId).emit('user-joined-channel', {
                    userId: socket.userId,
                    channelId: channelId,
                    username: socket.user.username,
                })
            }
        })

        socket.on('leaveChannel', (channelId) => {
            if (channelId) {
                socket.leave(channelId)
                socket.to(channelId).emit('user-left-channel', {
                    userId: socket.userId,
                    channelId: channelId,
                    username: socket.user.username,
                })
            }
        })

        // Créer un nouveau channel
        socket.on('create-channel', async (data) => {
            try {
                const Channel = require('./models/Channel')

                const newChannel = await Channel.create({
                    name: data.name,
                    description: data.description,
                    workspace: data.workspaceId,
                    type: data.type || 'public',
                    createdBy: socket.userId,
                    members: [socket.userId],
                })

                await newChannel.populate('createdBy', 'username')

                // Notifier tous les membres du workspace
                socket.to(data.workspaceId).emit('channel-created', {
                    channel: {
                        _id: newChannel._id,
                        name: newChannel.name,
                        description: newChannel.description,
                        workspace: newChannel.workspace,
                        type: newChannel.type,
                        createdBy: newChannel.createdBy,
                    },
                })

                socket.emit('channel-created', {
                    success: true,
                    channel: newChannel,
                })
            } catch (error) {
                socket.emit('error', {
                    message: 'Failed to create channel',
                    error: error.message,
                })
            }
        })

        socket.on('subscribeNotifications', (userId) => {
            if (userId) socket.join(`user_${userId}`)
        })

        socket.on('unsubscribeNotifications', (userId) => {
            if (userId) socket.leave(`user_${userId}`)
        })

        socket.on('disconnect', () => {
            // Nettoyer les timeouts de frappe
            for (const [key, timeout] of typingTimeouts.entries()) {
                if (key.startsWith(socket.userId)) {
                    clearTimeout(timeout)
                    typingTimeouts.delete(key)
                }
            } // Notifier la déconnexion
            socket.broadcast.emit('user-offline', {
                userId: socket.userId,
                username: socket.user ? socket.user.username : 'Unknown',
                status: 'offline',
            })
        })
    })

    return io
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io
}

module.exports = { initSocket, getIo }
