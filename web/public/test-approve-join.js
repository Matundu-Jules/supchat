// Test script pour simuler l'approbation d'une demande de jointure
// À exécuter dans la console du navigateur sur http://localhost:5173

// Fonction pour tester l'approbation d'une demande
async function testApproveJoinRequest() {
    try {
        // Simuler une demande d'approbation
        const workspaceId = '684ec1d371566329cf37970' // Remplacez par un ID valide
        const requestUserId = '684e343...' // Remplacez par un ID d'utilisateur valide

        console.log("🧪 Test d'approbation de demande de jointure...")
        console.log(`📋 Workspace ID: ${workspaceId}`)
        console.log(`👤 Request User ID: ${requestUserId}`)

        // Récupérer le token CSRF
        const csrfResponse = await fetch('/api/csrf-token', {
            credentials: 'include',
        })
        const { csrfToken } = await csrfResponse.json()

        // Faire la requête d'approbation
        const response = await fetch(
            `/api/workspaces/${workspaceId}/join-requests/${requestUserId}/approve`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                credentials: 'include',
            }
        )

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Demande approuvée avec succès !')
            console.log('📄 Réponse:', result)
        } else {
            console.error("❌ Erreur lors de l'approbation:", result)
            console.error(`🔍 Status: ${response.status}`)
        }
    } catch (error) {
        console.error('❌ Erreur dans le test:', error)
    }
}

// Instructions d'utilisation
console.log(`
🧪 Script de test d'approbation de demande de jointure chargé !

Pour utiliser ce script :
1. Connectez-vous en tant qu'admin/propriétaire d'un workspace
2. Vérifiez qu'il y a des demandes de jointure en attente
3. Obtenez les IDs nécessaires depuis l'interface
4. Modifiez les variables workspaceId et requestUserId dans la fonction
5. Exécutez : testApproveJoinRequest()

Ou utilisez directement l'interface web pour tester la fonctionnalité !
`)

// Fonction utilitaire pour obtenir les demandes de jointure d'un workspace
async function getJoinRequests(workspaceId) {
    try {
        const csrfResponse = await fetch('/api/csrf-token', {
            credentials: 'include',
        })
        const { csrfToken } = await csrfResponse.json()

        const response = await fetch(
            `/api/workspaces/${workspaceId}/join-requests`,
            {
                headers: {
                    'X-CSRF-Token': csrfToken,
                },
                credentials: 'include',
            }
        )

        const requests = await response.json()
        console.log('📋 Demandes de jointure:', requests)
        return requests
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des demandes:', error)
    }
}

window.testApproveJoinRequest = testApproveJoinRequest
window.getJoinRequests = getJoinRequests
