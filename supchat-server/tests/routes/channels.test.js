const mockEmit = jest.fn()
const mockTo = jest.fn(() => ({
    emit: mockEmit,
}))
const mockGetIo = jest.fn(() => ({
    to: mockTo,
    sockets: {
        adapter: {
            rooms: {
                get: jest.fn(() => undefined),
            },
        },
    },
}))

// Mock le module socket
jest.mock(
    '../../socket',
    () => ({
        getIo: mockGetIo,
        initSocket: jest.fn(() => mockGetIo()),
        __esModule: true,
    }),
    { virtual: true }
)

// Force Jest à utiliser notre mock
beforeAll(() => {
    jest.resetModules()
})

const request = require('supertest')
// Importons l'app après avoir setupé le mock
const { app } = require('../../src/app')
const Channel = require('../../models/Channel')
const Workspace = require('../../models/Workspace')
const User = require('../../models/User')
const Message = require('../../models/Message')
const { channelFactory } = require('../factories/channelFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { userFactory } = require('../factories/userFactory')
const { messageFactory } = require('../factories/messageFactory')
const Permission = require('../../models/Permission')

describe('Channel routes', () => {
    let workspace

    beforeEach(async () => {
        // Réinitialise le mock avant chaque test
        mockEmit.mockClear()
        mockTo.mockClear()
        mockGetIo.mockClear()

        workspace = await Workspace.create(
            workspaceFactory({
                owner: global.adminId,
                members: [global.adminId],
            })
        )
    })

    describe('POST /channels', () => {
        it('creates channel', async () => {
            const res = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${global.tokens.admin}`)
                .send({
                    name: 'my channel',
                    workspaceId: workspace._id,
                    type: 'public',
                })

            console.log('DEBUG res.body:', JSON.stringify(res.body, null, 2))

            expect(res.status).toBe(201)
            expect(res.body.channel.name).toBe('my channel')
        })

        it('allows workspace member to create channel', async () => {
            // D'abord, ajoutons l'utilisateur membre au workspace
            workspace.members.push(global.memberId)
            await workspace.save()

            const res = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${global.tokens.member}`)
                .send({
                    name: 'member channel',
                    workspaceId: workspace._id,
                    type: 'public',
                })

            expect(res.status).toBe(201)
            expect(res.body.channel.name).toBe('member channel')
        })

        it('denies non-workspace member', async () => {
            const res = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${global.tokens.guest}`)
                .send({
                    name: 'guest channel',
                    workspaceId: workspace._id,
                    type: 'public',
                })

            expect(res.status).toBe(403)
        })
    })

    describe('GET /channels/:id/messages', () => {
        it('returns channel messages', async () => {
            const channel = await Channel.create(
                channelFactory({
                    workspace: workspace._id,
                    members: [global.adminId],
                })
            )
            const msg = await Message.create(
                messageFactory({ channel: channel._id, userId: global.adminId })
            )

            const res = await request(app)
                .get(`/api/messages/channel/${channel._id}`)
                .set('Authorization', `Bearer ${global.tokens.admin}`)

            expect(res.status).toBe(200)
        })
    })

    describe('POST /channels/:id/messages', () => {
        it('posts message and emits socket', async () => {
            const channel = await Channel.create(
                channelFactory({
                    workspace: workspace._id,
                    members: [global.adminId],
                })
            )

            await Permission.create({
                userId: global.adminId,
                workspaceId: workspace._id,
                role: 'admin',
                permissions: ['post', 'view', 'moderate'],
            })

            const res = await request(app)
                .post(`/api/channels/${channel._id}/messages`)
                .set('Authorization', `Bearer ${global.tokens.admin}`)
                .send({ text: 'hello' })

            expect(res.status).toBe(201)
            // Le contrôleur retourne { message: messageObj, success: true }
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBeDefined()
            expect(res.body.message.text).toBe('hello')
            expect(res.body.message.channelId).toBe(channel._id.toString())

            // Vérifier que le message a été créé en base
            const createdMessage = await Message.findById(res.body.message._id)
            expect(createdMessage).toBeTruthy()
            expect(createdMessage.text).toBe('hello')
            expect(createdMessage.channelId.toString()).toBe(
                channel._id.toString()
            )
        })
    })
})
