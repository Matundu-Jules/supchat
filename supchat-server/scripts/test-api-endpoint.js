// Test simple de l'endpoint POST /api/messages
// Ce script simule ce que fait le client web

const fetch = require('node-fetch') // Vous devrez peut-être installer node-fetch

async function testMessageAPI() {
    try {
        // Test avec un message simple
        const testMessage = {
            channelId: '684e348fd7cfbb5e452debe3', // ID de canal fictif
            text: 'Test message avec #hashtag',
        }

        console.log("Test de l'endpoint POST /api/messages...")
        console.log('Message à envoyer:', testMessage)

        const response = await fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: en réalité il faudrait un token JWT valide
                Authorization: 'Bearer test-token',
            },
            body: JSON.stringify(testMessage),
        })

        console.log('Status:', response.status)
        const responseText = await response.text()
        console.log('Response:', responseText)

        if (response.status === 500) {
            console.log('❌ Erreur 500 - le problème persiste')
        } else if (response.status === 401 || response.status === 403) {
            console.log(
                "⚠️  Erreur d'authentification (normal sans token valide)"
            )
        } else if (response.status === 201) {
            console.log('✅ Message créé avec succès !')
        } else {
            console.log('⚠️  Statut inattendu:', response.status)
        }
    } catch (error) {
        console.error('Erreur lors du test:', error.message)
    }
}

testMessageAPI()
