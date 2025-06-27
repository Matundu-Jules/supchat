#!/usr/bin/env node

/**
 * Script de nettoyage de TOUS les fichiers non utilisés
 * Usage: node scripts/cleanup-avatars.js [--dry-run]
 */

require('dotenv').config()

const FileService = require('../services/fileService')
const User = require('../models/User')
const Message = require('../models/Message')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

console.log(`\n🧹 Nettoyage de TOUS les fichiers non utilisés`)
console.log(`🔍 Mode: ${isDryRun ? 'SIMULATION' : 'SUPPRESSION RÉELLE'}`)
console.log('')

async function cleanupAllFiles() {
    try {
        // Connexion MongoDB
        let mongoUri = process.env.MONGODB_URI
        if (!mongoUri) {
            const host = process.env.MONGO_HOST || 'localhost'
            const port = process.env.MONGO_PORT || '27017'
            const dbName = process.env.MONGO_DB || 'supchat'
            const username = process.env.MONGO_INITDB_ROOT_USERNAME
            const password = process.env.MONGO_INITDB_ROOT_PASSWORD

            mongoUri =
                username && password
                    ? `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`
                    : `mongodb://${host}:${port}/${dbName}`
        }

        console.log(`🔌 Connexion à MongoDB...`)
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
        console.log('✅ Connexion MongoDB établie')

        // Récupérer TOUS les fichiers utilisés partout
        console.log('🔍 Scan des fichiers utilisés...')

        // 1. Avatars utilisateurs
        const users = await User.find(
            { avatar: { $ne: '', $exists: true } },
            'avatar'
        )
        const usedFiles = new Set()

        users.forEach((user) => {
            if (user.avatar) usedFiles.add(user.avatar)
        })
        console.log(`👤 ${usedFiles.size} avatars utilisateurs`)

        // 2. Fichiers dans les messages (content et attachments)
        const messages = await Message.find({}, 'content attachments')
        let messageFiles = 0

        messages.forEach((msg) => {
            // Chercher les URLs de fichiers dans le contenu
            if (msg.content) {
                const fileMatches = msg.content.match(/\/uploads\/[^\s"')]+/g)
                if (fileMatches) {
                    fileMatches.forEach((url) => {
                        usedFiles.add(url)
                        messageFiles++
                    })
                }
            }

            // Vérifier les attachments
            if (msg.attachments && Array.isArray(msg.attachments)) {
                msg.attachments.forEach((att) => {
                    if (att.url) {
                        usedFiles.add(att.url)
                        messageFiles++
                    }
                    if (att.path) {
                        usedFiles.add(att.path)
                        messageFiles++
                    }
                })
            }
        })

        console.log(`💬 ${messageFiles} fichiers dans les messages`)
        console.log(`📊 TOTAL: ${usedFiles.size} fichiers utilisés en base`)

        // Scanner le dossier uploads
        const uploadsDir = path.join(__dirname, '../uploads')
        if (!fs.existsSync(uploadsDir)) {
            console.log('❌ Dossier uploads introuvable')
            return
        }

        const allFiles = fs.readdirSync(uploadsDir)
        console.log(`📁 ${allFiles.length} fichiers dans /uploads`)

        let deletedCount = 0
        let orphanedFiles = []
        let totalSize = 0

        // Supprimer TOUS les fichiers non utilisés (pas de limite de date)
        for (const file of allFiles) {
            // Ignorer les fichiers système
            if (file.startsWith('.') || file.startsWith('default-')) continue

            const filePath = path.join(uploadsDir, file)

            try {
                const stats = fs.statSync(filePath)

                // Ignorer les dossiers
                if (!stats.isFile()) continue

                const fileUrl = `/uploads/${file}`

                // Si le fichier n'est pas utilisé nulle part = SUPPRIMER
                if (!usedFiles.has(fileUrl)) {
                    orphanedFiles.push({
                        file,
                        path: filePath,
                        size: stats.size,
                    })
                    totalSize += stats.size

                    console.log(
                        `🗑️  ${file} (${(stats.size / 1024).toFixed(1)} KB)`
                    )

                    if (!isDryRun) {
                        try {
                            fs.unlinkSync(filePath)
                            deletedCount++
                        } catch (error) {
                            console.error(
                                `❌ Erreur suppression ${file}:`,
                                error.message
                            )
                        }
                    }
                }
            } catch (error) {
                console.error(`⚠️ Erreur lecture ${file}:`, error.message)
            }
        }

        // Rapport final
        console.log(`\n📋 RÉSULTAT`)
        console.log('=================')
        console.log(`🔍 Fichiers orphelins: ${orphanedFiles.length}`)
        console.log(
            `💾 Espace total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`
        )

        if (isDryRun) {
            console.log(
                `\n💡 Pour SUPPRIMER ces fichiers: npm run cleanup:avatars`
            )
        } else {
            console.log(`✅ Fichiers supprimés: ${deletedCount}`)
            if (deletedCount > 0) {
                console.log(
                    `💾 Espace libéré: ${(totalSize / 1024 / 1024).toFixed(2)} MB`
                )
            }
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message)

        if (error.name && error.name.includes('Mongo')) {
            console.error(
                '💡 Vérifiez que MongoDB est démarré (docker-compose -f docker-compose.development.yml up db)'
            )
        }

        process.exit(1)
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect()
            console.log('🔌 Déconnexion MongoDB')
        }
    }
}

// Exécution
if (require.main === module) {
    cleanupAllFiles()
        .then(() => {
            console.log('\n✅ Terminé!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('\n❌ Erreur critique:', error.message)
            process.exit(1)
        })
}

module.exports = cleanupAllFiles
