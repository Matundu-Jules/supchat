const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Permission = require('../../models/Permission')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { channelFactory } = require('../factories/channelFactory')
const { permissionFactory } = require('../factories/permissionFactory')
const {
    generateUniqueEmail,
    generateUniqueId,
} = require('../helpers/testHelpers')
const bcrypt = require('bcryptjs')

/**
 * Tests d'intégration pour la Gestion des Permissions
 * Couverture :
 * - Assignation de rôles (admin, membre, invité)
 * - Permissions (poster, modérer, gérer les membres)
 * - Permissions granulaires par utilisateur ou groupe
 * - Contrôle d'accès aux channels/workspaces
 */
describe("Permissions - Tests d'intégration", () => {
    let adminToken
    let memberToken
    let guestToken
    let adminUser
    let memberUser
    let guestUser
    let workspace
    let channel

    beforeEach(async () => {
        // Nettoyer la base de données avant chaque test
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Permission.deleteMany({})

        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        adminUser = await User.create(
            userFactory({
                email: generateUniqueEmail('admin'),
                password: hashedPassword,
                role: 'admin',
            })
        )

        memberUser = await User.create(
            userFactory({
                email: generateUniqueEmail('member'),
                password: hashedPassword,
                role: 'membre',
            })
        )

        guestUser = await User.create(
            userFactory({
                email: generateUniqueEmail('guest'),
                password: hashedPassword,
                role: 'invité',
            })
        )

        workspace = await Workspace.create(
            workspaceFactory({
                owner: adminUser._id,
                members: [adminUser._id, memberUser._id, guestUser._id],
            })
        )

        channel = await Channel.create(
            channelFactory({
                name: 'general',
                workspace: workspace._id,
                members: [adminUser._id, memberUser._id, guestUser._id],
                createdBy: adminUser._id,
            })
        )

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: 'TestPassword123!' })
        adminToken = adminLogin.body.token

        const memberLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: memberUser.email, password: 'TestPassword123!' })
        memberToken = memberLogin.body.token

        const guestLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: guestUser.email, password: 'TestPassword123!' })
        guestToken = guestLogin.body.token
    })

    describe('Permissions sur les Workspaces', () => {
        describe('Création de workspaces', () => {
            it('devrait permettre à un admin de créer un workspace', async () => {
                const workspaceData = {
                    name: 'Admin Workspace',
                    description: 'Créé par un admin',
                }

                const res = await request(app)
                    .post('/api/workspaces')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(workspaceData)

                expect(res.statusCode).toBe(201)
            })

            it('devrait permettre à un membre de créer un workspace', async () => {
                const workspaceData = {
                    name: 'Member Workspace',
                    description: 'Créé par un membre',
                }

                const res = await request(app)
                    .post('/api/workspaces')
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(workspaceData)

                expect(res.statusCode).toBe(201)
            })

            it('devrait rejeter la création de workspace par un invité', async () => {
                const workspaceData = {
                    name: 'Guest Workspace',
                    description: 'Tentative par un invité',
                }

                const res = await request(app)
                    .post('/api/workspaces')
                    .set('Authorization', `Bearer ${guestToken}`)
                    .send(workspaceData)

                expect(res.statusCode).toBe(403)
            })
        })

        describe('Gestion des membres de workspace', () => {
            it("devrait permettre au propriétaire d'inviter des membres", async () => {
                const inviteData = {
                    email: generateUniqueEmail('newmember'),
                    role: 'membre',
                }

                const res = await request(app)
                    .post(`/api/workspaces/${workspace._id}/invite`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(inviteData)

                expect(res.statusCode).toBe(200)
            })

            it("devrait rejeter l'invitation par un non-propriétaire", async () => {
                const inviteData = {
                    email: generateUniqueEmail('unauthorized'),
                    role: 'membre',
                }

                const res = await request(app)
                    .post(`/api/workspaces/${workspace._id}/invite`)
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(inviteData)

                expect(res.statusCode).toBe(403)
            })

            it('devrait permettre au propriétaire de retirer un membre', async () => {
                const res = await request(app)
                    .delete(
                        `/api/workspaces/${workspace._id}/members/${guestUser._id}`
                    )
                    .set('Authorization', `Bearer ${adminToken}`)

                expect(res.statusCode).toBe(200)
            })

            it('devrait rejeter la suppression de membre par un non-propriétaire', async () => {
                const res = await request(app)
                    .delete(
                        `/api/workspaces/${workspace._id}/members/${guestUser._id}`
                    )
                    .set('Authorization', `Bearer ${memberToken}`)

                expect(res.statusCode).toBe(403)
            })
        })
    })

    describe('Permissions sur les Channels', () => {
        describe('Création de channels', () => {
            it('devrait permettre aux membres de créer des channels publics', async () => {
                const channelData = {
                    name: 'member-channel',
                    description: 'Channel créé par un membre',
                    type: 'public',
                }

                const res = await request(app)
                    .post(`/api/workspaces/${workspace._id}/channels`)
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(channelData)

                expect(res.statusCode).toBe(201)
            })

            it('devrait permettre aux membres de créer des channels privés', async () => {
                const channelData = {
                    name: 'member-private',
                    description: 'Channel privé',
                    type: 'private',
                }

                const res = await request(app)
                    .post(`/api/workspaces/${workspace._id}/channels`)
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(channelData)

                expect(res.statusCode).toBe(201)
            })

            it('devrait rejeter la création de channel par un invité', async () => {
                const channelData = {
                    name: 'guest-channel',
                    description: 'Tentative par un invité',
                }

                const res = await request(app)
                    .post(`/api/workspaces/${workspace._id}/channels`)
                    .set('Authorization', `Bearer ${guestToken}`)
                    .send(channelData)

                expect(res.statusCode).toBe(403)
            })
        })

        describe('Gestion des channels', () => {
            it('devrait permettre au créateur de modifier son channel', async () => {
                const updateData = {
                    name: 'general-updated',
                    description: 'Description mise à jour',
                }

                const res = await request(app)
                    .put(`/api/channels/${channel._id}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(updateData)

                expect(res.statusCode).toBe(200)
            })

            it('devrait rejeter la modification par un non-créateur', async () => {
                const updateData = {
                    name: 'unauthorized-update',
                }

                const res = await request(app)
                    .put(`/api/channels/${channel._id}`)
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(updateData)

                expect(res.statusCode).toBe(403)
            })
        })
    })

    describe('Permissions sur les Messages', () => {
        describe('Envoi de messages', () => {
            it("devrait permettre aux membres d'envoyer des messages", async () => {
                const messageData = {
                    content: 'Message du membre',
                    type: 'text',
                }

                const res = await request(app)
                    .post(`/api/channels/${channel._id}/messages`)
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(messageData)

                expect(res.statusCode).toBe(201)
            })

            it("devrait permettre aux invités d'envoyer des messages", async () => {
                const messageData = {
                    content: "Message de l'invité",
                    type: 'text',
                }

                const res = await request(app)
                    .post(`/api/channels/${channel._id}/messages`)
                    .set('Authorization', `Bearer ${guestToken}`)
                    .send(messageData)

                expect(res.statusCode).toBe(201)
            })
        })

        describe('Modération de messages', () => {
            it("devrait permettre aux admins de supprimer n'importe quel message", async () => {
                // Créer un message par un membre
                const messageRes = await request(app)
                    .post(`/api/channels/${channel._id}/messages`)
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send({ content: 'Message à supprimer', type: 'text' })

                const messageId = messageRes.body.message._id

                // Supprimer avec le token admin
                const res = await request(app)
                    .delete(`/api/messages/${messageId}`)
                    .set('Authorization', `Bearer ${adminToken}`)

                expect(res.statusCode).toBe(200)
            })

            it("devrait rejeter la suppression de message d'autrui par un membre", async () => {
                // Créer un message par l'admin
                const messageRes = await request(app)
                    .post(`/api/channels/${channel._id}/messages`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ content: "Message de l'admin", type: 'text' })

                const messageId = messageRes.body.message._id

                // Tentative de suppression par un membre
                const res = await request(app)
                    .delete(`/api/messages/${messageId}`)
                    .set('Authorization', `Bearer ${memberToken}`)

                expect(res.statusCode).toBe(403)
            })
        })
    })

    describe('Permissions Granulaires', () => {
        describe('POST /api/permissions', () => {
            it('devrait permettre de créer des permissions spécifiques', async () => {
                const permissionData = {
                    userId: memberUser._id,
                    resourceType: 'channel',
                    resourceId: channel._id,
                    permissions: ['moderate', 'manage_members'],
                }

                const res = await request(app)
                    .post('/api/permissions')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(permissionData)

                expect(res.statusCode).toBe(201)
                expect(res.body.permission).toHaveProperty('permissions')
                expect(res.body.permission.permissions).toContain('moderate')
            })

            it('devrait rejeter la création de permissions par un non-admin', async () => {
                const permissionData = {
                    userId: guestUser._id,
                    resourceType: 'channel',
                    resourceId: channel._id,
                    permissions: ['post'],
                }

                const res = await request(app)
                    .post('/api/permissions')
                    .set('Authorization', `Bearer ${memberToken}`)
                    .send(permissionData)

                expect(res.statusCode).toBe(403)
            })
        })

        describe('GET /api/permissions/check', () => {
            it("devrait vérifier les permissions d'un utilisateur", async () => {
                // Créer une permission spécifique
                await Permission.create(
                    permissionFactory({
                        userId: memberUser._id,
                        resourceType: 'channel',
                        resourceId: channel._id,
                        permissions: ['moderate'],
                    })
                )

                const res = await request(app)
                    .get(
                        `/api/permissions/check?userId=${memberUser._id}&resourceType=channel&resourceId=${channel._id}&permission=moderate`
                    )
                    .set('Authorization', `Bearer ${adminToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('hasPermission', true)
            })

            it('devrait retourner false pour une permission non accordée', async () => {
                const res = await request(app)
                    .get(
                        `/api/permissions/check?userId=${guestUser._id}&resourceType=channel&resourceId=${channel._id}&permission=moderate`
                    )
                    .set('Authorization', `Bearer ${adminToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('hasPermission', false)
            })
        })

        describe('PUT /api/permissions/:id', () => {
            it('devrait permettre de modifier des permissions existantes', async () => {
                const permission = await Permission.create(
                    permissionFactory({
                        userId: memberUser._id,
                        resourceType: 'channel',
                        resourceId: channel._id,
                        permissions: ['post'],
                    })
                )

                const updateData = {
                    permissions: ['post', 'moderate'],
                }

                const res = await request(app)
                    .put(`/api/permissions/${permission._id}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(updateData)

                expect(res.statusCode).toBe(200)
                expect(res.body.permission.permissions).toContain('moderate')
            })
        })
    })

    describe('Vérification des permissions en temps réel', () => {
        it('devrait valider les permissions avant chaque action', async () => {
            // Créer un channel privé
            const privateChannelRes = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'private-test',
                    type: 'private',
                })

            const privateChannelId = privateChannelRes.body.channel._id

            // Tentative d'envoi de message par un non-membre
            const messageData = {
                content: 'Message non autorisé',
                type: 'text',
            }

            const res = await request(app)
                .post(`/api/channels/${privateChannelId}/messages`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(403)
        })

        it("devrait permettre l'accès avec des permissions personnalisées", async () => {
            // Créer un channel privé
            const privateChannelRes = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'custom-permissions',
                    type: 'private',
                })

            const privateChannelId = privateChannelRes.body.channel._id

            // Accorder une permission spécifique au membre
            await Permission.create(
                permissionFactory({
                    userId: memberUser._id,
                    resourceType: 'channel',
                    resourceId: privateChannelId,
                    permissions: ['post', 'view'],
                })
            )

            // Maintenant l'envoi de message devrait fonctionner
            const messageData = {
                content: 'Message avec permission personnalisée',
                type: 'text',
            }

            const res = await request(app)
                .post(`/api/channels/${privateChannelId}/messages`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send(messageData)

            expect(res.statusCode).toBe(201)
        })
    })

    describe('Héritage de permissions', () => {
        it('devrait hériter des permissions du workspace', async () => {
            // Accorder une permission au niveau workspace
            await Permission.create(
                permissionFactory({
                    userId: memberUser._id,
                    resourceType: 'workspace',
                    resourceId: workspace._id,
                    permissions: ['manage_channels'],
                })
            )

            // Le membre devrait pouvoir créer un channel
            const channelData = {
                name: 'inherited-permission',
                description: 'Channel créé avec permission héritée',
            }

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/channels`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send(channelData)

            expect(res.statusCode).toBe(201)
        })
    })
})
