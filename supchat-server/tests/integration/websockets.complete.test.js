const ioClient = require('socket.io-client')
const { app, server } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { channelFactory } = require('../factories/channelFactory')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * Tests d'intégration pour la Communication Temps Réel (WebSockets)
 * Couverture :
 * - Connexion/déconnexion WebSocket
 * - Messages en temps réel
 * - Notifications push
 * - Statut en ligne/hors ligne
 * - Indicateurs de frappe
 * - Synchronisation entre clients
 */
describe('WebSockets - Communication Temps Réel', () => {
    let clientSocket1, clientSocket2
    let user1, user2
    let workspace, channel
    let token1, token2

    beforeAll((done) => {
        server.listen(() => {
            const port = server.address().port

            // Initialiser les données de test
            initTestData().then(() => {
                // Connecter les clients socket
                clientSocket1 = ioClient(`http://localhost:${port}`, {
                    auth: { token: token1 },
                })

                clientSocket2 = ioClient(`http://localhost:${port}`, {
                    auth: { token: token2 },
                })

                let connectedClients = 0
                const checkConnection = () => {
                    connectedClients++
                    if (connectedClients === 2) {
                        done()
                    }
                }

                clientSocket1.on('connect', checkConnection)
                clientSocket2.on('connect', checkConnection)
            })
        })
    })

    afterAll((done) => {
        if (clientSocket1.connected) {
            clientSocket1.disconnect()
        }
        if (clientSocket2.connected) {
            clientSocket2.disconnect()
        }
        server.close(done)
    })

    async function initTestData() {
        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        user1 = await User.create(
            userFactory({
                email: 'user1@test.com',
                password: hashedPassword,
                username: 'user1',
            })
        )

        user2 = await User.create(
            userFactory({
                email: 'user2@test.com',
                password: hashedPassword,
                username: 'user2',
            })
        )

        workspace = await Workspace.create(
            workspaceFactory({
                owner: user1._id,
                members: [user1._id, user2._id],
            })
        )

        channel = await Channel.create(
            channelFactory({
                name: 'general',
                workspace: workspace._id,
                members: [user1._id, user2._id],
            })
        )

        // Générer les tokens JWT
        token1 = jwt.sign(
            { id: user1._id, username: user1.username },
            process.env.JWT_SECRET || 'testsecret'
        )

        token2 = jwt.sign(
            { id: user2._id, username: user2.username },
            process.env.JWT_SECRET || 'testsecret'
        )
    }

    describe('Connexion WebSocket', () => {
        it('devrait établir une connexion WebSocket authentifiée', (done) => {
            expect(clientSocket1.connected).toBe(true)
            expect(clientSocket2.connected).toBe(true)
            done()
        })

        it("devrait joindre automatiquement les channels de l'utilisateur", (done) => {
            clientSocket1.emit('join-channels', { userId: user1._id })

            clientSocket1.on('channels-joined', (data) => {
                expect(data.channels).toContain(channel._id.toString())
                done()
            })
        })

        it('devrait rejeter une connexion sans token valide', (done) => {
            const unauthorizedSocket = ioClient(
                `http://localhost:${server.address().port}`,
                {
                    auth: { token: 'invalid_token' },
                }
            )

            unauthorizedSocket.on('connect_error', (error) => {
                expect(error.message).toContain('Authentication error')
                done()
            })
        })
    })

    describe('Messages en Temps Réel', () => {
        it('devrait diffuser un nouveau message aux clients connectés', (done) => {
            const messageData = {
                content: 'Message en temps réel',
                channelId: channel._id,
                type: 'text',
            }

            // Client 2 écoute les nouveaux messages
            clientSocket2.on('new-message', (data) => {
                expect(data.message).toHaveProperty(
                    'content',
                    messageData.content
                )
                expect(data.message).toHaveProperty(
                    'userId',
                    user1._id.toString()
                )
                expect(data.message).toHaveProperty(
                    'channel',
                    channel._id.toString()
                )
                done()
            })

            // Client 1 envoie un message
            clientSocket1.emit('send-message', messageData)
        })

        it("devrait notifier la modification d'un message", (done) => {
            // Créer un message d'abord
            Message.create({
                content: 'Message original',
                userId: user1._id,
                channel: channel._id,
                type: 'text',
            }).then((message) => {
                // Écouter les modifications
                clientSocket2.on('message-updated', (data) => {
                    expect(data.message).toHaveProperty(
                        'content',
                        'Message modifié'
                    )
                    expect(data.message).toHaveProperty('edited', true)
                    done()
                })

                // Modifier le message
                clientSocket1.emit('edit-message', {
                    messageId: message._id,
                    newContent: 'Message modifié',
                })
            })
        })

        it("devrait notifier la suppression d'un message", (done) => {
            Message.create({
                content: 'Message à supprimer',
                userId: user1._id,
                channel: channel._id,
                type: 'text',
            }).then((message) => {
                clientSocket2.on('message-deleted', (data) => {
                    expect(data.messageId).toBe(message._id.toString())
                    expect(data.channelId).toBe(channel._id.toString())
                    done()
                })

                clientSocket1.emit('delete-message', {
                    messageId: message._id,
                })
            })
        })
    })

    describe('Réactions en Temps Réel', () => {
        it("devrait diffuser l'ajout d'une réaction", (done) => {
            Message.create({
                content: 'Message avec réaction',
                userId: user1._id,
                channel: channel._id,
                type: 'text',
            }).then((message) => {
                clientSocket2.on('reaction-added', (data) => {
                    expect(data.reaction).toHaveProperty('emoji', '👍')
                    expect(data.reaction).toHaveProperty(
                        'userId',
                        user1._id.toString()
                    )
                    expect(data.messageId).toBe(message._id.toString())
                    done()
                })

                clientSocket1.emit('add-reaction', {
                    messageId: message._id,
                    emoji: '👍',
                })
            })
        })

        it("devrait diffuser la suppression d'une réaction", (done) => {
            Message.create({
                content: 'Message avec réaction',
                userId: user1._id,
                channel: channel._id,
                type: 'text',
            }).then((message) => {
                clientSocket2.on('reaction-removed', (data) => {
                    expect(data.messageId).toBe(message._id.toString())
                    expect(data.userId).toBe(user1._id.toString())
                    done()
                })

                clientSocket1.emit('remove-reaction', {
                    messageId: message._id,
                })
            })
        })
    })

    describe('Indicateurs de Frappe', () => {
        it('devrait diffuser les indicateurs de frappe', (done) => {
            clientSocket2.on('user-typing', (data) => {
                expect(data.userId).toBe(user1._id.toString())
                expect(data.channelId).toBe(channel._id.toString())
                expect(data.isTyping).toBe(true)
                done()
            })

            clientSocket1.emit('typing', {
                channelId: channel._id,
                isTyping: true,
            })
        })

        it("devrait arrêter l'indicateur de frappe", (done) => {
            clientSocket2.on('user-stopped-typing', (data) => {
                expect(data.userId).toBe(user1._id.toString())
                expect(data.channelId).toBe(channel._id.toString())
                done()
            })

            clientSocket1.emit('typing', {
                channelId: channel._id,
                isTyping: false,
            })
        })

        it("devrait auto-arrêter l'indicateur de frappe après timeout", (done) => {
            clientSocket1.emit('typing', {
                channelId: channel._id,
                isTyping: true,
            })

            // L'indicateur devrait s'arrêter automatiquement après 3 secondes
            setTimeout(() => {
                clientSocket2.on('user-stopped-typing', (data) => {
                    expect(data.userId).toBe(user1._id.toString())
                    done()
                })
            }, 3500)
        }, 5000)
    })

    describe('Statut de Présence', () => {
        it('devrait notifier quand un utilisateur se connecte', (done) => {
            clientSocket2.on('user-online', (data) => {
                expect(data.userId).toBe(user1._id.toString())
                expect(data.status).toBe('online')
                done()
            })

            clientSocket1.emit('update-status', { status: 'online' })
        })

        it('devrait notifier quand un utilisateur se déconnecte', (done) => {
            clientSocket2.on('user-offline', (data) => {
                expect(data.userId).toBe(user1._id.toString())
                expect(data.status).toBe('offline')
                done()
            })

            clientSocket1.disconnect()
        })

        it('devrait permettre de définir un statut personnalisé', (done) => {
            clientSocket2.on('user-status-updated', (data) => {
                expect(data.userId).toBe(user1._id.toString())
                expect(data.status).toBe('busy')
                expect(data.customMessage).toBe('En réunion')
                done()
            })

            clientSocket1.emit('update-status', {
                status: 'busy',
                customMessage: 'En réunion',
            })
        })
    })

    describe('Gestion des Channels', () => {
        it("devrait notifier la création d'un nouveau channel", (done) => {
            clientSocket2.on('channel-created', (data) => {
                expect(data.channel).toHaveProperty('name', 'nouveau-channel')
                expect(data.channel).toHaveProperty(
                    'workspace',
                    workspace._id.toString()
                )
                done()
            })

            clientSocket1.emit('create-channel', {
                name: 'nouveau-channel',
                description: 'Channel créé via WebSocket',
                workspaceId: workspace._id,
            })
        })

        it('devrait notifier quand un utilisateur rejoint un channel', (done) => {
            clientSocket1.on('user-joined-channel', (data) => {
                expect(data.userId).toBe(user2._id.toString())
                expect(data.channelId).toBe(channel._id.toString())
                done()
            })

            clientSocket2.emit('join-channel', {
                channelId: channel._id,
            })
        })

        it('devrait notifier quand un utilisateur quitte un channel', (done) => {
            clientSocket1.on('user-left-channel', (data) => {
                expect(data.userId).toBe(user2._id.toString())
                expect(data.channelId).toBe(channel._id.toString())
                done()
            })

            clientSocket2.emit('leave-channel', {
                channelId: channel._id,
            })
        })
    })

    describe('Notifications Push', () => {
        it('devrait envoyer une notification pour une mention', (done) => {
            clientSocket2.on('push-notification', (data) => {
                expect(data.type).toBe('mention')
                expect(data.title).toContain('Vous avez été mentionné')
                expect(data.body).toContain('user1')
                done()
            })

            clientSocket1.emit('send-message', {
                content: 'Salut @user2, comment ça va ?',
                channelId: channel._id,
                type: 'text',
                mentions: [user2._id],
            })
        })

        it('devrait envoyer une notification pour un message direct', (done) => {
            // Créer un channel direct entre les deux utilisateurs
            Channel.create({
                name: `dm-${user1._id}-${user2._id}`,
                type: 'direct',
                workspace: workspace._id,
                members: [user1._id, user2._id],
            }).then((dmChannel) => {
                clientSocket2.on('push-notification', (data) => {
                    expect(data.type).toBe('direct_message')
                    expect(data.title).toContain('Nouveau message privé')
                    done()
                })

                clientSocket1.emit('send-message', {
                    content: 'Message privé',
                    channelId: dmChannel._id,
                    type: 'text',
                })
            })
        })
    })

    describe('Synchronisation de Données', () => {
        it('devrait synchroniser les données lors de la reconnexion', (done) => {
            // Simuler une déconnexion puis reconnexion
            clientSocket1.disconnect()

            setTimeout(() => {
                clientSocket1.connect()

                clientSocket1.on('sync-data', (data) => {
                    expect(data).toHaveProperty('channels')
                    expect(data).toHaveProperty('unreadCounts')
                    expect(data).toHaveProperty('userStatus')
                    done()
                })

                clientSocket1.emit('request-sync')
            }, 1000)
        })

        it('devrait synchroniser les compteurs de messages non lus', (done) => {
            clientSocket2.on('unread-count-updated', (data) => {
                expect(data.channelId).toBe(channel._id.toString())
                expect(data.unreadCount).toBeGreaterThan(0)
                done()
            })

            // Envoyer un message qui créera un compteur non lu
            clientSocket1.emit('send-message', {
                content: 'Message créant un non lu',
                channelId: channel._id,
                type: 'text',
            })
        })
    })

    describe("Gestion d'Erreurs WebSocket", () => {
        it('devrait gérer les erreurs de permission', (done) => {
            // Créer un channel privé où user2 n'est pas membre
            Channel.create({
                name: 'private-channel',
                type: 'private',
                workspace: workspace._id,
                members: [user1._id], // Seulement user1
            }).then((privateChannel) => {
                clientSocket2.on('error', (error) => {
                    expect(error.code).toBe('PERMISSION_DENIED')
                    expect(error.message).toContain('accès au channel')
                    done()
                })

                // user2 tente d'envoyer un message dans un channel privé
                clientSocket2.emit('send-message', {
                    content: 'Message non autorisé',
                    channelId: privateChannel._id,
                    type: 'text',
                })
            })
        })

        it('devrait gérer les données invalides', (done) => {
            clientSocket1.on('error', (error) => {
                expect(error.code).toBe('INVALID_DATA')
                expect(error.message).toContain('données invalides')
                done()
            })

            // Envoyer des données invalides
            clientSocket1.emit('send-message', {
                content: '', // Contenu vide
                channelId: 'invalid_id',
                type: 'text',
            })
        })
    })

    describe('Scalabilité et Performance', () => {
        it('devrait gérer multiple messages rapides', (done) => {
            let messagesReceived = 0
            const totalMessages = 10

            clientSocket2.on('new-message', (data) => {
                messagesReceived++
                if (messagesReceived === totalMessages) {
                    expect(messagesReceived).toBe(totalMessages)
                    done()
                }
            })

            // Envoyer plusieurs messages rapidement
            for (let i = 0; i < totalMessages; i++) {
                clientSocket1.emit('send-message', {
                    content: `Message rapide ${i}`,
                    channelId: channel._id,
                    type: 'text',
                })
            }
        })

        it("devrait maintenir l'ordre des messages", (done) => {
            const messages = []
            let expectedCount = 5

            clientSocket2.on('new-message', (data) => {
                messages.push(data.message.content)

                if (messages.length === expectedCount) {
                    for (let i = 0; i < expectedCount; i++) {
                        expect(messages[i]).toBe(`Message ordonné ${i}`)
                    }
                    done()
                }
            })

            // Envoyer des messages dans l'ordre
            for (let i = 0; i < expectedCount; i++) {
                setTimeout(() => {
                    clientSocket1.emit('send-message', {
                        content: `Message ordonné ${i}`,
                        channelId: channel._id,
                        type: 'text',
                    })
                }, i * 100) // Délai de 100ms entre chaque message
            }
        })
    })
})
