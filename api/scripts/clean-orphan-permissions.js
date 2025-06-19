const mongoose = require('mongoose')
const Permission = require('../models/Permission')
const User = require('../models/User')
const Workspace = require('../models/Workspace')

// Script pour nettoyer les permissions orphelines (avec userId null ou inexistant)

async function cleanOrphanPermissions() {
    try {
        console.log('🔍 Démarrage du nettoyage des permissions orphelines...\n')

        // 1. Trouver toutes les permissions avec userId null
        const permissionsWithNullUserId = await Permission.find({
            userId: null,
        })
        console.log(
            `❌ Permissions avec userId null trouvées: ${permissionsWithNullUserId.length}`
        )

        if (permissionsWithNullUserId.length > 0) {
            console.log('Détails des permissions avec userId null:')
            permissionsWithNullUserId.forEach((perm, index) => {
                console.log(
                    `  ${index + 1}. ID: ${perm._id}, WorkspaceId: ${perm.workspaceId}, Role: ${perm.role}`
                )
            })
        }

        // 2. Trouver toutes les permissions et vérifier si les utilisateurs existent
        const allPermissions = await Permission.find({})
        console.log(
            `\n📊 Total des permissions dans la base: ${allPermissions.length}`
        )

        const orphanPermissions = []

        for (const permission of allPermissions) {
            if (permission.userId === null) {
                orphanPermissions.push(permission)
                continue
            }

            // Vérifier si l'utilisateur existe
            const userExists = await User.findById(permission.userId)
            if (!userExists) {
                orphanPermissions.push(permission)
                console.log(
                    `❌ Permission orpheline trouvée - User ID ${permission.userId} n'existe pas`
                )
            }
        }

        console.log(
            `\n🗑️  Total des permissions orphelines: ${orphanPermissions.length}`
        )

        // 3. Afficher les workspaces affectés
        const affectedWorkspaces = [
            ...new Set(
                orphanPermissions
                    .map((p) => p.workspaceId?.toString())
                    .filter(Boolean)
            ),
        ]
        console.log(`\n🏢 Workspaces affectés: ${affectedWorkspaces.length}`)

        for (const workspaceId of affectedWorkspaces) {
            const workspace = await Workspace.findById(workspaceId)
            const orphanCount = orphanPermissions.filter(
                (p) => p.workspaceId?.toString() === workspaceId
            ).length
            console.log(
                `  - ${workspace?.name || 'Workspace inconnu'} (${workspaceId}): ${orphanCount} permissions orphelines`
            )
        }

        // 4. Option de nettoyage
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
            console.log('\n🧹 Suppression des permissions orphelines...')

            const orphanIds = orphanPermissions.map((p) => p._id)
            const deleteResult = await Permission.deleteMany({
                _id: { $in: orphanIds },
            })

            console.log(
                `✅ ${deleteResult.deletedCount} permissions orphelines supprimées avec succès !`
            )

            // Vérification finale
            const remainingOrphans = await Permission.find({ userId: null })
            console.log(
                `\n📊 Permissions avec userId null restantes: ${remainingOrphans.length}`
            )
        } else {
            console.log(
                "\n⏭️  Nettoyage annulé. Les permissions orphelines n'ont pas été supprimées."
            )
        }

        rl.close()
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage des permissions:', error)
    }
}

// Script de diagnostic seul (sans suppression)
async function diagnoseOrphanPermissions() {
    try {
        console.log('🔍 Diagnostic des permissions orphelines...\n')

        // Statistiques générales
        const totalPermissions = await Permission.countDocuments()
        const nullUserIdPermissions = await Permission.countDocuments({
            userId: null,
        })
        const totalUsers = await User.countDocuments()
        const totalWorkspaces = await Workspace.countDocuments()

        console.log('📊 Statistiques générales:')
        console.log(`  - Total permissions: ${totalPermissions}`)
        console.log(
            `  - Permissions avec userId null: ${nullUserIdPermissions}`
        )
        console.log(`  - Total utilisateurs: ${totalUsers}`)
        console.log(`  - Total workspaces: ${totalWorkspaces}`)

        // Détail des permissions avec userId null
        if (nullUserIdPermissions > 0) {
            console.log('\n❌ Détail des permissions avec userId null:')
            const nullPermissions = await Permission.find({
                userId: null,
            }).populate('workspaceId', 'name')

            nullPermissions.forEach((perm, index) => {
                console.log(`  ${index + 1}. ID: ${perm._id}`)
                console.log(
                    `     Workspace: ${perm.workspaceId?.name || 'Inconnu'} (${perm.workspaceId?._id})`
                )
                console.log(`     Role: ${perm.role}`)
                console.log(`     Date création: ${perm.createdAt}`)
                console.log(
                    `     Permissions: [${perm.permissions.join(', ')}]`
                )
                console.log('')
            })
        }

        return {
            totalPermissions,
            nullUserIdPermissions,
            totalUsers,
            totalWorkspaces,
        }
    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error)
    }
}

// Script de diagnostic avancé avec populate
async function diagnoseWithPopulate() {
    try {
        console.log('🔍 Diagnostic avancé avec populate...\n')

        // Récupérer les permissions avec populate comme l'API
        const permissionsWithPopulate = await Permission.find({})
            .populate('userId', 'username email avatar')
            .populate('workspaceId', 'name description')
            .sort({ createdAt: -1 })

        console.log(
            `📊 Total permissions avec populate: ${permissionsWithPopulate.length}`
        )

        // Analyser les résultats
        const nullUserIdAfterPopulate = permissionsWithPopulate.filter(
            (p) => p.userId === null
        )
        const validUserIdAfterPopulate = permissionsWithPopulate.filter(
            (p) => p.userId !== null
        )

        console.log(
            `❌ Permissions avec userId null après populate: ${nullUserIdAfterPopulate.length}`
        )
        console.log(
            `✅ Permissions avec userId valide après populate: ${validUserIdAfterPopulate.length}`
        )

        if (nullUserIdAfterPopulate.length > 0) {
            console.log(
                '\n❌ Détail des permissions avec userId null après populate:'
            )
            nullUserIdAfterPopulate.forEach((perm, index) => {
                console.log(`  ${index + 1}. ID: ${perm._id}`)
                console.log(
                    `     WorkspaceId avant populate: ${perm.workspaceId?._id || perm.workspaceId}`
                )
                console.log(
                    `     Workspace: ${perm.workspaceId?.name || 'Inconnu'}`
                )
                console.log(`     Role: ${perm.role}`)
                console.log(`     Date création: ${perm.createdAt}`)
                console.log('')
            })

            // Vérifier les permissions brutes pour ces cas
            console.log(
                '\n🔍 Vérification des données brutes pour ces permissions:'
            )
            for (const perm of nullUserIdAfterPopulate) {
                const rawPerm = await Permission.findById(perm._id)
                console.log(`  Permission ${perm._id}:`)
                console.log(`    userId brut: ${rawPerm.userId}`)
                console.log(`    userId type: ${typeof rawPerm.userId}`)

                if (rawPerm.userId) {
                    const userExists = await User.findById(rawPerm.userId)
                    console.log(
                        `    Utilisateur existe: ${userExists ? 'Oui' : 'Non'}`
                    )
                    if (userExists) {
                        console.log(
                            `    User: ${userExists.username || userExists.email}`
                        )
                    }
                }
                console.log('')
            }
        }

        // Simuler la réponse API exacte
        console.log('\n🎯 Simulation de la réponse API:')
        const apiResponse = JSON.stringify(permissionsWithPopulate, null, 2)
        console.log('Sample de la première permission:')
        if (permissionsWithPopulate.length > 0) {
            console.log(JSON.stringify(permissionsWithPopulate[0], null, 2))
        }

        return {
            total: permissionsWithPopulate.length,
            nullUserId: nullUserIdAfterPopulate.length,
            validUserId: validUserIdAfterPopulate.length,
        }
    } catch (error) {
        console.error('❌ Erreur lors du diagnostic avancé:', error)
    }
}

// Fonction principale
async function main() {
    // Connexion à MongoDB
    try {
        // Construire l'URI MongoDB avec authentification
        let mongoUri

        if (process.env.MONGODB_URI) {
            mongoUri = process.env.MONGODB_URI
        } else {
            // Construire l'URI à partir des variables d'environnement
            const host = process.env.MONGO_HOST || 'db'
            const port = process.env.MONGO_PORT || '27017'
            const database = process.env.MONGO_DB || 'supchat'
            const username = process.env.MONGO_INITDB_ROOT_USERNAME
            const password = process.env.MONGO_INITDB_ROOT_PASSWORD
            const authSource = process.env.MONGO_AUTH_SOURCE || 'admin'

            if (username && password) {
                mongoUri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`
            } else {
                mongoUri = `mongodb://${host}:${port}/${database}`
            }
        }

        console.log(
            `🔗 Connexion à MongoDB: ${mongoUri.replace(/\/\/.*:.*@/, '//***:***@')}\n`
        )

        await mongoose.connect(mongoUri)
        console.log('✅ Connexion à MongoDB établie\n')
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error)
        process.exit(1)
    }

    const action = process.argv[2]

    if (action === 'diagnose') {
        await diagnoseOrphanPermissions()
    } else if (action === 'clean') {
        await cleanOrphanPermissions()
    } else if (action === 'diagnose-populate') {
        await diagnoseWithPopulate()
    } else {
        console.log('Usage:')
        console.log(
            '  node clean-orphan-permissions.js diagnose          # Diagnostic seul'
        )
        console.log(
            '  node clean-orphan-permissions.js clean             # Diagnostic + nettoyage interactif'
        )
        console.log(
            '  node clean-orphan-permissions.js diagnose-populate # Diagnostic avancé avec populate'
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
    cleanOrphanPermissions,
    diagnoseOrphanPermissions,
}
