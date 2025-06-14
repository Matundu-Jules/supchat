// Script de reset et seed de la base MongoDB pour SupChat
require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const User = require('../models/User')
const Workspace = require('../models/Workspace')
const Channel = require('../models/Channel')
const Permission = require('../models/Permission')
const Message = require('../models/Message')

async function main() {
    const mongoUri =
        process.env.MONGO_URI ||
        `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD)}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DB || 'supchat'}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`
    await mongoose.connect(mongoUri)
    console.log('Connecté à MongoDB')

    // Purge collections
    await Promise.all([
        User.deleteMany({}),
        Workspace.deleteMany({}),
        Channel.deleteMany({}),
        Permission.deleteMany({}),
        Message.deleteMany({}),
    ])
    console.log('Collections vidées')

    // Création d'un admin
    const admin = await User.create({
        name: 'Admin',
        email: 'admin@supchat.local',
        password: 'admin', // ATTENTION : à changer en prod
        role: 'admin',
    })

    // Création d'un workspace
    const workspace = await Workspace.create({
        name: 'Workspace Test',
        description: 'Workspace de test',
        isPublic: true,
        members: [admin._id],
        owner: admin._id,
    })

    // Création d'un channel
    const channel = await Channel.create({
        name: 'général',
        description: 'Canal général',
        workspace: workspace._id,
        type: 'public',
        members: [admin._id],
    })

    // Ajout du channel au workspace
    workspace.channels = [channel._id]
    await workspace.save()

    // Permission admin sur le workspace
    await Permission.create({
        userId: admin._id,
        workspaceId: workspace._id,
        role: 'admin',
        channelRoles: [{ channelId: channel._id, role: 'admin' }],
        permissions: {
            canPost: true,
            canDeleteMessages: true,
            canManageMembers: true,
            canManageChannels: true,
        },
    })

    // Message de bienvenue
    await Message.create({
        text: 'Bienvenue sur SupChat !',
        userId: admin._id,
        channelId: channel._id,
    })

    console.log('Base de données réinitialisée et peuplée.')
    await mongoose.disconnect()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
