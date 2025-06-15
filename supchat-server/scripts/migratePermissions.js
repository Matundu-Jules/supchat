/**
 * Script de migration pour mettre à jour les permissions existantes
 * avec les nouvelles propriétés selon les rôles définis
 */

const mongoose = require('mongoose')
const Permission = require('../models/Permission')
const { getDefaultPermissions } = require('../services/rolePermissionService')

const migrationScript = async () => {
    try {
        console.log('🚀 Début de la migration des permissions...')

        // Connexion à la base de données
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/supchat',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )

        console.log('✅ Connexion à la base de données établie')

        // Récupérer toutes les permissions existantes
        const permissions = await Permission.find()
        console.log(`📊 ${permissions.length} permissions à migrer`)

        let migratedCount = 0

        for (const permission of permissions) {
            const defaultPerms = getDefaultPermissions(permission.role)

            // Fusionner les permissions existantes avec les nouvelles par défaut
            const updatedPermissions = {
                ...defaultPerms,
                ...permission.permissions, // Garder les permissions personnalisées existantes
            }

            // Mettre à jour la permission
            await Permission.findByIdAndUpdate(permission._id, {
                permissions: updatedPermissions,
            })

            migratedCount++

            if (migratedCount % 10 === 0) {
                console.log(
                    `⏳ ${migratedCount}/${permissions.length} permissions migrées...`
                )
            }
        }

        console.log(
            `✅ Migration terminée! ${migratedCount} permissions mises à jour`
        )

        // Vérification post-migration
        const adminPerms = await Permission.find({ role: 'admin' }).limit(5)
        const memberPerms = await Permission.find({ role: 'membre' }).limit(5)
        const guestPerms = await Permission.find({ role: 'invité' }).limit(5)

        console.log('\n📋 Vérification des permissions après migration:')
        console.log(
            'Admin permissions sample:',
            adminPerms.length > 0
                ? adminPerms[0].permissions
                : 'Aucun admin trouvé'
        )
        console.log(
            'Member permissions sample:',
            memberPerms.length > 0
                ? memberPerms[0].permissions
                : 'Aucun membre trouvé'
        )
        console.log(
            'Guest permissions sample:',
            guestPerms.length > 0
                ? guestPerms[0].permissions
                : 'Aucun invité trouvé'
        )
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        console.log('👋 Connexion fermée')
    }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
    migrationScript()
        .then(() => {
            console.log('🎉 Migration terminée avec succès!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error)
            process.exit(1)
        })
}

module.exports = migrationScript
