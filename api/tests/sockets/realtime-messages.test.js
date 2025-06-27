const ioClient = require('socket.io-client')
const request = require('supertest')
const bcrypt = require('bcryptjs')
const { server } = require('../../src/app')
const User = require('../../models/User')
const Channel = require('../../models/Channel')
const Workspace = require('../../models/Workspace')
const Message = require('../../models/Message')

// Configuration du timeout pour nos tests WebSocket
jest.setTimeout(15000)

describe('Real-time Messages WebSocket Tests', () => {
    let userToken
    let user
    let workspace
    let channel
    let client1, client2
    let serverInstance

    beforeAll(async () => {
        // Démarrer le serveur pour les tests
        const port = process.env.PORT || 3001
        serverInstance = server.listen(port)
        console.log(`🧪 [TEST] Serveur démarré sur le port ${port}`)

        // Attendre un peu que le serveur soit prêt
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash('testpassword123', 10)

        // Créer un utilisateur de test
        user = await User.create({
            name: 'Test User',
            email: 'test@websocket.com',
            password: hashedPassword,
            role: 'membre',
        })

        // Créer un workspace
        workspace = await Workspace.create({
            name: 'Test Workspace',
            description: 'Workspace pour tests WebSocket',
            owner: user._id,
            members: [user._id],
        }) // Créer un channel
        channel = await Channel.create({
            name: 'test-channel',
            description: 'Channel pour tests',
            type: 'public',
            workspace: workspace._id,
            createdBy: user._id,
            members: [user._id],
        }) // Obtenir un token JWT pour l'utilisateur
        const loginResponse = await request(server)
            .post('/api/auth/login')
            .send({
                email: 'test@websocket.com',
                password: 'testpassword123',
            })

        userToken = loginResponse.body.token
        expect(userToken).toBeDefined()
    })

    afterAll(async () => {
        // Fermer les connexions WebSocket
        if (client1) client1.close()
        if (client2) client2.close()

        // Arrêter le serveur
        if (serverInstance) {
            serverInstance.close()
            console.log('🧪 [TEST] Serveur fermé')
        }

        // Nettoyer la base de données
        await Message.deleteMany({})
        await Channel.deleteMany({})
        await Workspace.deleteMany({})
        await User.deleteMany({})
    })

    test('should receive new-message event when message is sent via API', (done) => {
        console.log(
            '🧪 [TEST] Début du test de réception de messages temps réel'
        )

        // Créer un client WebSocket
        client1 = ioClient(`http://localhost:3001`, {
            auth: {
                token: userToken,
            },
            forceNew: true,
            transports: ['websocket'],
        })

        client1.on('connect', async () => {
            console.log('✅ [TEST] Client WebSocket connecté')

            // Écouter les nouveaux messages
            client1.on('new-message', (message) => {
                console.log('🚀 [TEST] Message reçu via WebSocket:', message)

                expect(message).toBeDefined()
                expect(message.text).toBe('Test message temps réel')
                expect(message.channelId || message.channel).toBe(
                    channel._id.toString()
                )

                console.log('✅ [TEST] Message reçu avec succès')
                done()
            })

            // Envoyer un message via l'API REST
            console.log("📤 [TEST] Envoi d'un message via API...")
            const response = await request(server)
                .post('/api/messages')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    channelId: channel._id.toString(),
                    text: 'Test message temps réel',
                })

            console.log(
                '📤 [TEST] Réponse API:',
                response.status,
                response.body
            )
            expect(response.status).toBe(201)
        })

        client1.on('connect_error', (error) => {
            console.error('❌ [TEST] Erreur de connexion WebSocket:', error)
            done(error)
        })

        client1.on('error', (error) => {
            console.error('❌ [TEST] Erreur WebSocket:', error)
            done(error)
        })
    })

    test('should sync messages between multiple clients', (done) => {
        console.log('🧪 [TEST] Test de synchronisation multi-clients')

        let messagesReceived = 0
        const expectedMessage = 'Message de synchronisation multi-client'

        // Créer deux clients WebSocket
        client1 = ioClient(`http://localhost:3001`, {
            auth: { token: userToken },
            forceNew: true,
            transports: ['websocket'],
        })

        client2 = ioClient(`http://localhost:3001`, {
            auth: { token: userToken },
            forceNew: true,
            transports: ['websocket'],
        })

        const checkCompletion = () => {
            messagesReceived++
            console.log(`📊 [TEST] Messages reçus: ${messagesReceived}/1`)

            if (messagesReceived >= 1) {
                console.log('✅ [TEST] Synchronisation multi-client réussie')
                done()
            }
        }

        let clientsConnected = 0

        const handleConnection = async () => {
            clientsConnected++
            console.log(`🔗 [TEST] Clients connectés: ${clientsConnected}/2`)

            if (clientsConnected === 2) {
                // Les deux clients sont connectés, envoyer le message
                console.log('📤 [TEST] Envoi du message de test...')

                const response = await request(server)
                    .post('/api/messages')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        channelId: channel._id.toString(),
                        text: expectedMessage,
                    })

                console.log(
                    '📤 [TEST] Message envoyé, statut:',
                    response.status
                )
            }
        }

        // Client 1 écoute les messages
        client1.on('connect', handleConnection)
        client1.on('new-message', (message) => {
            console.log('🚀 [TEST] Client 1 - Message reçu:', message.text)
            if (message.text === expectedMessage) {
                checkCompletion()
            }
        })

        // Client 2 écoute les messages
        client2.on('connect', handleConnection)
        client2
            .on('new-message', (message) => {
                console.log('🚀 [TEST] Client 2 - Message reçu:', message.text)
                if (message.text === expectedMessage) {
                    checkCompletion()
                }
            })

            [
                // Gestion des erreurs
                (client1, client2)
            ].forEach((client, index) => {
                client.on('connect_error', (error) => {
                    console.error(
                        `❌ [TEST] Client ${index + 1} - Erreur de connexion:`,
                        error
                    )
                    done(error)
                })
            })
    })

    test('REPRODUCTION DU BUG: sender should also receive their own message via WebSocket', (done) => {
        console.log(
            "🐛 [TEST] Reproduction du bug - L'expéditeur ne voit pas son propre message"
        )

        // Créer un client WebSocket qui simule l'utilisateur qui envoie le message
        client1 = ioClient(`http://localhost:3001`, {
            auth: {
                token: userToken,
            },
            forceNew: true,
            transports: ['websocket'],
        })

        client1.on('connect', async () => {
            console.log('✅ [TEST] Client WebSocket connecté (expéditeur)')

            let messageReceived = false

            // Écouter les nouveaux messages (c'est là que ça devrait marcher mais ça marche pas)
            client1.on('new-message', (message) => {
                console.log(
                    "🚀 [TEST] MESSAGE REÇU PAR L'EXPÉDITEUR via WebSocket:",
                    message
                )
                messageReceived = true

                expect(message).toBeDefined()
                expect(message.text || message.content).toBe(
                    'Message test expéditeur'
                )
                expect(message.channelId || message.channel).toBe(
                    channel._id.toString()
                )

                console.log(
                    "✅ [TEST] L'expéditeur a bien reçu son propre message!"
                )
                done()
            })

            // Envoyer un message via l'API REST (comme dans l'interface web)
            console.log("📤 [TEST] Envoi d'un message via API (expéditeur)...")
            const response = await request(server)
                .post('/api/messages')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    channelId: channel._id.toString(),
                    text: 'Message test expéditeur',
                })

            console.log(
                '📤 [TEST] Réponse API:',
                response.status,
                response.body
            )
            expect(response.status).toBe(201)

            // Attendre 3 secondes - si aucun message n'est reçu, c'est le bug
            setTimeout(() => {
                if (!messageReceived) {
                    console.log(
                        "🐛 [TEST] BUG REPRODUIT: L'expéditeur n'a PAS reçu son propre message via WebSocket!"
                    )
                    done(
                        new Error(
                            "BUG CONFIRME: L'expéditeur ne reçoit pas son propre message via WebSocket"
                        )
                    )
                }
            }, 3000)
        })

        client1.on('connect_error', (error) => {
            console.error('❌ [TEST] Erreur de connexion WebSocket:', error)
            done(error)
        })

        client1.on('error', (error) => {
            console.error('❌ [TEST] Erreur WebSocket:', error)
            done(error)
        })
    })

    test('VERIFICATION: other clients should receive messages from sender', (done) => {
        console.log(
            '🧪 [TEST] Vérification - Les autres clients reçoivent bien les messages'
        )

        // Créer deux clients : un expéditeur et un récepteur
        client1 = ioClient(`http://localhost:3001`, {
            auth: { token: userToken },
            forceNew: true,
            transports: ['websocket'],
        })

        client2 = ioClient(`http://localhost:3001`, {
            auth: { token: userToken },
            forceNew: true,
            transports: ['websocket'],
        })

        let connectionsReady = 0
        const messageToSend = 'Message entre clients test'

        const checkReady = async () => {
            connectionsReady++
            if (connectionsReady === 2) {
                console.log('🔗 [TEST] Les deux clients sont connectés')

                // Client 2 écoute les messages
                client2.on('new-message', (message) => {
                    console.log(
                        '🚀 [TEST] Client 2 a reçu le message:',
                        message.text || message.content
                    )

                    expect(message).toBeDefined()
                    expect(message.text || message.content).toBe(messageToSend)

                    console.log(
                        '✅ [TEST] La communication entre clients fonctionne!'
                    )
                    done()
                })

                // Client 1 (expéditeur) envoie le message
                console.log('📤 [TEST] Client 1 envoie un message...')
                const response = await request(server)
                    .post('/api/messages')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        channelId: channel._id.toString(),
                        text: messageToSend,
                    })

                expect(response.status).toBe(201)
            }
        }

        client1.on('connect', checkReady)
        client2
            .on('connect', checkReady)

            [(client1, client2)].forEach((client, index) => {
                client.on('connect_error', (error) => {
                    console.error(
                        `❌ [TEST] Client ${index + 1} - Erreur de connexion:`,
                        error
                    )
                    done(error)
                })
            })
    })
})
