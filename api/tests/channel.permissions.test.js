const channelService = require('../services/channelService')
const Workspace = require('../models/Workspace')
const User = require('../models/User')
const Permission = require('../models/Permission')
const Channel = require('../models/Channel')

describe('Vérification des permissions sur les canaux', () => {
    let owner
    let member
    let workspace

    beforeAll(async () => {
        owner = await User.create({
            name: 'Owner',
            email: 'owner@example.com',
            password: 'pass',
        })
        member = await User.create({
            name: 'Member',
            email: 'member@example.com',
            password: 'pass',
        })
        workspace = await Workspace.create({
            name: 'WS',
            owner: owner._id,
        })
        await Permission.create({
            userId: owner._id,
            workspaceId: workspace._id,
            role: 'admin',
            permissions: [
                'post',
                'view',
                'moderate',
                'manage_members',
                'manage_channels',
                'delete_messages',
                'upload_files',
                'react',
                'invite_members',
            ],
            legacyPermissions: { canManageChannels: true },
        })
        await Permission.create({
            userId: member._id,
            workspaceId: workspace._id,
            role: 'membre',
            permissions: ['post', 'view', 'upload_files', 'react'],
            legacyPermissions: { canManageChannels: false },
        })
    })

    afterAll(async () => {
        await User.deleteMany()
        await Workspace.deleteMany()
        await Permission.deleteMany()
        await Channel.deleteMany()
    })

    it('refuse la création par un membre non admin', async () => {
        await expect(
            channelService.create(
                { name: 'Test', workspaceId: workspace._id, type: 'public' },
                member
            )
        ).rejects.toThrow('NOT_ALLOWED')
    })
    it('refuse la mise à jour par un membre non admin', async () => {
        const channel = await Channel.create({
            name: 'Chan',
            workspace: workspace._id,
            type: 'public',
            createdBy: owner._id,
            members: [owner._id],
        })
        await expect(
            channelService.update(channel._id, { name: 'New' }, member)
        ).rejects.toThrow('NOT_ALLOWED')
    })

    it('refuse la suppression par un membre non admin', async () => {
        const channel = await Channel.create({
            name: 'Del',
            workspace: workspace._id,
            type: 'public',
            createdBy: owner._id,
            members: [owner._id],
        })
        await expect(
            channelService.remove(channel._id, member)
        ).rejects.toThrow('NOT_ALLOWED')
    })
})
