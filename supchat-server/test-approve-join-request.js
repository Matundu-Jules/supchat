const mongoose = require('mongoose')
const Workspace = require('./models/Workspace')
const User = require('./models/User')
const Permission = require('./models/Permission')

// Script de test pour vérifier l'approbation des demandes de jointure
async function testApproveJoinRequest() {
    try {
        // Se connecter à MongoDB
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/supchat',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )

        console.log('✅ Connecté à MongoDB')

        // Trouver un workspace public
        const workspace = await Workspace.findOne({ isPublic: true }).populate(
            'owner'
        )
        if (!workspace) {
            console.log('❌ Aucun workspace public trouvé')
            return
        }

        console.log(
            `✅ Workspace trouvé: ${workspace.name} (ID: ${workspace._id})`
        )
        console.log(`📝 Propriétaire: ${workspace.owner.email}`)
        console.log(
            `📋 Demandes actuelles: ${workspace.joinRequests?.length || 0}`
        )

        // Afficher les demandes existantes
        if (workspace.joinRequests && workspace.joinRequests.length > 0) {
            console.log('\n📋 Demandes de jointure existantes:')
            for (const request of workspace.joinRequests) {
                const user = await User.findById(request.userId)
                console.log(
                    `- ${user?.email || request.userId} (${request.requestedAt})`
                )
            }
        } else {
            console.log('\n📋 Aucune demande de jointure en attente')
        }

        // Vérifier les permissions du propriétaire
        const ownerPermission = await Permission.findOne({
            userId: workspace.owner._id,
            workspaceId: workspace._id,
        })

        console.log(
            `🔒 Permission du propriétaire: ${ownerPermission?.role || 'Non trouvée'}`
        )

        console.log('\n✅ Test terminé avec succès')
    } catch (error) {
        console.error('❌ Erreur dans le test:', error)
    } finally {
        await mongoose.disconnect()
        console.log('🔌 Déconnecté de MongoDB')
    }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
    testApproveJoinRequest()
}

module.exports = testApproveJoinRequest
