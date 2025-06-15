#!/usr/bin/env node

const axios = require('axios')

const baseURL = 'http://localhost:5173/api'

async function testInvitation() {
    try {
        console.log("🔍 Test complet d'invitation via le frontend...\n")

        // Créer une instance axios avec gestion des cookies
        const client = axios.create({
            baseURL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // 1. Récupérer le token CSRF
        console.log('1. Récupération du token CSRF...')
        const csrfResponse = await client.get('/csrf-token')
        const csrfToken = csrfResponse.data.csrfToken
        console.log(
            '✅ Token CSRF récupéré:',
            csrfToken.substring(0, 20) + '...'
        )

        // Ajouter le token CSRF aux headers
        client.defaults.headers['X-CSRF-TOKEN'] = csrfToken

        // 2. Créer un utilisateur de test s'il n'existe pas
        console.log("\n2. Création d'un utilisateur de test...")
        try {
            await client.post('/auth/register', {
                name: 'Test User',
                email: 'test@test.com',
                password: 'TestPassword123!',
                confirmPassword: 'TestPassword123!',
            })
            console.log('✅ Utilisateur de test créé')
        } catch (err) {
            if (
                err.response?.status === 400 &&
                err.response?.data?.message?.includes('existe déjà')
            ) {
                console.log('ℹ️ Utilisateur de test existe déjà')
            } else {
                throw err
            }
        }

        // 3. Se connecter avec l'utilisateur de test
        console.log("\n3. Connexion avec l'utilisateur de test...")
        const loginResponse = await client.post('/auth/login', {
            email: 'test@test.com',
            password: 'TestPassword123!',
        })
        console.log(
            '✅ Connexion réussie, utilisateur:',
            loginResponse.data.user?.email
        )

        // 4. Créer un utilisateur à inviter s'il n'existe pas
        console.log("\n4. Création d'un utilisateur à inviter...")
        try {
            await client.post('/auth/register', {
                name: 'Invited User',
                email: 'invited@test.com',
                password: 'TestPassword123!',
                confirmPassword: 'TestPassword123!',
            })
            console.log('✅ Utilisateur à inviter créé')
        } catch (err) {
            if (
                err.response?.status === 400 &&
                err.response?.data?.message?.includes('existe déjà')
            ) {
                console.log('ℹ️ Utilisateur à inviter existe déjà')
            } else {
                throw err
            }
        }

        // 5. Récupérer la liste des workspaces
        console.log('\n5. Récupération des workspaces...')
        const workspacesResponse = await client.get('/workspaces')
        const workspaces = workspacesResponse.data
        console.log(
            '✅ Workspaces récupérés:',
            workspaces.length,
            'workspace(s)'
        )

        let testWorkspaceId = null

        // 6. Créer un workspace de test si aucun n'existe
        if (workspaces.length === 0) {
            console.log("\n6. Création d'un workspace de test...")
            const createResponse = await client.post('/workspaces', {
                name: 'Test Workspace',
                description: "Workspace pour test d'invitation",
                isPublic: true,
            })
            testWorkspaceId = createResponse.data._id
            console.log('✅ Workspace de test créé:', testWorkspaceId)
        } else {
            testWorkspaceId = workspaces[0]._id
            console.log(
                '✅ Utilisation du workspace existant:',
                testWorkspaceId
            )
        }

        // 7. Tester l'invitation d'un utilisateur existant
        console.log("\n7. Test d'invitation d'un utilisateur existant...")
        try {
            const inviteResponse = await client.post(
                `/workspaces/${testWorkspaceId}/invite`,
                {
                    email: 'invited@test.com',
                }
            )
            console.log('✅ Invitation réussie:', inviteResponse.data)
        } catch (err) {
            console.log("❌ Erreur lors de l'invitation:", {
                status: err.response?.status,
                message: err.response?.data?.message,
                data: err.response?.data,
            })
        }

        // 8. Tester l'invitation d'un utilisateur inexistant
        console.log("\n8. Test d'invitation d'un utilisateur inexistant...")
        try {
            const inviteResponse = await client.post(
                `/workspaces/${testWorkspaceId}/invite`,
                {
                    email: 'nonexistent@test.com',
                }
            )
            console.log(
                "❌ L'invitation d'un utilisateur inexistant a réussi (problème):",
                inviteResponse.data
            )
        } catch (err) {
            console.log(
                "✅ Invitation d'utilisateur inexistant correctement bloquée:",
                {
                    status: err.response?.status,
                    message: err.response?.data?.message,
                }
            )
        }
    } catch (error) {
        console.error('❌ Erreur générale:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        })
    }
}

testInvitation()
