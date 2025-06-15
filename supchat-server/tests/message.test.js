const request = require('supertest')
const { app } = require('../src/app')
const User = require('../models/User')
const Channel = require('../models/Channel')
const Workspace = require('../models/Workspace')
const Permission = require('../models/Permission')
const jwt = require('jsonwebtoken')
const { channelFactory } = require('./factories/channelFactory')
const { workspaceFactory } = require('./factories/workspaceFactory')
const { permissionFactory } = require('./factories/permissionFactory')

let token, user, channel, workspace

beforeAll(async () => {
    // Création d'un utilisateur de test
    user = await User.create({
        email: 'test-message@example.com',
        password: 'passTest1234',
        username: 'testmessageuser',
        tokenVersion: 0,
    })
    // Création d'un workspace de test
    workspace = await Workspace.create(
        workspaceFactory({ ownerId: user._id, members: [user._id] })
    )
    // Création d'un channel de test avec l'utilisateur comme membre
    channel = await Channel.create(
        channelFactory({ workspace: workspace._id, members: [user._id] })
    )
    // Création d'une permission pour l'utilisateur sur ce workspace et channel
    await Permission.create(
        permissionFactory({
            userId: user._id,
            workspaceId: workspace._id,
            role: 'membre',
            channelRoles: [{ channelId: channel._id, role: 'membre' }],
            permissions: { canPost: true },
        })
    )
    // Génération d'un token JWT
    token = jwt.sign(
        { id: user._id, tokenVersion: 0 },
        process.env.JWT_SECRET || 'testsecret',
        {
            expiresIn: '1h',
        }
    )
})

describe('Test des routes Messages', () => {
    it('Envoie un message', async () => {
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({
                text: 'Bonjour tout le monde!',
                channelId: channel._id,
            })

        expect(res.statusCode).toBe(201)
        expect(res.body.data.text).toBe('Bonjour tout le monde!')
    })
})
