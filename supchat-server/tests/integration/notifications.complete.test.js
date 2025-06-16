const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Notification = require('../../models/Notification')
const Message = require('../../models/Message')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { channelFactory } = require('../factories/channelFactory')
const { messageFactory } = require('../factories/messageFactory')
const {
    generateUniqueEmail,
    generateUniqueId,
} = require('../helpers/testHelpers')
const bcrypt = require('bcryptjs')

/**
 * Tests d'intégration pour les Notifications
 * Couverture :
 * - Notifications temps réel (mentions d'utilisateurs)
 * - Nouveaux messages dans channels/workspaces
 * - Paramètres de notification par channel
 * - Notifications push ou email
 * - Gestion des préférences utilisateur
 */
describe("Notifications - Tests d'intégration", () => {
    let authToken
    let user
    let otherUser
    let workspace
    let channel
    let otherToken

    beforeEach(async () => {
        // Nettoyer la base de données avant chaque test
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Notification.deleteMany({})
        await Message.deleteMany({})

        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        user = await User.create(
            userFactory({
                email: generateUniqueEmail('user'),
                password: hashedPassword,
                username: 'testuser',
            })
        )

        otherUser = await User.create(
            userFactory({
                email: generateUniqueEmail('other'),
                password: hashedPassword,
                username: 'otheruser',
            })
        )

        workspace = await Workspace.create(
            workspaceFactory({
                owner: user._id,
                members: [user._id, otherUser._id],
            })
        )

        channel = await Channel.create(
            channelFactory({
                name: 'general',
                workspace: workspace._id,
                members: [user._id, otherUser._id],
            })
        )

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'TestPassword123!' })
        authToken = userLogin.body.token

        const otherLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: otherUser.email, password: 'TestPassword123!' })
        otherToken = otherLogin.body.token
    })

    describe('Notifications de mentions', () => {
        it("devrait créer une notification lors d'une mention", async () => {
            const messageData = {
                content: 'Salut @otheruser, tu peux regarder ça ?',
                type: 'text',
                mentions: [otherUser._id],
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(201)

            // Vérifier qu'une notification a été créée
            const notification = await Notification.findOne({
                userId: otherUser._id,
                type: 'mention',
            })

            expect(notification).not.toBeNull()
            expect(notification).toHaveProperty(
                'messageId',
                res.body.message._id
            )
            expect(notification).toHaveProperty('read', false)
        })

        it("ne devrait pas créer de notification si l'utilisateur se mentionne lui-même", async () => {
            const messageData = {
                content: 'Je me mentionne @testuser',
                type: 'text',
                mentions: [user._id],
            }

            await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            const notification = await Notification.findOne({
                userId: user._id,
                type: 'mention',
            })

            expect(notification).toBeNull()
        })
    })

    describe('GET /api/notifications', () => {
        it("devrait récupérer les notifications de l'utilisateur", async () => {
            // Créer quelques notifications
            await Notification.create({
                userId: user._id,
                type: 'mention',
                title: 'Vous avez été mentionné',
                message: 'Dans le channel #general',
                read: false,
            })

            await Notification.create({
                userId: user._id,
                type: 'new_message',
                title: 'Nouveau message',
                message: 'Dans le workspace Test',
                read: true,
            })

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.notifications).toHaveLength(2)
            expect(res.body.notifications[0]).toHaveProperty('type')
            expect(res.body.notifications[0]).toHaveProperty('read')
        })

        it('devrait filtrer les notifications non lues', async () => {
            await Notification.create({
                userId: user._id,
                type: 'mention',
                title: 'Non lu',
                read: false,
            })

            await Notification.create({
                userId: user._id,
                type: 'new_message',
                title: 'Lu',
                read: true,
            })

            const res = await request(app)
                .get('/api/notifications?unread=true')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.notifications).toHaveLength(1)
            expect(res.body.notifications[0]).toHaveProperty('read', false)
        })
    })

    describe('PUT /api/notifications/:id/read', () => {
        it('devrait marquer une notification comme lue', async () => {
            const notification = await Notification.create({
                userId: user._id,
                type: 'mention',
                title: 'Test notification',
                read: false,
            })

            const res = await request(app)
                .put(`/api/notifications/${notification._id}/read`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const updatedNotification = await Notification.findById(
                notification._id
            )
            expect(updatedNotification.read).toBe(true)
        })

        it("devrait rejeter la tentative de marquer la notification d'un autre utilisateur", async () => {
            const notification = await Notification.create({
                userId: otherUser._id,
                type: 'mention',
                title: "Notification d'autrui",
                read: false,
            })

            const res = await request(app)
                .put(`/api/notifications/${notification._id}/read`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('PUT /api/notifications/read-all', () => {
        it('devrait marquer toutes les notifications comme lues', async () => {
            await Notification.create({
                userId: user._id,
                type: 'mention',
                title: 'Notification 1',
                read: false,
            })

            await Notification.create({
                userId: user._id,
                type: 'new_message',
                title: 'Notification 2',
                read: false,
            })

            const res = await request(app)
                .put('/api/notifications/read-all')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const unreadCount = await Notification.countDocuments({
                userId: user._id,
                read: false,
            })
            expect(unreadCount).toBe(0)
        })
    })

    describe('Préférences de notification', () => {
        describe('GET /api/notifications/preferences', () => {
            it('devrait récupérer les préférences de notification', async () => {
                const res = await request(app)
                    .get('/api/notifications/preferences')
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body.preferences).toHaveProperty('mentions')
                expect(res.body.preferences).toHaveProperty('directMessages')
                expect(res.body.preferences).toHaveProperty('channelMessages')
                expect(res.body.preferences).toHaveProperty(
                    'emailNotifications'
                )
                expect(res.body.preferences).toHaveProperty('pushNotifications')
            })
        })

        describe('PUT /api/notifications/preferences', () => {
            it('devrait mettre à jour les préférences de notification', async () => {
                const preferences = {
                    mentions: true,
                    directMessages: true,
                    channelMessages: false,
                    emailNotifications: true,
                    pushNotifications: false,
                }

                const res = await request(app)
                    .put('/api/notifications/preferences')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ preferences })

                expect(res.statusCode).toBe(200)
                expect(res.body.preferences).toMatchObject(preferences)
            })
        })

        describe('PUT /api/channels/:id/notification-settings', () => {
            it('devrait configurer les notifications pour un channel spécifique', async () => {
                const settings = {
                    enabled: true,
                    mentions: true,
                    allMessages: false,
                }

                const res = await request(app)
                    .put(`/api/channels/${channel._id}/notification-settings`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(settings)

                expect(res.statusCode).toBe(200)
                expect(res.body.settings).toMatchObject(settings)
            })
        })
    })

    describe('Notifications de nouveaux messages', () => {
        it('devrait créer une notification pour les nouveaux messages si activé', async () => {
            // Configurer les notifications pour ce channel
            await request(app)
                .put(`/api/channels/${channel._id}/notification-settings`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    enabled: true,
                    allMessages: true,
                })

            const messageData = {
                content: 'Nouveau message dans le channel',
                type: 'text',
            }

            await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            const notification = await Notification.findOne({
                userId: otherUser._id,
                type: 'new_message',
            })

            expect(notification).not.toBeNull()
            expect(notification).toHaveProperty('channelId', channel._id)
        })

        it('ne devrait pas créer de notification si désactivé', async () => {
            // Désactiver les notifications pour ce channel
            await request(app)
                .put(`/api/channels/${channel._id}/notification-settings`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    enabled: false,
                })

            const messageData = {
                content: 'Message sans notification',
                type: 'text',
            }

            await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            const notification = await Notification.findOne({
                userId: otherUser._id,
                type: 'new_message',
            })

            expect(notification).toBeNull()
        })
    })

    describe('Notifications en temps réel (WebSocket)', () => {
        it("devrait envoyer une notification WebSocket lors d'une mention", (done) => {
            const io = require('socket.io-client')
            const clientSocket = io('http://localhost:3000', {
                auth: {
                    token: otherToken.replace('Bearer ', ''),
                },
            })

            clientSocket.on('notification', (data) => {
                expect(data).toHaveProperty('type', 'mention')
                expect(data).toHaveProperty('title')
                expect(data).toHaveProperty('message')

                clientSocket.disconnect()
                done()
            })

            // Envoyer un message avec mention après connexion
            setTimeout(async () => {
                await request(app)
                    .post(`/api/channels/${channel._id}/messages`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        content: 'Test mention @otheruser',
                        type: 'text',
                        mentions: [otherUser._id],
                    })
            }, 100)
        })
    })

    describe('DELETE /api/notifications/:id', () => {
        it('devrait supprimer une notification', async () => {
            const notification = await Notification.create({
                userId: user._id,
                type: 'mention',
                title: 'À supprimer',
                read: false,
            })

            const res = await request(app)
                .delete(`/api/notifications/${notification._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const deletedNotification = await Notification.findById(
                notification._id
            )
            expect(deletedNotification).toBeNull()
        })
    })

    describe('Notifications par email', () => {
        it('devrait envoyer un email pour une mention si activé', async () => {
            // Activer les notifications par email
            await request(app)
                .put('/api/notifications/preferences')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    preferences: {
                        mentions: true,
                        emailNotifications: true,
                    },
                })

            const messageData = {
                content: 'Mention avec email @otheruser',
                type: 'text',
                mentions: [otherUser._id],
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(201)

            // Note: Dans un vrai test, on vérifierait que l'email a été envoyé
            // Ici on peut seulement vérifier que la notification a été créée
            const notification = await Notification.findOne({
                userId: otherUser._id,
                type: 'mention',
            })

            expect(notification).not.toBeNull()
            expect(notification).toHaveProperty('emailSent', true)
        })
    })
})
