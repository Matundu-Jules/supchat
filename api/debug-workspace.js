const mongoose = require('mongoose')
const User = require('./models/User')
const workspaceService = require('./services/workspaceService')
require('dotenv').config()

async function debugWorkspaceAccess() {
    try {
        const mongoUri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`
        await mongoose.connect(mongoUri)
        console.log('🔗 Connexion à MongoDB réussie')

        // Récupérer l'admin
        const admin = await User.findOne({ email: 'admin@admin.fr' })
        console.log('👤 Admin trouvé:', {
            id: admin._id,
            email: admin.email,
            role: admin.role,
        })

        // Tester le service workspaceService avec l'admin
        console.log('\n🔍 Test du service workspaceService...')
        const workspaces = await workspaceService.findByUser(admin)

        console.log(`\n📊 Résultat: ${workspaces.length} workspaces trouvés`)
        workspaces.forEach((ws) => {
            console.log(
                `- ${ws.name} (${
                    ws.type || (ws.isPublic ? 'public' : 'private')
                }) - Owner: ${ws.owner.name || ws.owner.email}`
            )
        })

        await mongoose.connection.close()
        console.log('\n✅ Test terminé')
    } catch (error) {
        console.error('❌ Erreur:', error)
        process.exit(1)
    }
}

debugWorkspaceAccess()
