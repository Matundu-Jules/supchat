const mongoose = require('mongoose')
const Permission = require('../models/Permission')
const User = require('../models/User')
const Workspace = require('../models/Workspace')

// Script pour analyser les données de test et réparer les permissions manquantes

async function analyzeTestData() {
    try {
        console.log('🔍 Analyse des données de test...\n')

        // 1. Lister tous les workspaces
        const workspaces = await Workspace.find({})
        console.log(`🏢 Workspaces trouvés: ${workspaces.length}`)

        for (const workspace of workspaces) {
            console.log(
                `\n📋 Workspace: "${workspace.name}" (${workspace._id})`
            )
            console.log(`   Description: ${workspace.description}`)
            console.log(`   Propriétaire: ${workspace.owner}`)
            console.log(`   Type: ${workspace.type || 'N/A'}`)

            // Permissions dans ce workspace
            const permissions = await Permission.find({
                workspaceId: workspace._id,
            })
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })

            console.log(`   📝 Permissions: ${permissions.length}`)

            if (permissions.length > 0) {
                permissions.forEach((perm, index) => {
                    console.log(
                        `     ${index + 1}. ${perm.userId?.username || perm.userId?.email || 'Utilisateur inconnu'} - Role: ${perm.role}`
                    )
                })
            } else {
                console.log(
                    `     ❌ Aucune permission trouvée dans ce workspace`
                )
            }
        }

        // 2. Lister tous les utilisateurs
        console.log(`\n👥 Analyse des utilisateurs:`)
        const users = await User.find({}).select(
            'username email role createdAt'
        )
        console.log(`Total utilisateurs: ${users.length}`)

        for (const user of users) {
            console.log(`\n👤 Utilisateur: ${user.username || user.email}`)
            console.log(`   Email: ${user.email}`)
            console.log(`   Role global: ${user.role}`)
            console.log(`   Créé le: ${user.createdAt}`)

            // Permissions de cet utilisateur
            const userPermissions = await Permission.find({
                userId: user._id,
            }).populate('workspaceId', 'name')

            console.log(
                `   📝 Permissions dans workspaces: ${userPermissions.length}`
            )
            userPermissions.forEach((perm) => {
                console.log(
                    `     - ${perm.workspaceId?.name || 'Workspace inconnu'}: ${perm.role}`
                )
            })
        }

        // 3. Identifier les problèmes potentiels
        console.log(`\n🔍 Analyse des problèmes potentiels:`)

        // Utilisateurs sans permissions
        const usersWithoutPermissions = []
        for (const user of users) {
            const userPermissions = await Permission.find({ userId: user._id })
            if (userPermissions.length === 0) {
                usersWithoutPermissions.push(user)
            }
        }

        if (usersWithoutPermissions.length > 0) {
            console.log(
                `❌ Utilisateurs sans permissions: ${usersWithoutPermissions.length}`
            )
            usersWithoutPermissions.forEach((user) => {
                console.log(`   - ${user.username || user.email}`)
            })
        } else {
            console.log(`✅ Tous les utilisateurs ont des permissions`)
        }

        // Workspaces sans membres
        const workspacesWithoutMembers = []
        for (const workspace of workspaces) {
            const workspacePermissions = await Permission.find({
                workspaceId: workspace._id,
            })
            if (workspacePermissions.length === 0) {
                workspacesWithoutMembers.push(workspace)
            }
        }

        if (workspacesWithoutMembers.length > 0) {
            console.log(
                `❌ Workspaces sans membres: ${workspacesWithoutMembers.length}`
            )
            workspacesWithoutMembers.forEach((workspace) => {
                console.log(`   - ${workspace.name}`)
            })
        } else {
            console.log(`✅ Tous les workspaces ont des membres`)
        }

        return {
            workspaces: workspaces.length,
            users: users.length,
            usersWithoutPermissions: usersWithoutPermissions.length,
            workspacesWithoutMembers: workspacesWithoutMembers.length,
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'analyse:", error)
    }
}

// Script pour créer des permissions manquantes pour les utilisateurs de test
async function createMissingPermissions() {
    try {
        console.log('🔧 Création des permissions manquantes...\n')

        // Trouver le workspace "Workspace Admin" (celui que vous utilisez)
        const targetWorkspace = await Workspace.findOne({
            name: 'Workspace Admin',
        })
        if (!targetWorkspace) {
            console.log('❌ Workspace "Workspace Admin" non trouvé')
            return
        }

        console.log(
            `🎯 Workspace cible: "${targetWorkspace.name}" (${targetWorkspace._id})`
        )

        // Trouver tous les utilisateurs qui n'ont pas de permission dans ce workspace
        const allUsers = await User.find({})
        const usersWithoutPermissionInWorkspace = []

        for (const user of allUsers) {
            const existingPermission = await Permission.findOne({
                userId: user._id,
                workspaceId: targetWorkspace._id,
            })

            if (!existingPermission) {
                usersWithoutPermissionInWorkspace.push(user)
            }
        }

        console.log(
            `👥 Utilisateurs sans permission dans ce workspace: ${usersWithoutPermissionInWorkspace.length}`
        )

        if (usersWithoutPermissionInWorkspace.length === 0) {
            console.log(
                '✅ Tous les utilisateurs ont déjà des permissions dans ce workspace'
            )
            return
        }

        // Demander confirmation
        const readline = require('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        console.log('\nUtilisateurs qui vont recevoir des permissions:')
        usersWithoutPermissionInWorkspace.forEach((user, index) => {
            console.log(
                `  ${index + 1}. ${user.username || user.email} (${user.role})`
            )
        })

        const shouldCreate = await new Promise((resolve) => {
            rl.question(
                '\n❓ Voulez-vous créer des permissions "membre" pour ces utilisateurs ? (y/N): ',
                (answer) => {
                    resolve(
                        answer.toLowerCase() === 'y' ||
                            answer.toLowerCase() === 'yes'
                    )
                }
            )
        })

        if (shouldCreate) {
            console.log('\n🔧 Création des permissions...')

            let createdCount = 0
            for (const user of usersWithoutPermissionInWorkspace) {
                try {
                    const permission = new Permission({
                        userId: user._id,
                        workspaceId: targetWorkspace._id,
                        role: 'membre',
                        resourceType: 'workspace',
                        permissions: ['post', 'view', 'upload_files', 'react'],
                        channelRoles: [],
                    })

                    await permission.save()
                    console.log(
                        `✅ Permission créée pour ${user.username || user.email}`
                    )
                    createdCount++
                } catch (error) {
                    console.log(
                        `❌ Erreur pour ${user.username || user.email}: ${error.message}`
                    )
                }
            }

            console.log(`\n🎉 ${createdCount} permissions créées avec succès !`)
        } else {
            console.log('\n⏭️  Création annulée.')
        }

        rl.close()
    } catch (error) {
        console.error('❌ Erreur lors de la création des permissions:', error)
    }
}

// Script pour analyser les membres réels vs permissions
async function analyzeMembersVsPermissions() {
    try {
        console.log('🔍 Analyse des membres réels vs permissions...\n')

        // Trouver le workspace "Workspace Admin"
        const workspace = await Workspace.findOne({ name: 'Workspace Admin' })
            .populate('members', 'username email')
            .populate('owner', 'username email')

        if (!workspace) {
            console.log('❌ Workspace "Workspace Admin" non trouvé')
            return
        }

        console.log(`🏢 Workspace: "${workspace.name}"`)
        console.log(
            `👑 Propriétaire: ${workspace.owner?.username || workspace.owner?.email}`
        )
        console.log(
            `👥 Membres réels dans workspace.members: ${workspace.members.length}`
        )

        workspace.members.forEach((member, index) => {
            console.log(`  ${index + 1}. ${member.username || member.email}`)
        })

        // Trouver toutes les permissions pour ce workspace
        const permissions = await Permission.find({
            workspaceId: workspace._id,
        }).populate('userId', 'username email')

        console.log(`\n📝 Permissions dans ce workspace: ${permissions.length}`)
        permissions.forEach((perm, index) => {
            const isRealMember = workspace.members.some(
                (member) => member._id.toString() === perm.userId._id.toString()
            )
            const status = isRealMember
                ? '✅ Membre réel'
                : '❌ Permission sans membership'
            console.log(
                `  ${index + 1}. ${perm.userId.username || perm.userId.email} - ${perm.role} ${status}`
            )
        })

        // Identifier les permissions orphelines (utilisateurs avec permissions mais pas membres)
        const orphanPermissions = permissions.filter(
            (perm) =>
                !workspace.members.some(
                    (member) =>
                        member._id.toString() === perm.userId._id.toString()
                )
        )

        console.log(
            `\n⚠️  Permissions orphelines (non-membres): ${orphanPermissions.length}`
        )
        orphanPermissions.forEach((perm) => {
            console.log(`  - ${perm.userId.username || perm.userId.email}`)
        })

        return {
            workspaceName: workspace.name,
            realMembers: workspace.members.length,
            totalPermissions: permissions.length,
            orphanPermissions: orphanPermissions.length,
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'analyse:", error)
    }
}

// Script pour nettoyer les permissions orphelines (utilisateurs non-membres)
async function cleanOrphanPermissions() {
    try {
        console.log('🧹 Nettoyage des permissions orphelines...\n')

        const workspace = await Workspace.findOne({
            name: 'Workspace Admin',
        }).populate('members', '_id username email')

        if (!workspace) {
            console.log('❌ Workspace "Workspace Admin" non trouvé')
            return
        }

        const memberIds = workspace.members.map((member) =>
            member._id.toString()
        )

        // Trouver les permissions pour des non-membres
        const orphanPermissions = await Permission.find({
            workspaceId: workspace._id,
            userId: { $nin: workspace.members.map((m) => m._id) },
        }).populate('userId', 'username email')

        console.log(
            `🗑️  Permissions orphelines trouvées: ${orphanPermissions.length}`
        )

        if (orphanPermissions.length === 0) {
            console.log('✅ Aucune permission orpheline trouvée')
            return
        }

        orphanPermissions.forEach((perm) => {
            console.log(
                `  - ${perm.userId.username || perm.userId.email} (${perm.role})`
            )
        })

        const readline = require('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        const shouldClean = await new Promise((resolve) => {
            rl.question(
                '\n❓ Voulez-vous supprimer ces permissions orphelines ? (y/N): ',
                (answer) => {
                    resolve(
                        answer.toLowerCase() === 'y' ||
                            answer.toLowerCase() === 'yes'
                    )
                }
            )
        })

        if (shouldClean) {
            const orphanIds = orphanPermissions.map((p) => p._id)
            const deleteResult = await Permission.deleteMany({
                _id: { $in: orphanIds },
            })
            console.log(
                `✅ ${deleteResult.deletedCount} permissions orphelines supprimées !`
            )
        } else {
            console.log('⏭️  Nettoyage annulé.')
        }

        rl.close()
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error)
    }
}

// Fonction pour analyser tous les workspaces
async function analyzeAllWorkspaces() {
    try {
        console.log('🔍 Analyse complète de tous les workspaces...\n')

        const workspaces = await Workspace.find({}).populate(
            'owner',
            'username email'
        )

        console.log(`🏢 Total workspaces: ${workspaces.length}\n`)

        let totalIssues = 0
        const workspaceReports = []

        for (const workspace of workspaces) {
            console.log(`📋 Workspace: "${workspace.name}" (${workspace._id})`)
            console.log(
                `   Type: ${workspace.type || 'N/A'} | Propriétaire: ${workspace.owner?.username || workspace.owner?.email || 'Inconnu'}`
            )

            // Analyser membres vs permissions
            const members = workspace.members || []
            const permissions = await Permission.find({
                workspaceId: workspace._id,
            }).populate('userId', 'username email')

            // Calculer les discordances
            const membersWithPermissions = []
            const membersWithoutPermissions = []
            const permissionsOrphelines = []

            // Vérifier chaque membre
            for (const memberId of members) {
                const memberPermission = permissions.find(
                    (p) =>
                        p.userId &&
                        p.userId._id.toString() === memberId.toString()
                )

                if (memberPermission) {
                    membersWithPermissions.push({
                        userId: memberId,
                        permission: memberPermission,
                        user: memberPermission.userId,
                    })
                } else {
                    // Récupérer les infos du membre
                    const memberInfo = await mongoose
                        .model('User')
                        .findById(memberId)
                    membersWithoutPermissions.push({
                        userId: memberId,
                        user: memberInfo,
                    })
                }
            }

            // Vérifier chaque permission
            for (const permission of permissions) {
                if (permission.userId) {
                    const isMember = members.some(
                        (memberId) =>
                            memberId.toString() ===
                            permission.userId._id.toString()
                    )

                    if (!isMember) {
                        permissionsOrphelines.push(permission)
                    }
                }
            }

            // Afficher les résultats
            console.log(
                `   👥 Membres: ${members.length} | Permissions: ${permissions.length}`
            )
            console.log(
                `   ✅ Membres avec permissions: ${membersWithPermissions.length}`
            )
            console.log(
                `   ❌ Membres sans permissions: ${membersWithoutPermissions.length}`
            )
            console.log(
                `   🗑️  Permissions orphelines: ${permissionsOrphelines.length}`
            )

            // Détailler les problèmes
            if (membersWithoutPermissions.length > 0) {
                console.log(`   📝 Membres sans permissions:`)
                membersWithoutPermissions.forEach((item) => {
                    console.log(
                        `     - ${item.user?.username || item.user?.email || 'Utilisateur inconnu'}`
                    )
                })
            }

            if (permissionsOrphelines.length > 0) {
                console.log(`   📝 Permissions orphelines:`)
                permissionsOrphelines.forEach((perm) => {
                    console.log(
                        `     - ${perm.userId?.username || perm.userId?.email || 'Utilisateur inconnu'} (${perm.role})`
                    )
                })
            }

            const workspaceIssues =
                membersWithoutPermissions.length + permissionsOrphelines.length
            totalIssues += workspaceIssues

            workspaceReports.push({
                workspace,
                membersCount: members.length,
                permissionsCount: permissions.length,
                membersWithPermissions: membersWithPermissions.length,
                membersWithoutPermissions: membersWithoutPermissions.length,
                permissionsOrphelines: permissionsOrphelines.length,
                issues: workspaceIssues,
            })

            console.log(
                `   ${workspaceIssues === 0 ? '✅' : '⚠️'} Statut: ${workspaceIssues === 0 ? 'OK' : workspaceIssues + ' problème(s)'}\n`
            )
        }

        // Résumé global
        console.log(`📊 RÉSUMÉ GLOBAL:`)
        console.log(`   Total workspaces: ${workspaces.length}`)
        console.log(
            `   Workspaces avec problèmes: ${workspaceReports.filter((r) => r.issues > 0).length}`
        )
        console.log(
            `   Workspaces OK: ${workspaceReports.filter((r) => r.issues === 0).length}`
        )
        console.log(`   Total problèmes: ${totalIssues}`)

        if (totalIssues > 0) {
            console.log(`\n🔧 ACTIONS RECOMMANDÉES:`)
            console.log(
                `   1. Nettoyer les permissions orphelines avec: clean-orphans`
            )
            console.log(
                `   2. Créer les permissions manquantes pour les membres`
            )
            console.log(
                `   3. Vérifier la logique d'ajout de membres dans l'API`
            )
        } else {
            console.log(`\n🎉 Tous les workspaces sont cohérents !`)
        }

        return workspaceReports
    } catch (error) {
        console.error("❌ Erreur lors de l'analyse complète:", error)
    }
}

// Fonction pour réparer tous les workspaces
async function fixAllWorkspaces() {
    try {
        console.log('🔧 Réparation de tous les workspaces...\n')

        const workspaces = await Workspace.find({})
        let totalFixed = 0

        for (const workspace of workspaces) {
            console.log(`🔧 Réparation: "${workspace.name}"`)

            const members = workspace.members || []
            const permissions = await Permission.find({
                workspaceId: workspace._id,
            })

            // 1. Supprimer les permissions orphelines
            const orphanPermissions = []
            for (const permission of permissions) {
                if (permission.userId) {
                    const isMember = members.some(
                        (memberId) =>
                            memberId.toString() === permission.userId.toString()
                    )

                    if (!isMember) {
                        orphanPermissions.push(permission)
                    }
                }
            }

            if (orphanPermissions.length > 0) {
                console.log(
                    `   🗑️  Suppression de ${orphanPermissions.length} permissions orphelines...`
                )
                await Permission.deleteMany({
                    _id: { $in: orphanPermissions.map((p) => p._id) },
                })
                totalFixed += orphanPermissions.length
            }

            // 2. Créer les permissions manquantes pour les membres
            const membersWithoutPermissions = []
            for (const memberId of members) {
                const hasPermission = permissions.some(
                    (p) =>
                        p.userId && p.userId.toString() === memberId.toString()
                )

                if (!hasPermission) {
                    membersWithoutPermissions.push(memberId)
                }
            }

            if (membersWithoutPermissions.length > 0) {
                console.log(
                    `   ➕ Création de ${membersWithoutPermissions.length} permissions manquantes...`
                )

                for (const memberId of membersWithoutPermissions) {
                    try {
                        const permission = new Permission({
                            userId: memberId,
                            workspaceId: workspace._id,
                            role: 'membre',
                            resourceType: 'workspace',
                            permissions: [
                                'post',
                                'view',
                                'upload_files',
                                'react',
                            ],
                            channelRoles: [],
                        })

                        await permission.save()
                        totalFixed++
                    } catch (error) {
                        console.log(
                            `     ❌ Erreur pour le membre ${memberId}: ${error.message}`
                        )
                    }
                }
            }

            console.log(`   ✅ Workspace "${workspace.name}" réparé\n`)
        }

        console.log(`🎉 Réparation terminée ! ${totalFixed} éléments corrigés.`)

        return totalFixed
    } catch (error) {
        console.error('❌ Erreur lors de la réparation:', error)
    }
}

// Fonction principale
async function main() {
    // Connexion à MongoDB
    try {
        const host = process.env.MONGO_HOST || 'db'
        const port = process.env.MONGO_PORT || '27017'
        const database = process.env.MONGO_DB || 'supchat'
        const username = process.env.MONGO_INITDB_ROOT_USERNAME
        const password = process.env.MONGO_INITDB_ROOT_PASSWORD
        const authSource = process.env.MONGO_AUTH_SOURCE || 'admin'

        const mongoUri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`

        await mongoose.connect(mongoUri)
        console.log('✅ Connexion à MongoDB établie\n')
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error)
        process.exit(1)
    }

    const action = process.argv[2]

    if (action === 'analyze') {
        await analyzeTestData()
    } else if (action === 'fix') {
        await createMissingPermissions()
    } else if (action === 'analyze-members') {
        await analyzeMembersVsPermissions()
    } else if (action === 'clean-orphans') {
        await cleanOrphanPermissions()
    } else if (action === 'analyze-all') {
        await analyzeAllWorkspaces()
    } else if (action === 'fix-all') {
        await fixAllWorkspaces()
    } else {
        console.log('Usage:')
        console.log(
            '  node analyze-test-data.js analyze        # Analyser les données de test'
        )
        console.log(
            '  node analyze-test-data.js fix            # Créer les permissions manquantes'
        )
        console.log(
            '  node analyze-test-data.js analyze-members # Analyser les membres réels vs permissions'
        )
        console.log(
            '  node analyze-test-data.js clean-orphans   # Nettoyer les permissions orphelines'
        )
        console.log(
            '  node analyze-test-data.js analyze-all     # Analyser tous les workspaces'
        )
        console.log(
            '  node analyze-test-data.js fix-all         # Réparer tous les workspaces'
        )
    }

    await mongoose.disconnect()
    console.log('\n✅ Déconnexion de MongoDB')
}

// Exécution si appelé directement
if (require.main === module) {
    main().catch(console.error)
}

module.exports = {
    analyzeTestData,
    createMissingPermissions,
}
