const mongoose = require('mongoose')
const path = require('path')

// Charger les variables d'environnement depuis le fichier .env du projet principal
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

async function fixMessageIndexes() {
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

        console.log('Tentative de connexion à MongoDB...')
        console.log('Host:', mongoHost)
        console.log('Port:', mongoPort)
        console.log('Database:', mongoDB)
        console.log('User:', mongoUser)

        await mongoose.connect(mongoUri)
        console.log('Connecté à MongoDB')

        const db = mongoose.connection.db
        const collection = db.collection('messages')

        // Lister les index existants
        const indexes = await collection.indexes()
        console.log('Index existants sur messages:')
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}:`, index.key)
        })

        // Supprimer tous les index de texte qui incluent hashtags
        for (const index of indexes) {
            if (
                index.key &&
                (index.key.hashtags === 'text' ||
                    (typeof index.key === 'object' &&
                        Object.values(index.key).includes('text') &&
                        index.key.hashtags))
            ) {
                console.log(
                    `Suppression de l'index problématique: ${index.name}`
                )
                try {
                    await collection.dropIndex(index.name)
                    console.log(`Index ${index.name} supprimé avec succès`)
                } catch (err) {
                    console.log(
                        `Erreur lors de la suppression de l'index ${index.name}:`,
                        err.message
                    )
                }
            }
        }

        // Recréer les index corrects
        console.log('Recréation des index corrects...')

        // Index de texte seulement sur le champ text
        try {
            await collection.createIndex({ text: 'text' })
            console.log('Index de texte créé sur le champ text')
        } catch (err) {
            console.log('Index de texte existe déjà ou erreur:', err.message)
        }

        // Index simple sur hashtags
        try {
            await collection.createIndex({ hashtags: 1 })
            console.log('Index simple créé sur le champ hashtags')
        } catch (err) {
            console.log('Index hashtags existe déjà ou erreur:', err.message)
        }

        // Index pour les requêtes par canal
        try {
            await collection.createIndex({ channelId: 1, createdAt: -1 })
            console.log('Index créé sur channelId et createdAt')
        } catch (err) {
            console.log(
                'Index channelId/createdAt existe déjà ou erreur:',
                err.message
            )
        }

        console.log('Correction des index terminée avec succès')
    } catch (error) {
        console.error('Erreur lors de la correction des index:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Déconnecté de MongoDB')
    }
}

fixMessageIndexes()
