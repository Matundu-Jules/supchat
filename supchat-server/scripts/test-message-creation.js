const mongoose = require('mongoose')
const path = require('path')

// Charger les variables d'environnement depuis le fichier .env du projet principal
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Importer le modèle Message
const Message = require('../models/Message')

async function testMessageCreation() {
    try {
        // Construire l'URI MongoDB avec authentification
        const mongoHost = process.env.MONGO_HOST || 'localhost'
        const mongoPort = process.env.MONGO_PORT || '27017'
        const mongoDB = process.env.MONGO_DB || 'supchat'
        const mongoUser =
            process.env.MONGO_INITDB_ROOT_USERNAME || 'supchat-admin'
        const mongoPassword = process.env.MONGO_INITDB_ROOT_PASSWORD
        const mongoAuthSource = process.env.MONGO_AUTH_SOURCE || 'admin'

        const mongoUri = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=${mongoAuthSource}`

        console.log('Connexion à MongoDB pour test...')
        await mongoose.connect(mongoUri)
        console.log('Connecté à MongoDB')

        // Test 1: Message sans hashtags
        console.log('\nTest 1: Message sans hashtags')
        const message1 = new Message({
            text: 'Bonjour tout le monde !',
            userId: new mongoose.Types.ObjectId(),
            channelId: new mongoose.Types.ObjectId(),
        })

        await message1.save()
        console.log('✅ Message sans hashtags sauvegardé avec succès')
        console.log('Hashtags:', message1.hashtags) // Test 2: Message avec hashtags
        console.log('\nTest 2: Message avec hashtags')
        const message2 = new Message({
            text: "Salut ! Je travaille sur #nodejs et #mongodb aujourd'hui",
            userId: new mongoose.Types.ObjectId(),
            channelId: new mongoose.Types.ObjectId(),
            hashtags: ['nodejs', 'mongodb'], // Simulation du traitement par le contrôleur
        })

        await message2.save()
        console.log('✅ Message avec hashtags sauvegardé avec succès')
        console.log('Hashtags:', message2.hashtags)

        // Test 3: Message avec texte vide (comme dans l'erreur originale)
        console.log('\nTest 3: Message avec tableau hashtags vide')
        const message3 = new Message({
            text: 'Message simple',
            userId: new mongoose.Types.ObjectId(),
            channelId: new mongoose.Types.ObjectId(),
            hashtags: [], // Ceci devrait être transformé en undefined par le middleware
        })

        await message3.save()
        console.log('✅ Message avec hashtags vides sauvegardé avec succès')
        console.log('Hashtags:', message3.hashtags)

        console.log('\n✅ Tous les tests sont passés ! Le problème est résolu.')

        // Nettoyer les messages de test
        await Message.deleteMany({
            _id: { $in: [message1._id, message2._id, message3._id] },
        })
        console.log('Messages de test supprimés')
    } catch (error) {
        console.error('❌ Erreur lors du test:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Déconnecté de MongoDB')
    }
}

testMessageCreation()
