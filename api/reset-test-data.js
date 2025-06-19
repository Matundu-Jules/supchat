const mongoose = require('mongoose')
const User = require('./models/User')
const Workspace = require('./models/Workspace')
const Channel = require('./models/Channel')
const Message = require('./models/Message')
const bcrypt = require('bcrypt')
require('dotenv').config()

async function resetTestData() {
    try {
        // Connexion à la base avec authentification
        const mongoUri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`
        await mongoose.connect(mongoUri)

        console.log('🔗 Connexion à MongoDB réussie')

        // ===== SUPPRESSION COMPLÈTE DES DONNÉES =====
        console.log('\n🗑️ Suppression de toutes les données existantes...')
        await Message.deleteMany({})
        console.log('✅ Messages supprimés')

        await Channel.deleteMany({})
        console.log('✅ Channels supprimés')

        await Workspace.deleteMany({})
        console.log('✅ Workspaces supprimés')

        await User.deleteMany({})
        console.log('✅ Utilisateurs supprimés')

        // ===== CRÉATION DES UTILISATEURS DE TEST =====
        console.log('\n📝 Création des nouveaux utilisateurs de test...')
        const testUsers = [
            {
                name: 'Admin',
                email: 'admin@admin.fr',
                password: await bcrypt.hash('admin', 10),
                role: 'admin',
                status: 'offline',
            },
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
            {
                name: 'Alice Martin',
                email: 'alice.martin@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
            {
                name: 'Bob Wilson',
                email: 'bob.wilson@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
            {
                name: 'Charlie Brown',
                email: 'charlie.brown@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
            {
                name: 'David Taylor',
                email: 'david.taylor@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
            {
                name: 'Emma Garcia',
                email: 'emma.garcia@example.com',
                password: await bcrypt.hash('user', 10),
                role: 'user',
                status: 'offline',
            },
        ]

        const createdUsers = await User.insertMany(testUsers)
        console.log(`✅ ${createdUsers.length} utilisateurs créés`)

        // ===== CRÉATION DES WORKSPACES DE TEST =====
        console.log('\n🏢 Création des workspaces de test...')

        const admin = createdUsers.find((u) => u.email === 'admin@admin.fr')
        const john = createdUsers.find(
            (u) => u.email === 'john.doe@example.com'
        )
        const jane = createdUsers.find(
            (u) => u.email === 'jane.smith@example.com'
        )
        const alice = createdUsers.find(
            (u) => u.email === 'alice.martin@example.com'
        )
        const bob = createdUsers.find(
            (u) => u.email === 'bob.wilson@example.com'
        )

        // Fonction pour générer une URL de workspace unique
        const generateWorkspaceUrl = (name) => {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '') // Supprimer caractères spéciaux
                .replace(/\s+/g, '-') // Remplacer espaces par tirets
                .substring(0, 50) // Limiter la longueur
        }

        const testWorkspaces = [
            {
                name: 'Workspace Public Test',
                description:
                    'Un workspace public pour les tests de collaboration',
                url: generateWorkspaceUrl('Workspace Public Test'),
                isPublic: true,
                type: 'public',
                owner: admin._id,
                members: [admin._id, john._id, jane._id, alice._id],
            },
            {
                name: 'Workspace Privé Équipe',
                description:
                    "Un workspace privé pour l'équipe de développement",
                url: generateWorkspaceUrl('Workspace Privé Équipe'),
                isPublic: false,
                type: 'private',
                owner: john._id,
                members: [john._id, jane._id, bob._id],
            },
            {
                name: 'Marketing & Communication',
                description:
                    'Espace dédié aux campagnes marketing et communication',
                url: generateWorkspaceUrl('Marketing & Communication'),
                isPublic: true,
                type: 'public',
                owner: jane._id,
                members: [jane._id, alice._id, admin._id],
            },
            {
                name: 'Projet Secret',
                description: 'Projet confidentiel - accès restreint',
                url: generateWorkspaceUrl('Projet Secret'),
                isPublic: false,
                type: 'private',
                owner: alice._id,
                members: [alice._id, admin._id],
            },
        ]

        const createdWorkspaces = await Workspace.insertMany(testWorkspaces)
        console.log(`✅ ${createdWorkspaces.length} workspaces créés`)

        // ===== CRÉATION DES CHANNELS DE TEST =====
        console.log('\n📺 Création des channels de test...')

        const channelsToCreate = []

        for (const workspace of createdWorkspaces) {
            const testChannels = [
                {
                    name: 'général',
                    description: 'Channel général pour discussions ouvertes',
                    type: 'public',
                    workspace: workspace._id,
                    members: workspace.members,
                },
                {
                    name: 'annonces',
                    description: 'Channel pour les annonces importantes',
                    type: 'public',
                    workspace: workspace._id,
                    members: workspace.members,
                },
                {
                    name: 'équipe-core',
                    description: "Channel privé pour l'équipe principale",
                    type: 'private',
                    workspace: workspace._id,
                    members: [workspace.owner], // Seul le owner au début
                },
            ]

            channelsToCreate.push(...testChannels)
        }

        const createdChannels = await Channel.insertMany(channelsToCreate)
        console.log(`✅ ${createdChannels.length} channels créés`)

        // ===== CRÉATION DES MESSAGES DE TEST =====
        console.log('\n💬 Création des messages de test...')

        const messagesToCreate = []

        // Ajouter quelques messages dans les channels "annonces"
        const annonceChannels = createdChannels.filter(
            (c) => c.name === 'annonces'
        )

        for (const channel of annonceChannels.slice(0, 2)) {
            // Seulement dans les 2 premiers
            const workspace = createdWorkspaces.find((w) =>
                w._id.equals(channel.workspace)
            )
            const owner = createdUsers.find((u) =>
                u._id.equals(workspace.owner)
            )

            messagesToCreate.push({
                content: `🎉 Bienvenue dans le workspace "${workspace.name}" ! N'hésitez pas à vous présenter.`,
                author: owner._id,
                channel: channel._id,
                workspace: workspace._id,
                createdAt: new Date(Date.now() - 3600000), // Il y a 1 heure
            })

            messagesToCreate.push({
                content: `📅 Réunion d'équipe prévue demain à 14h en salle de réunion virtuelle.`,
                author: admin._id,
                channel: channel._id,
                workspace: workspace._id,
                createdAt: new Date(Date.now() - 1800000), // Il y a 30 minutes
            })
        }

        const createdMessages = await Message.insertMany(messagesToCreate)
        console.log(`✅ ${createdMessages.length} messages créés`)

        // ===== AFFICHAGE DU RÉSUMÉ =====
        console.log('\n🎉 Reset et création des données de test terminés !')
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

        console.log('\n🏢 Workspaces créés:')
        createdWorkspaces.forEach((workspace) => {
            const owner = createdUsers.find((u) =>
                u._id.equals(workspace.owner)
            )
            console.log(
                `- "${workspace.name}" (${workspace.type}) - URL: /${workspace.url} - Owner: ${owner.name}`
            )
        })

        console.log('\n📺 Channels créés:')
        createdChannels.forEach((channel) => {
            const workspace = createdWorkspaces.find((w) =>
                w._id.equals(channel.workspace)
            )
            console.log(
                `- "${channel.name}" (${channel.type}) in "${workspace.name}"`
            )
        })

        console.log(`\n💬 ${createdMessages.length} messages de test créés`)

        await mongoose.connection.close()
        console.log(
            '\n✅ Terminé! Votre base de données a été complètement réinitialisée.'
        )
    } catch (error) {
        console.error('❌ Erreur:', error)
        process.exit(1)
    }
}

resetTestData()
