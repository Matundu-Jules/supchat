const mongoose = require('mongoose')
process.env.NODE_ENV = 'test'
const { MongoMemoryServer } = require('mongodb-memory-server')
const ioClient = require('socket.io-client')
const jwt = require('jsonwebtoken')
const { faker } = require('@faker-js/faker')

const User = require('../models/User')
const Workspace = require('../models/Workspace')
const Channel = require('../models/Channel')
const Message = require('../models/Message')

const { userFactory } = require('./factories/userFactory')
const { workspaceFactory } = require('./factories/workspaceFactory')
const { channelFactory } = require('./factories/channelFactory')
const { messageFactory } = require('./factories/messageFactory')

const { connectToDatabase } = require('../src/app')

let mongoServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await connectToDatabase(uri)

    // Clean databases before tests
    await User.deleteMany({})
    await Workspace.deleteMany({})
    await Channel.deleteMany({})
    await Message.deleteMany({})

    // Seed users with unique data
    const admin = await User.create(
        userFactory({
            role: 'admin',
            password: 'pass',
            email: `admin-global-${Date.now()}@test.com`,
            username: `admin-global-${Date.now()}`,
        })
    )
    const member = await User.create(
        userFactory({
            role: 'membre',
            password: 'pass',
            email: `member-global-${Date.now()}@test.com`,
            username: `member-global-${Date.now()}`,
        })
    )
    const guest = await User.create(
        userFactory({
            role: 'invité',
            password: 'pass',
            email: `guest-global-${Date.now()}@test.com`,
            username: `guest-global-${Date.now()}`,
        })
    )

    global.adminId = admin._id
    global.memberId = member._id
    global.guestId = guest._id

    // Seed workspace and channel
    const workspace = await Workspace.create(
        workspaceFactory({
            owner: admin._id,
            members: [admin._id],
            name: `test-workspace-${Date.now()}`,
        })
    )
    const channel = await Channel.create(
        channelFactory({
            workspace: workspace._id,
            members: [admin._id],
            name: `test-channel-${Date.now()}`,
        })
    )
    await Message.create(
        messageFactory({ channel: channel._id, userId: admin._id })
    )

    workspace.channels.push(channel._id)
    await workspace.save()

    // JWT tokens
    process.env.JWT_SECRET = 'testsecret'
    process.env.JWT_REFRESH = 'testrefresh'
    global.tokens = {
        admin: jwt.sign(
            { id: admin._id, role: 'admin', tokenVersion: admin.tokenVersion },
            process.env.JWT_SECRET
        ),
        member: jwt.sign(
            {
                id: member._id,
                role: 'membre',
                tokenVersion: member.tokenVersion,
            },
            process.env.JWT_SECRET
        ),
        guest: jwt.sign(
            { id: guest._id, role: 'invité', tokenVersion: guest.tokenVersion },
            process.env.JWT_SECRET
        ),
    }

    // Socket.io client for tests
    global.socketClient = ioClient('http://localhost')
})

afterAll(async () => {
    try {
        // Clean up all collections
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Message.deleteMany({})

        await mongoose.connection.dropDatabase()
        await mongoose.disconnect()
        await mongoServer.stop()

        if (global.socketClient) {
            global.socketClient.close()
        }
    } catch (error) {
        console.log('Cleanup error (can be ignored):', error.message)
    }
})
