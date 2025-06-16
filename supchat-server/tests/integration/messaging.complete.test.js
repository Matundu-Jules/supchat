const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const Reaction = require('../../models/Reaction')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { channelFactory } = require('../factories/channelFactory')
const { messageFactory } = require('../factories/messageFactory')
const {
    generateUniqueEmail,
    generateUniqueId,
} = require('../helpers/testHelpers')
const bcrypt = require('bcryptjs')
const path = require('path')

/**
 * Tests d'intégration pour la Messagerie
 * Couverture :
 * - Envoi de messages texte
 * - Réactions (emojis)
 * - Partage de fichiers (images, vidéos, PDF)
 * - Mentions (@user) et hashtags (#channel)
 * - Recherche de messages par mots-clés
 * - Messages en temps réel
 */
describe("Messagerie - Tests d'intégration", () => {
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
        await Message.deleteMany({})
        await Reaction.deleteMany({})

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

    describe('POST /api/channels/:channelId/messages', () => {
        it('devrait envoyer un message texte simple', async () => {
            const messageData = {
                content: 'Bonjour tout le monde !',
                type: 'text',
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(201)
            expect(res.body.message).toHaveProperty(
                'content',
                messageData.content
            )
            expect(res.body.message).toHaveProperty(
                'userId',
                user._id.toString()
            )
            expect(res.body.message).toHaveProperty(
                'channel',
                channel._id.toString()
            )
            expect(res.body.message).toHaveProperty('type', 'text')
        })

        it('devrait envoyer un message avec des mentions', async () => {
            const messageData = {
                content: 'Salut @otheruser, comment ça va ?',
                type: 'text',
                mentions: [otherUser._id],
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(201)
            expect(res.body.message).toHaveProperty('mentions')
            expect(res.body.message.mentions).toContain(
                otherUser._id.toString()
            )
        })

        it('devrait envoyer un message avec des hashtags', async () => {
            const messageData = {
                content: 'Parlons de #development et #testing',
                type: 'text',
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(201)
            expect(res.body.message).toHaveProperty('hashtags')
            expect(res.body.message.hashtags).toContain('development')
            expect(res.body.message.hashtags).toContain('testing')
        })

        it('devrait rejeter un message vide', async () => {
            const messageData = {
                content: '',
                type: 'text',
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(400)
        })

        it("devrait rejeter un message d'un non-membre du channel", async () => {
            const hashedPassword = await bcrypt.hash('pass', 10)
            const outsider = await User.create(
                userFactory({
                    email: 'outsider@test.com',
                    password: hashedPassword,
                })
            )

            // Ajouter l'outsider au workspace mais pas au channel
            await Workspace.findByIdAndUpdate(workspace._id, {
                $push: { members: outsider._id },
            })

            const outsiderLogin = await request(app)
                .post('/api/auth/login')
                .send({ email: 'outsider@test.com', password: 'pass' })
            const outsiderToken = outsiderLogin.body.token

            const messageData = {
                content: 'Message non autorisé',
                type: 'text',
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${outsiderToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('POST /api/channels/:channelId/messages/upload', () => {
        it('devrait uploader et envoyer une image', async () => {
            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages/upload`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('fake image data'), 'test.jpg')
                .field('type', 'image')

            expect(res.statusCode).toBe(201)
            expect(res.body.message).toHaveProperty('type', 'image')
            expect(res.body.message).toHaveProperty('fileUrl')
            expect(res.body.message).toHaveProperty('fileName', 'test.jpg')
        })

        it('devrait uploader un document PDF', async () => {
            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages/upload`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('fake pdf data'), 'document.pdf')
                .field('type', 'document')

            expect(res.statusCode).toBe(201)
            expect(res.body.message).toHaveProperty('type', 'document')
            expect(res.body.message).toHaveProperty('fileUrl')
        })

        it('devrait rejeter un fichier trop volumineux', async () => {
            const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages/upload`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', largeBuffer, 'large.jpg')
                .field('type', 'image')

            expect(res.statusCode).toBe(413) // Payload Too Large
        })

        it('devrait rejeter un type de fichier non autorisé', async () => {
            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages/upload`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('fake exe data'), 'virus.exe')
                .field('type', 'document')

            expect(res.statusCode).toBe(400)
        })
    })

    describe('GET /api/channels/:channelId/messages', () => {
        it('devrait récupérer les messages du channel', async () => {
            // Créer quelques messages
            const message1 = await Message.create(
                messageFactory({
                    content: 'Premier message',
                    userId: user._id,
                    channelId: channel._id,
                })
            )

            const message2 = await Message.create(
                messageFactory({
                    content: 'Deuxième message',
                    userId: otherUser._id,
                    channelId: channel._id,
                })
            )

            const res = await request(app)
                .get(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.messages).toHaveLength(2)
            expect(res.body.messages[0]).toHaveProperty('content')
            expect(res.body.messages[0]).toHaveProperty('userId')
        })

        it('devrait paginer les messages', async () => {
            // Créer 25 messages
            const messages = []
            for (let i = 0; i < 25; i++) {
                messages.push(
                    messageFactory({
                        content: `Message ${i}`,
                        userId: user._id,
                        channelId: channel._id,
                    })
                )
            }
            await Message.insertMany(messages)

            const res = await request(app)
                .get(`/api/channels/${channel._id}/messages?page=1&limit=10`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.messages).toHaveLength(10)
            expect(res.body).toHaveProperty('totalPages')
            expect(res.body).toHaveProperty('currentPage', 1)
        })

        it('devrait rechercher des messages par contenu', async () => {
            await Message.create(
                messageFactory({
                    content: 'Message important sur le projet',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            await Message.create(
                messageFactory({
                    content: 'Autre message sans rapport',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            const res = await request(app)
                .get(`/api/channels/${channel._id}/messages?search=important`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.messages).toHaveLength(1)
            expect(res.body.messages[0]).toHaveProperty(
                'content',
                'Message important sur le projet'
            )
        })
    })

    describe('PUT /api/messages/:id', () => {
        it("devrait permettre à l'auteur de modifier son message", async () => {
            const message = await Message.create(
                messageFactory({
                    content: 'Message original',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            const updateData = {
                content: 'Message modifié',
            }

            const res = await request(app)
                .put(`/api/messages/${message._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.message).toHaveProperty(
                'content',
                'Message modifié'
            )
            expect(res.body.message).toHaveProperty('edited', true)
            expect(res.body.message).toHaveProperty('editedAt')
        })

        it('devrait rejeter la modification par un autre utilisateur', async () => {
            const message = await Message.create(
                messageFactory({
                    content: "Message de l'autre utilisateur",
                    userId: otherUser._id,
                    channel: channel._id,
                })
            )

            const updateData = {
                content: 'Tentative de modification',
            }

            const res = await request(app)
                .put(`/api/messages/${message._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('DELETE /api/messages/:id', () => {
        it("devrait permettre à l'auteur de supprimer son message", async () => {
            const message = await Message.create(
                messageFactory({
                    content: 'Message à supprimer',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            const res = await request(app)
                .delete(`/api/messages/${message._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const deletedMessage = await Message.findById(message._id)
            expect(deletedMessage).toBeNull()
        })
    })

    describe('POST /api/messages/:id/reactions', () => {
        it('devrait ajouter une réaction à un message', async () => {
            const message = await Message.create(
                messageFactory({
                    content: 'Message réactionnable',
                    userId: otherUser._id,
                    channel: channel._id,
                })
            )

            const reactionData = {
                emoji: '👍',
            }

            const res = await request(app)
                .post(`/api/messages/${message._id}/reactions`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(reactionData)

            expect(res.statusCode).toBe(201)
            expect(res.body.reaction).toHaveProperty('emoji', '👍')
            expect(res.body.reaction).toHaveProperty(
                'userId',
                user._id.toString()
            )
        })

        it('devrait remplacer une réaction existante du même utilisateur', async () => {
            const message = await Message.create(
                messageFactory({
                    content: 'Message avec réaction',
                    userId: otherUser._id,
                    channel: channel._id,
                })
            )

            // Première réaction
            await request(app)
                .post(`/api/messages/${message._id}/reactions`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ emoji: '👍' })

            // Nouvelle réaction (devrait remplacer)
            const res = await request(app)
                .post(`/api/messages/${message._id}/reactions`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ emoji: '❤️' })

            expect(res.statusCode).toBe(201)
            expect(res.body.reaction).toHaveProperty('emoji', '❤️')

            // Vérifier qu'il n'y a qu'une seule réaction de cet utilisateur
            const reactions = await Reaction.find({
                messageId: message._id,
                userId: user._id,
            })
            expect(reactions).toHaveLength(1)
        })
    })

    describe('DELETE /api/messages/:id/reactions', () => {
        it("devrait supprimer la réaction de l'utilisateur", async () => {
            const message = await Message.create(
                messageFactory({
                    content: 'Message avec réaction',
                    userId: otherUser._id,
                    channel: channel._id,
                })
            )

            const reaction = await Reaction.create({
                messageId: message._id,
                userId: user._id,
                emoji: '👍',
            })

            const res = await request(app)
                .delete(`/api/messages/${message._id}/reactions`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const deletedReaction = await Reaction.findById(reaction._id)
            expect(deletedReaction).toBeNull()
        })
    })

    describe('Recherche globale de messages', () => {
        it('devrait rechercher des messages dans tous les channels accessibles', async () => {
            const otherChannel = await Channel.create(
                channelFactory({
                    name: 'dev',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            await Message.create(
                messageFactory({
                    content: 'Bug critique à corriger',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            await Message.create(
                messageFactory({
                    content: 'Feature critique terminée',
                    userId: user._id,
                    channel: otherChannel._id,
                })
            )

            await Message.create(
                messageFactory({
                    content: 'Message normal',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            const res = await request(app)
                .get(
                    `/api/workspaces/${workspace._id}/search/messages?q=critique`
                )
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.messages).toHaveLength(2)
            expect(
                res.body.messages.every((m) => m.content.includes('critique'))
            ).toBe(true)
        })
    })
})
