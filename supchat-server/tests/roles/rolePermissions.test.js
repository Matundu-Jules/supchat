const request = require('supertest')
const { app } = require('../../src/app')
const Channel = require('../../models/Channel')
const Workspace = require('../../models/Workspace')
const User = require('../../models/User')
const Permission = require('../../models/Permission')
const jwt = require('jsonwebtoken')
const { channelFactory } = require('../factories/channelFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { permissionFactory } = require('../factories/permissionFactory')
const { hashPassword } = require('../testUtils')

let admin, member, guest, workspace, adminToken, memberToken, guestToken

beforeAll(async () => {
    const hashedAdminPass = await hashPassword('passTest1234')
    const hashedMemberPass = await hashPassword('passTest1234')
    const hashedGuestPass = await hashPassword('passTest1234')

    admin = await User.create({
        email: 'admin-roles@example.com',
        password: hashedAdminPass,
        username: 'adminroles',
        role: 'admin',
        tokenVersion: 0,
    })
    member = await User.create({
        email: 'member-roles@example.com',
        password: hashedMemberPass,
        username: 'memberroles',
        role: 'membre',
        tokenVersion: 0,
    })
    guest = await User.create({
        email: 'guest-roles@example.com',
        password: hashedGuestPass,
        username: 'guestroles',
        role: 'invité',
        tokenVersion: 0,
    })

    workspace = await Workspace.create(
        workspaceFactory({
            owner: admin._id,
            members: [admin._id, member._id, guest._id],
        })
    )

    adminToken = jwt.sign(
        { id: admin._id, tokenVersion: 0 },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
    )
    memberToken = jwt.sign(
        { id: member._id, tokenVersion: 0 },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
    )
    guestToken = jwt.sign(
        { id: guest._id, tokenVersion: 0 },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
    )
})

describe('Role-based permissions', () => {
    describe('Admin permissions', () => {
        it('should allow admin to create public channels', async () => {
            await Permission.create({
                userId: admin._id,
                workspaceId: workspace._id,
                role: 'admin',
                permissions: {
                    canCreateChannels: true,
                    canManageChannels: true,
                    canManageMembers: true,
                },
            })

            const res = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'admin-public',
                    workspaceId: workspace._id,
                    type: 'public',
                })

            expect(res.status).toBe(201)
        })

        it('should allow admin to see all workspace members', async () => {
            const res = await request(app)
                .get(`/api/workspaces/${workspace._id}/members`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(200)
            expect(Array.isArray(res.body)).toBe(true)
        })
    })

    describe('Member permissions', () => {
        it('should allow member to create private channels only', async () => {
            await Permission.create({
                userId: member._id,
                workspaceId: workspace._id,
                role: 'membre',
                permissions: {
                    canCreateChannels: true,
                    canManageChannels: false,
                },
            })

            // Should succeed for private channels
            const res1 = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({
                    name: 'member-private',
                    workspaceId: workspace._id,
                    type: 'private',
                })

            expect(res1.status).toBe(201)

            // Should fail for public channels
            const res2 = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({
                    name: 'member-public',
                    workspaceId: workspace._id,
                    type: 'public',
                })

            expect(res2.status).toBe(403)
        })

        it('should allow member to see all workspace members', async () => {
            const res = await request(app)
                .get(`/api/workspaces/${workspace._id}/members`)
                .set('Authorization', `Bearer ${memberToken}`)

            expect(res.status).toBe(200)
        })

        it('should allow member to access public channels', async () => {
            const publicChannel = await Channel.create({
                name: 'public-test',
                workspace: workspace._id,
                type: 'public',
                members: [admin._id, member._id],
            })

            const res = await request(app)
                .get(`/api/channels/${publicChannel._id}`)
                .set('Authorization', `Bearer ${memberToken}`)

            expect(res.status).toBe(200)
        })
    })

    describe('Guest permissions', () => {
        let privateChannel, publicChannel

        beforeEach(async () => {
            // Nettoyer les channels existants
            await Channel.deleteMany({ workspace: workspace._id })

            privateChannel = await Channel.create({
                name: 'guest-private',
                workspace: workspace._id,
                type: 'private',
                members: [admin._id, guest._id], // Guest is explicitly a member
            })

            publicChannel = await Channel.create({
                name: 'guest-public',
                workspace: workspace._id,
                type: 'public',
                members: [admin._id, member._id], // Guest is NOT a member
            })

            // Nettoyer les permissions existantes pour le guest
            await Permission.deleteMany({
                userId: guest._id,
                workspaceId: workspace._id,
            })

            await Permission.create({
                userId: guest._id,
                workspaceId: workspace._id,
                role: 'invité',
                channelRoles: [
                    { channelId: privateChannel._id, role: 'invité' },
                ],
                permissions: {
                    canCreateChannels: false,
                    canViewAllMembers: false,
                    canViewPublicChannels: false,
                    canPost: true,
                },
            })
        })

        it('should prevent guest from creating channels', async () => {
            const res = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${guestToken}`)
                .send({
                    name: 'guest-channel',
                    workspaceId: workspace._id,
                    type: 'private',
                })

            expect(res.status).toBe(403)
        })

        it('should prevent guest from viewing all workspace members', async () => {
            const res = await request(app)
                .get(`/api/workspaces/${workspace._id}/members`)
                .set('Authorization', `Bearer ${guestToken}`)

            expect(res.status).toBe(403)
        })

        it('should allow guest to access channels where they are members', async () => {
            const res = await request(app)
                .get(`/api/channels/${privateChannel._id}`)
                .set('Authorization', `Bearer ${guestToken}`)

            expect(res.status).toBe(200)
        })

        it('should prevent guest from accessing public channels where they are not members', async () => {
            const res = await request(app)
                .get(`/api/channels/${publicChannel._id}`)
                .set('Authorization', `Bearer ${guestToken}`)

            expect(res.status).toBe(403)
        })

        it('should allow guest to post in channels where they are members', async () => {
            const res = await request(app)
                .post(`/api/channels/${privateChannel._id}/messages`)
                .set('Authorization', `Bearer ${guestToken}`)
                .send({ text: 'Hello from guest' })

            expect(res.status).toBe(201)
        })

        it('should only show guest their accessible channels', async () => {
            const res = await request(app)
                .get('/api/channels')
                .query({ workspaceId: workspace._id.toString() }) // Convert ObjectId to string
                .set('Authorization', `Bearer ${guestToken}`)

            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1) // Only the private channel they're member of
            expect(res.body[0]._id).toBe(privateChannel._id.toString())
        })
    })

    describe("Invitations d'utilisateurs", () => {
        it('should prevent inviting non-existing users to workspace', async () => {
            const nonExistingEmail = 'nonexisting@example.com'
            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ email: nonExistingEmail })

            expect(res.status).toBe(400)
            expect(res.body.message).toContain('aucun utilisateur inscrit')
        })

        it('should prevent inviting non-existing users as guests', async () => {
            const nonExistingEmail = 'nonexisting-guest@example.com'

            // Créer un channel temporaire pour le test
            const testChannel = await Channel.create({
                name: 'test-channel',
                workspace: workspace._id,
                type: 'public',
                members: [admin._id],
            })

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite-guest`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: nonExistingEmail,
                    allowedChannels: [testChannel._id],
                })

            expect(res.status).toBe(400)
            expect(res.body.message).toContain('aucun utilisateur inscrit')

            // Nettoyer
            await Channel.findByIdAndDelete(testChannel._id)
        })

        it('should successfully invite existing users', async () => {
            // Créer un nouvel utilisateur pour l'invitation
            const hashedPass = await hashPassword('passTest1234')
            const newUser = await User.create({
                email: 'invitable@example.com',
                password: hashedPass,
                username: 'invitable',
                role: 'membre',
                tokenVersion: 0,
            })

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ email: newUser.email })

            expect(res.status).toBe(200)
            expect(res.body.message).toContain('Invitation envoyée')

            // Nettoyer
            await User.findByIdAndDelete(newUser._id)
        })
    })
})

afterAll(async () => {
    try {
        await User.deleteMany()
        await Workspace.deleteMany()
        await Permission.deleteMany()
        await Channel.deleteMany()
    } catch (error) {
        console.log('Cleanup error (can be ignored):', error.message)
    }
})
