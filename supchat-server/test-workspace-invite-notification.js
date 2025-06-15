// Test de création de notification workspace_invite
const mongoose = require('mongoose')
const Notification = require('./models/Notification')

console.log('🔍 Test de création de notification workspace_invite...')

// Test de création d'une notification workspace_invite (comme dans le contrôleur)
const testNotification = new Notification({
    type: 'workspace_invite',
    userId: new mongoose.Types.ObjectId(),
    workspaceId: new mongoose.Types.ObjectId(),
})

try {
    const validationError = testNotification.validateSync()
    if (validationError) {
        console.error('❌ Erreur de validation:', validationError.message)
        console.error('Détails:', validationError)
    } else {
        console.log('✅ Validation réussie pour workspace_invite')
        console.log('Notification créée:', testNotification)
    }
} catch (error) {
    console.error('❌ Erreur lors de la création:', error.message)
}

// Test avec message
console.log('\n🔍 Test avec message...')
const testNotificationWithMessage = new Notification({
    type: 'workspace_invite',
    userId: new mongoose.Types.ObjectId(),
    workspaceId: new mongoose.Types.ObjectId(),
    message: 'Vous avez été invité à rejoindre un workspace',
})

try {
    const validationError = testNotificationWithMessage.validateSync()
    if (validationError) {
        console.error(
            '❌ Erreur de validation avec message:',
            validationError.message
        )
    } else {
        console.log('✅ Validation réussie avec message')
    }
} catch (error) {
    console.error('❌ Erreur lors de la création avec message:', error.message)
}

console.log('\n🎉 Test terminé !')
