const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { channelFactory } = require('../factories/channelFactory')
const bcrypt = require('bcryptjs')

/**
 * Tests d'intégration pour les Channels
 * Couverture :
 * - Création de channels (publics/privés)
 * - Gestion des membres de channels
 * - Organisation dans un menu avec recherche
 * - Permissions sur les channels
 */
describe("Channels - Tests d'intégration", () => {
    let authToken
    let user
    let workspace
    let adminToken
    let adminUser

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        user = await User.create(
            userFactory({
                email: 'user@test.com',
                password: hashedPassword,
                role: 'membre',
            })
        )

        adminUser = await User.create(
            userFactory({
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin',
            })
        )

        workspace = await Workspace.create(
            workspaceFactory({
                owner: user._id,
                members: [user._id, adminUser._id],
            })
        )

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'TestPassword123!' })
        authToken = userLogin.body.token

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'TestPassword123!' })
        adminToken = adminLogin.body.token
    })

    describe('POST /api/workspaces/:workspaceId/channels', () => {
        it('devrait créer un channel public', async () => {
            const channelData = {
                name: 'general',
                description: 'Channel général pour tous',
                type: 'public',
            }

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(channelData)

            expect(res.statusCode).toBe(201)
            expect(res.body.channel).toHaveProperty('name', channelData.name)
            expect(res.body.channel).toHaveProperty('type', 'public')
            expect(res.body.channel).toHaveProperty(
                'workspace',
                workspace._id.toString()
            )
            expect(res.body.channel.members).toContain(user._id.toString())
        })

        it('devrait créer un channel privé', async () => {
            const channelData = {
                name: 'private-team',
                description: "Channel privé pour l'équipe",
                type: 'private',
            }

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(channelData)

            expect(res.statusCode).toBe(201)
            expect(res.body.channel).toHaveProperty('type', 'private')
            expect(res.body.channel.members).toHaveLength(1) // Seul le créateur
        })

        it('devrait rejeter la création par un non-membre du workspace', async () => {
            const otherUser = await User.create(
                userFactory({ email: 'other@test.com' })
            )
            const otherLogin = await request(app)
                .post('/api/auth/login')
                .send({ email: 'other@test.com', password: 'pass' })
            const otherToken = otherLogin.body.token

            const channelData = {
                name: 'unauthorized',
                description: 'Test non autorisé',
            }

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send(channelData)

            expect(res.statusCode).toBe(403)
        })

        it('devrait rejeter un nom de channel déjà existant dans le workspace', async () => {
            await Channel.create(
                channelFactory({
                    name: 'existing-channel',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            const channelData = {
                name: 'existing-channel',
                description: 'Tentative de doublon',
            }

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(channelData)

            expect(res.statusCode).toBe(409)
        })
    })

    describe('GET /api/workspaces/:workspaceId/channels', () => {
        it("devrait récupérer tous les channels accessibles à l'utilisateur", async () => {
            // Channel public
            const publicChannel = await Channel.create(
                channelFactory({
                    name: 'public-channel',
                    type: 'public',
                    workspace: workspace._id,
                    members: [user._id, adminUser._id],
                })
            )

            // Channel privé où l'utilisateur est membre
            const privateChannel = await Channel.create(
                channelFactory({
                    name: 'private-accessible',
                    type: 'private',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            // Channel privé où l'utilisateur n'est pas membre
            await Channel.create(
                channelFactory({
                    name: 'private-inaccessible',
                    type: 'private',
                    workspace: workspace._id,
                    members: [adminUser._id],
                })
            )

            const res = await request(app)
                .get(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.channels).toHaveLength(2)
            const channelNames = res.body.channels.map((c) => c.name)
            expect(channelNames).toContain('public-channel')
            expect(channelNames).toContain('private-accessible')
            expect(channelNames).not.toContain('private-inaccessible')
        })

        it('devrait permettre la recherche de channels par nom', async () => {
            await Channel.create(
                channelFactory({
                    name: 'dev-frontend',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            await Channel.create(
                channelFactory({
                    name: 'dev-backend',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            await Channel.create(
                channelFactory({
                    name: 'general',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            const res = await request(app)
                .get(`/api/workspaces/${workspace._id}/channels?search=dev`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.channels).toHaveLength(2)
            const channelNames = res.body.channels.map((c) => c.name)
            expect(channelNames).toContain('dev-frontend')
            expect(channelNames).toContain('dev-backend')
            expect(channelNames).not.toContain('general')
        })
    })

    describe('PUT /api/channels/:id', () => {
        it('devrait permettre au créateur de modifier le channel', async () => {
            const channel = await Channel.create(
                channelFactory({
                    name: 'modifiable-channel',
                    workspace: workspace._id,
                    createdBy: user._id,
                    members: [user._id],
                })
            )

            const updateData = {
                name: 'updated-channel',
                description: 'Description mise à jour',
            }

            const res = await request(app)
                .put(`/api/channels/${channel._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.channel).toHaveProperty('name', updateData.name)
            expect(res.body.channel).toHaveProperty(
                'description',
                updateData.description
            )
        })

        it('devrait rejeter la modification par un non-créateur', async () => {
            const channel = await Channel.create(
                channelFactory({
                    name: 'others-channel',
                    workspace: workspace._id,
                    createdBy: adminUser._id,
                    members: [adminUser._id, user._id],
                })
            )

            const updateData = {
                name: 'tentative-modification',
            }

            const res = await request(app)
                .put(`/api/channels/${channel._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('DELETE /api/channels/:id', () => {
        it('devrait permettre au créateur de supprimer le channel', async () => {
            const channel = await Channel.create(
                channelFactory({
                    workspace: workspace._id,
                    createdBy: user._id,
                    members: [user._id],
                })
            )

            const res = await request(app)
                .delete(`/api/channels/${channel._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const deletedChannel = await Channel.findById(channel._id)
            expect(deletedChannel).toBeNull()
        })
    })

    describe('POST /api/channels/:id/invite', () => {
        it('devrait inviter un utilisateur dans un channel privé', async () => {
            const channel = await Channel.create(
                channelFactory({
                    type: 'private',
                    workspace: workspace._id,
                    createdBy: user._id,
                    members: [user._id],
                })
            )

            const inviteData = {
                userId: adminUser._id,
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/invite`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(inviteData)

            expect(res.statusCode).toBe(200)

            const updatedChannel = await Channel.findById(channel._id)
            expect(updatedChannel.members).toContain(adminUser._id)
        })

        it("devrait rejeter l'invitation par un non-membre", async () => {
            const otherUser = await User.create(
                userFactory({ email: 'other@test.com' })
            )
            const channel = await Channel.create(
                channelFactory({
                    type: 'private',
                    workspace: workspace._id,
                    createdBy: adminUser._id,
                    members: [adminUser._id],
                })
            )

            const inviteData = {
                userId: otherUser._id,
            }

            const res = await request(app)
                .post(`/api/channels/${channel._id}/invite`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(inviteData)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('POST /api/channels/:id/join', () => {
        it('devrait permettre de rejoindre un channel public', async () => {
            const channel = await Channel.create(
                channelFactory({
                    type: 'public',
                    workspace: workspace._id,
                    members: [adminUser._id],
                })
            )

            const res = await request(app)
                .post(`/api/channels/${channel._id}/join`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const updatedChannel = await Channel.findById(channel._id)
            expect(updatedChannel.members).toContain(user._id)
        })

        it('devrait rejeter la tentative de rejoindre un channel privé sans invitation', async () => {
            const channel = await Channel.create(
                channelFactory({
                    type: 'private',
                    workspace: workspace._id,
                    members: [adminUser._id],
                })
            )

            const res = await request(app)
                .post(`/api/channels/${channel._id}/join`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('DELETE /api/channels/:id/leave', () => {
        it('devrait permettre de quitter un channel', async () => {
            const channel = await Channel.create(
                channelFactory({
                    workspace: workspace._id,
                    members: [user._id, adminUser._id],
                })
            )

            const res = await request(app)
                .delete(`/api/channels/${channel._id}/leave`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const updatedChannel = await Channel.findById(channel._id)
            expect(updatedChannel.members).not.toContain(user._id)
        })

        it('devrait empêcher le créateur de quitter son propre channel', async () => {
            const channel = await Channel.create(
                channelFactory({
                    workspace: workspace._id,
                    createdBy: user._id,
                    members: [user._id, adminUser._id],
                })
            )

            const res = await request(app)
                .delete(`/api/channels/${channel._id}/leave`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(400)
            expect(res.body).toHaveProperty('message')
        })
    })

    describe('DELETE /api/channels/:id/members/:userId', () => {
        it('devrait permettre au créateur de retirer un membre', async () => {
            const channel = await Channel.create(
                channelFactory({
                    workspace: workspace._id,
                    createdBy: user._id,
                    members: [user._id, adminUser._id],
                })
            )

            const res = await request(app)
                .delete(`/api/channels/${channel._id}/members/${adminUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            const updatedChannel = await Channel.findById(channel._id)
            expect(updatedChannel.members).not.toContain(adminUser._id)
        })
    })
})
