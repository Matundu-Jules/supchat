// Test rapide pour vérifier le modèle Notification
const mongoose = require('mongoose')
const Notification = require('./models/Notification')

async function testNotificationModel() {
    console.log('🔍 Test du modèle Notification...')

    // Test de création d'une notification join_approved
    const testNotification = new Notification({
        userId: new mongoose.Types.ObjectId(),
        type: 'join_approved',
        message: 'Test de notification',
        data: {
            workspaceId: new mongoose.Types.ObjectId(),
            workspaceName: 'Test Workspace',
        },
    })

    try {
        const validationError = testNotification.validateSync()
        if (validationError) {
            console.error('❌ Erreur de validation:', validationError.message)
            return false
        } else {
            console.log('✅ Validation réussie pour le type join_approved')
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message)
        return false
    }

    // Test des autres types
    const types = ['join_request', 'join_rejected', 'workspace_invite']
    for (const type of types) {
        const testNotif = new Notification({
            userId: new mongoose.Types.ObjectId(),
            type: type,
            message: `Test ${type}`,
        })

        const validationError = testNotif.validateSync()
        if (validationError) {
            console.error(
                `❌ Erreur de validation pour ${type}:`,
                validationError.message
            )
            return false
        } else {
            console.log(`✅ Validation réussie pour le type ${type}`)
        }
    }

    console.log('🎉 Tous les tests de validation sont passés !')
    return true
}

if (require.main === module) {
    testNotificationModel()
}

module.exports = testNotificationModel
