const axios = require('axios')

async function testChannelAdminRights() {
    try {
        console.log(
            "🧪 Test de création de canal et vérification des droits d'admin"
        )
        console.log(
            '================================================================'
        )

        // Configuration de base
        const API_URL = 'http://localhost:3000/api'
        const email = 'test@example.com'
        const password = 'TestPassword123!'

        // Créer une instance axios avec gestion des cookies
        const client = axios.create({
            baseURL: API_URL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // 1. Connexion
        console.log('📝 1. Connexion...')
        let loginResponse
        try {
            loginResponse = await client.post('/auth/login', {
                email,
                password,
            })
            console.log('✅ Connexion réussie')
        } catch (error) {
            console.log(
                '❌ Erreur de connexion:',
                error.response?.data || error.message
            )
            return
        }

        // Extraire le token si fourni
        const token = loginResponse.data.token
        if (token) {
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`
            console.log('✅ Token récupéré et configuré')
        }

        // 2. Récupérer la liste des workspaces
        console.log('\n📁 2. Récupération des workspaces...')
        let workspaces
        try {
            const workspacesResponse = await client.get('/workspaces')
            workspaces = workspacesResponse.data
            console.log(`✅ ${workspaces.length} workspace(s) trouvé(s)`)
        } catch (error) {
            console.log(
                '❌ Erreur lors de la récupération des workspaces:',
                error.response?.data || error.message
            )
            return
        }

        if (workspaces.length === 0) {
            console.log('❌ Aucun workspace disponible')
            return
        }

        const workspaceId = workspaces[0]._id
        console.log(
            `✅ Utilisation du workspace: ${workspaces[0].name} (${workspaceId})`
        )

        // 3. Créer un canal de test
        console.log("\n🔧 3. Création d'un canal de test...")
        const channelName = `test-channel-${Date.now()}`
        let createdChannel
        try {
            const createResponse = await client.post('/channels', {
                name: channelName,
                workspaceId: workspaceId,
                type: 'private',
                description: 'Canal de test pour vérifier les droits admin',
            })
            createdChannel = createResponse.data.channel
            console.log(
                `✅ Canal créé avec succès: ${createdChannel.name} (${createdChannel._id})`
            )
        } catch (error) {
            console.log(
                '❌ Erreur lors de la création du canal:',
                error.response?.data || error.message
            )
            return
        }

        // 4. Vérifier les permissions du créateur
        console.log('\n🔍 4. Vérification des permissions du créateur...')
        try {
            const permissionsResponse = await client.get(
                `/permissions?workspaceId=${workspaceId}`
            )
            const permissions = permissionsResponse.data

            // Trouver les permissions de l'utilisateur actuel
            const userPermission = permissions.find(
                (perm) => perm.userId.email === email
            )

            if (!userPermission) {
                console.log('❌ Permissions utilisateur non trouvées')
                return
            }

            console.log('✅ Permissions utilisateur trouvées')
            console.log(`   - Rôle workspace: ${userPermission.role}`)
            console.log(
                `   - Nombre de rôles de canal: ${
                    userPermission.channelRoles?.length || 0
                }`
            )

            // Vérifier s'il y a un rôle admin pour ce canal
            const channelAdminRole = userPermission.channelRoles?.find(
                (cr) =>
                    cr.channelId === createdChannel._id && cr.role === 'admin'
            )

            if (channelAdminRole) {
                console.log(
                    '✅ SUCCESS: Le créateur du canal a bien le rôle admin sur le canal!'
                )
                console.log(`   - Rôle dans le canal: ${channelAdminRole.role}`)
            } else {
                console.log(
                    "❌ ÉCHEC: Le créateur du canal n'a PAS le rôle admin sur le canal"
                )
                console.log('   Rôles de canal trouvés:')
                userPermission.channelRoles?.forEach((cr) => {
                    console.log(`   - Canal ${cr.channelId}: ${cr.role}`)
                })
            }
        } catch (error) {
            console.log(
                '❌ Erreur lors de la vérification des permissions:',
                error.response?.data || error.message
            )
        }

        // 5. Nettoyer : supprimer le canal de test
        console.log('\n🧹 5. Nettoyage - Suppression du canal de test...')
        try {
            await client.delete(`/channels/${createdChannel._id}`)
            console.log('✅ Canal de test supprimé avec succès')
        } catch (error) {
            console.log(
                '⚠️ Erreur lors de la suppression (pas grave):',
                error.response?.data || error.message
            )
        }

        console.log('\n🏁 Test terminé!')
    } catch (error) {
        console.error('❌ Erreur générale:', error.message)
    }
}

testChannelAdminRights()
