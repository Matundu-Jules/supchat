const mongoose = require('mongoose')
const User = require('./models/User')
const Workspace = require('./models/Workspace')
const Channel = require('./models/Channel')
const Message = require('./models/Message')
const bcrypt = require('bcrypt')
require('dotenv').config()

async function createTestUsers() {
    try {
        // Connexion à la base avec authentification
        const mongoUri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`
        await mongoose.connect(mongoUri)

        console.log('🔗 Connexion à MongoDB réussie')

        // ===== CRÉATION DES UTILISATEURS =====
        console.log('\n📝 Création des utilisateurs...')
        const testUsers = [
            {
                name: 'Admin',
                email: 'admin@admin.fr',
                password: await bcrypt.hash('admin', 10),
                role: 'admin',
            },
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: await bcrypt.hash('user', 10),
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                password: await bcrypt.hash('user', 10),
            },
            {
                name: 'Alice Martin',
                email: 'alice.martin@example.com',
                password: await bcrypt.hash('user', 10),
            },
            {
                name: 'Bob Wilson',
                email: 'bob.wilson@example.com',
                password: await bcrypt.hash('user', 10),
            },
            {
                name: 'Charlie Brown',
                email: 'charlie.brown@example.com',
                password: await bcrypt.hash('user', 10),
            },
            {
                name: 'David Taylor',
                email: 'david.taylor@example.com',
                password: await bcrypt.hash('user', 10),
            },
            {
                name: 'Emma Garcia',
                email: 'emma.garcia@example.com',
                password: await bcrypt.hash('user', 10),
            },
        ]

        for (const userData of testUsers) {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findOne({ email: userData.email })
            if (existingUser) {
                // Correction : forcer le status à offline si déjà existant
                if (existingUser.status !== 'offline') {
                    existingUser.status = 'offline'
                    await existingUser.save()
                    console.log(`Utilisateur ${userData.email} mis hors ligne`)
                } else {
                    console.log(`Utilisateur ${userData.email} existe déjà`)
                }
            } else {
                // Création avec status offline par défaut
                const newUser = new User({ ...userData, status: 'offline' })
                await newUser.save()
                console.log(`Utilisateur créé: ${userData.email}`)
            }
        }

        // ===== CRÉATION DES WORKSPACES DE TEST =====
        console.log('\n🏢 Création des workspaces de test...')

        const users = await User.find({})
        const admin = users.find((u) => u.email === 'admin@admin.fr')
        const john = users.find((u) => u.email === 'john.doe@example.com')
        const jane = users.find((u) => u.email === 'jane.smith@example.com')
        const alice = users.find((u) => u.email === 'alice.martin@example.com')
        const bob = users.find((u) => u.email === 'bob.wilson@example.com')

        const testWorkspaces = [
            {
                name: 'Workspace Public Test',
                description:
                    'Un workspace public pour les tests de collaboration',
                isPublic: true,
                type: 'public',
                owner: admin._id,
                members: [admin._id, john._id, jane._id, alice._id],
            },
            {
                name: 'Workspace Privé Équipe',
                description:
                    "Un workspace privé pour l'équipe de développement",
                isPublic: false,
                type: 'private',
                owner: john._id,
                members: [john._id, jane._id, bob._id],
            },
            {
                name: 'Marketing & Communication',
                description:
                    'Espace dédié aux campagnes marketing et communication',
                isPublic: true,
                type: 'public',
                owner: jane._id,
                members: [jane._id, alice._id, admin._id],
            },
            {
                name: 'Projet Secret',
                description: 'Projet confidentiel - accès restreint',
                isPublic: false,
                type: 'private',
                owner: alice._id,
                members: [alice._id, admin._id],
            },
        ]

        const createdWorkspaces = []
        for (const workspaceData of testWorkspaces) {
            const existingWorkspace = await Workspace.findOne({
                name: workspaceData.name,
            })
            if (existingWorkspace) {
                console.log(`Workspace "${workspaceData.name}" existe déjà`)
                createdWorkspaces.push(existingWorkspace)
            } else {
                const newWorkspace = new Workspace(workspaceData)
                await newWorkspace.save()
                createdWorkspaces.push(newWorkspace)
                console.log(`Workspace créé: "${workspaceData.name}"`)
            }
        } // ===== CRÉATION DES CHANNELS DE TEST =====
        console.log('\n📺 Création des channels de test...')

        for (const workspace of createdWorkspaces) {
            const testChannels = [
                {
                    name: 'général',
                    description: 'Channel général pour les discussions',
                    isPublic: true,
                    type: 'public',
                    workspace: workspace._id,
                    createdBy: workspace.owner,
                    members: workspace.members,
                },
                {
                    name: 'annonces',
                    description: 'Canal pour les annonces importantes',
                    isPublic: true,
                    type: 'public',
                    workspace: workspace._id,
                    createdBy: workspace.owner,
                    members: workspace.members,
                },
            ]

            // Ajouter un channel privé pour les workspaces avec plus de 2 membres
            if (workspace.members.length > 2) {
                testChannels.push({
                    name: 'équipe-core',
                    description: "Channel privé pour l'équipe principale",
                    isPublic: false,
                    type: 'private',
                    workspace: workspace._id,
                    createdBy: workspace.owner,
                    members: workspace.members.slice(0, 2), // Seulement les 2 premiers membres
                })
            }

            for (const channelData of testChannels) {
                const existingChannel = await Channel.findOne({
                    name: channelData.name,
                    workspace: workspace._id,
                })
                if (existingChannel) {
                    console.log(
                        `Channel "${channelData.name}" existe déjà dans "${workspace.name}"`
                    )
                } else {
                    const newChannel = new Channel(channelData)
                    await newChannel.save()

                    // Ajouter le channel au workspace
                    workspace.channels.push(newChannel._id)
                    await workspace.save()

                    console.log(
                        `Channel créé: "${channelData.name}" dans "${workspace.name}"`
                    )
                }
            }
        }

        // ===== CRÉATION DE MESSAGES DE TEST =====
        console.log('\n💬 Création des messages de test...')

        const channels = await Channel.find({}).populate('workspace')
        const sampleMessages = [
            'Bonjour tout le monde ! 👋',
            "Comment ça va aujourd'hui ?",
            "Quelqu'un a des nouvelles du projet ?",
            'Réunion prévue à 14h en salle de conférence',
            "N'oubliez pas de valider vos timesheet 📝",
            'Excellent travail sur la dernière fonctionnalité ! 🎉',
            'Des questions sur les nouvelles spécifications ?',
            'Coffee break dans 10 minutes ☕',
        ]

        for (const channel of channels.slice(0, 3)) {
            // Seulement les 3 premiers channels
            for (let i = 0; i < 3; i++) {
                const randomUser =
                    channel.members[
                        Math.floor(Math.random() * channel.members.length)
                    ]
                const randomMessage =
                    sampleMessages[
                        Math.floor(Math.random() * sampleMessages.length)
                    ]

                const existingMessage = await Message.findOne({
                    content: randomMessage,
                    channel: channel._id,
                })

                if (!existingMessage) {
                    const newMessage = new Message({
                        content: randomMessage,
                        author: randomUser,
                        channel: channel._id,
                        workspace: channel.workspace._id,
                        createdAt: new Date(
                            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
                        ), // Messages des 7 derniers jours
                    })
                    await newMessage.save()
                    console.log(
                        `Message créé dans "${channel.name}": "${randomMessage.substring(0, 30)}..."`
                    )
                }
            }
        } // Lister tous les utilisateurs
        const allUsers = await User.find({}).select('email name createdAt')
        console.log('\n👥 Utilisateurs en base:')
        allUsers.forEach((user) => {
            console.log(`- ${user.email} (${user.name})`)
        })

        // Lister tous les workspaces
        const allWorkspaces = await Workspace.find({}).populate(
            'owner',
            'name email'
        )
        console.log('\n🏢 Workspaces créés:')
        allWorkspaces.forEach((workspace) => {
            console.log(
                `- "${workspace.name}" (${workspace.type}) - Owner: ${workspace.owner.name}`
            )
        }) // Lister tous les channels
        const allChannels = await Channel.find({}).populate('workspace', 'name')
        console.log('\n📺 Channels créés:')
        allChannels.forEach((channel) => {
            // Vérifier que le workspace existe avant d'accéder à ses propriétés
            if (channel.workspace && channel.workspace.name) {
                console.log(
                    `- "${channel.name}" (${channel.type}) in "${channel.workspace.name}"`
                )
            } else {
                console.log(
                    `- "${channel.name}" (${channel.type}) in [workspace supprimé]`
                )
            }
        })

        console.log('\n🎉 Données de test créées avec succès !')
        console.log('\n📋 Comptes de connexion:')
        console.log('┌─────────────────────────┬──────────┬─────────┐')
        console.log('│ Email                   │ Password │ Role    │')
        console.log('├─────────────────────────┼──────────┼─────────┤')
        console.log('│ admin@admin.fr          │ admin    │ admin   │')
        console.log('│ john.doe@example.com    │ user     │ user    │')
        console.log('│ jane.smith@example.com  │ user     │ user    │')
        console.log('│ alice.martin@example.com│ user     │ user    │')
        console.log('│ bob.wilson@example.com  │ user     │ user    │')
        console.log('│ charlie.brown@example.com│ user    │ user    │')
        console.log('│ david.taylor@example.com│ user     │ user    │')
        console.log('│ emma.garcia@example.com │ user     │ user    │')
        console.log('└─────────────────────────┴──────────┴─────────┘')

        await mongoose.connection.close()
        console.log('\n✅ Terminé!')
    } catch (error) {
        console.error('❌ Erreur:', error)
        process.exit(1)
    }
}

createTestUsers()
