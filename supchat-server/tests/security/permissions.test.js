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

let admin, member, adminToken, memberToken

beforeAll(async () => {
    const hashedAdminPass = await hashPassword('passTest1234')
    const hashedMemberPass = await hashPassword('passTest1234')
    admin = await User.create({
        email: 'admin-perm@example.com',
        password: hashedAdminPass,
        username: 'adminperm',
        role: 'admin',
        tokenVersion: 0,
    })
    member = await User.create({
        email: 'member-perm@example.com',
        password: hashedMemberPass,
        username: 'memberperm',
        role: 'membre',
        tokenVersion: 0,
    })
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
})

describe('Private channel access', () => {
    it('allows member of channel', async () => {
        const workspace = await Workspace.create(
            workspaceFactory({
                ownerId: admin._id,
                members: [admin._id, member._id],
            })
        )
        const channel = await Channel.create(
            channelFactory({
                workspace: workspace._id,
                type: 'private',
                members: [admin._id, member._id],
            })
        )
        await Permission.create(
            permissionFactory({
                userId: admin._id,
                workspaceId: workspace._id,
                role: 'admin',
                channelRoles: [{ channelId: channel._id, role: 'admin' }],
            })
        )
        await Permission.create(
            permissionFactory({
                userId: member._id,
                workspaceId: workspace._id,
                role: 'membre',
                channelRoles: [{ channelId: channel._id, role: 'membre' }],
            })
        )

        const res = await request(app)
            .get(`/api/channels/${channel._id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.status).toBe(200)
    })

    it('denies non member', async () => {
        const workspace = await Workspace.create(
            workspaceFactory({ ownerId: admin._id, members: [admin._id] })
        )
        const channel = await Channel.create(
            channelFactory({
                workspace: workspace._id,
                type: 'private',
                members: [admin._id],
            })
        )
        await Permission.create(
            permissionFactory({
                userId: admin._id,
                workspaceId: workspace._id,
                role: 'admin',
                channelRoles: [{ channelId: channel._id, role: 'admin' }],
            })
        )
        await Permission.create(
            permissionFactory({
                userId: member._id,
                workspaceId: workspace._id,
                role: 'membre',
                channelRoles: [],
            })
        )

        const res = await request(app)
            .get(`/api/channels/${channel._id}`)
            .set('Authorization', `Bearer ${memberToken}`)

        expect(res.status).toBe(403)
    })
})
