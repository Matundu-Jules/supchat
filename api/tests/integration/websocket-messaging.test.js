/**
 * Tests d'intégration pour la messagerie WebSocket
 * Teste la fonctionnalité complète de messagerie temps réel
 */

const request = require('supertest')
const { Server } = require('socket.io')
const { createServer } = require('http')
const Client = require('socket.io-client')
const app = require('../../src/app')
const { connectDB, disconnectDB } = require('../utils/database')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const jwt = require('jsonwebtoken')

describe('WebSocket Messaging Integration', () => {
    let httpServer
    let httpServerAddr
    let ioServer
    let clientSocket
    let testUser
    let testWorkspace
    let testChannel
    let authToken

    beforeAll(async () => {
        await connectDB()

        // Créer un serveur HTTP pour les tests
        httpServer = createServer(app)
        ioServer = new Server(httpServer)

        // Configurer Socket.IO comme dans l'app principale
        require('../../socket')(ioServer)

        httpServer.listen(() => {
            httpServerAddr = httpServer.address()
        })
    })

    afterAll(async () => {
        ioServer.close()
        httpServer.close()
        await disconnectDB()
    })

    beforeEach(async () => {
        // Nettoyer la base de données
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Message.deleteMany({})

        // Créer des données de test
        testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        })

        testWorkspace = await Workspace.create({
            name: 'Test Workspace',
            ownerId: testUser._id,
            members: [testUser._id],
        })

        testChannel = await Channel.create({
            name: 'general',
            workspaceId: testWorkspace._id,
            members: [testUser._id],
        })

        // Générer un token JWT pour l'authentification
        authToken = jwt.sign(
            { userId: testUser._id },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        )

        // Créer une connexion client
        clientSocket = new Client(`http://localhost:${httpServerAddr.port}`, {
            auth: {
                token: authToken,
            },
        })
    })

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect()
        }
    })

    describe('Authentification WebSocket', () => {
        test('devrait accepter une connexion avec un token valide', (done) => {
            clientSocket.on('connect', () => {
                expect(clientSocket.connected).toBe(true)
                done()
            })

            clientSocket.on('connect_error', (error) => {
                done(error)
            })
        })

        test('devrait rejeter une connexion sans token', (done) => {
            const unauthorizedClient = new Client(
                `http://localhost:${httpServerAddr.port}`
            )

            unauthorizedClient.on('connect_error', (error) => {
                expect(error.message).toContain('Authentication')
                unauthorizedClient.close()
                done()
            })

            unauthorizedClient.on('connect', () => {
                unauthorizedClient.close()
                done(new Error('La connexion non autorisée a été acceptée'))
            })
        })
    })

    describe('Envoi et réception de messages', () => {
        test('devrait envoyer et recevoir un message', (done) => {
            const messageContent = 'Hello, World!'
            let messageReceived = false
            let confirmationReceived = false

            const checkCompletion = () => {
                if (messageReceived && confirmationReceived) {
                    done()
                }
            }

            clientSocket.on('connect', () => {
                // Rejoindre le channel
                clientSocket.emit('join-channel', testChannel._id.toString())

                // Écouter les nouveaux messages
                clientSocket.on('new-message', (message) => {
                    expect(message.content).toBe(messageContent)
                    expect(message.author).toBe(testUser._id.toString())
                    expect(message.channel).toBe(testChannel._id.toString())
                    messageReceived = true
                    checkCompletion()
                })

                // Écouter la confirmation d'envoi
                clientSocket.on('message-sent', (confirmation) => {
                    expect(confirmation.success).toBe(true)
                    expect(confirmation.message).toBeDefined()
                    expect(confirmation.message.content).toBe(messageContent)
                    confirmationReceived = true
                    checkCompletion()
                })

                // Envoyer un message
                clientSocket.emit('send-message', {
                    content: messageContent,
                    channelId: testChannel._id.toString(),
                })
            })
        })

        test('devrait gérer les messages avec des types différents', (done) => {
            const messageData = {
                content: 'Message avec fichier',
                channelId: testChannel._id.toString(),
                type: 'file',
                attachments: [
                    {
                        filename: 'test.pdf',
                        url: '/uploads/test.pdf',
                    },
                ],
            }

            clientSocket.on('connect', () => {
                clientSocket.emit('join-channel', testChannel._id.toString())

                clientSocket.on('new-message', (message) => {
                    expect(message.content).toBe(messageData.content)
                    expect(message.type).toBe('file')
                    expect(message.attachments).toHaveLength(1)
                    done()
                })

                clientSocket.emit('send-message', messageData)
            })
        })
    })

    describe('Édition et suppression de messages', () => {
        let testMessage

        beforeEach(async () => {
            testMessage = await Message.create({
                content: 'Message original',
                author: testUser._id,
                channel: testChannel._id,
                workspace: testWorkspace._id,
            })
        })

        test('devrait éditer un message', (done) => {
            const newContent = 'Message modifié'

            clientSocket.on('connect', () => {
                clientSocket.emit('join-channel', testChannel._id.toString())

                clientSocket.on('message-updated', (updatedMessage) => {
                    expect(updatedMessage._id).toBe(testMessage._id.toString())
                    expect(updatedMessage.content).toBe(newContent)
                    expect(updatedMessage.edited).toBe(true)
                    done()
                })

                clientSocket.emit('edit-message', {
                    messageId: testMessage._id.toString(),
                    content: newContent,
                })
            })
        })

        test('devrait supprimer un message', (done) => {
            clientSocket.on('connect', () => {
                clientSocket.emit('join-channel', testChannel._id.toString())

                clientSocket.on('message-deleted', (deletedInfo) => {
                    expect(deletedInfo.messageId).toBe(
                        testMessage._id.toString()
                    )
                    expect(deletedInfo.channelId).toBe(
                        testChannel._id.toString()
                    )
                    done()
                })

                clientSocket.emit('delete-message', {
                    messageId: testMessage._id.toString(),
                })
            })
        })
    })

    describe('Gestion des channels', () => {
        test('devrait joindre et quitter un channel', (done) => {
            let joinConfirmed = false
            let leaveConfirmed = false

            const checkCompletion = () => {
                if (joinConfirmed && leaveConfirmed) {
                    done()
                }
            }

            clientSocket.on('connect', () => {
                clientSocket.on('channel-joined', (data) => {
                    expect(data.channelId).toBe(testChannel._id.toString())
                    joinConfirmed = true

                    // Quitter le channel après l'avoir rejoint
                    clientSocket.emit(
                        'leave-channel',
                        testChannel._id.toString()
                    )
                })

                clientSocket.on('channel-left', (data) => {
                    expect(data.channelId).toBe(testChannel._id.toString())
                    leaveConfirmed = true
                    checkCompletion()
                })

                clientSocket.emit('join-channel', testChannel._id.toString())
            })
        })

        test('devrait empêcher de rejoindre un channel sans permission', (done) => {
            // Créer un channel où l'utilisateur n'est pas membre
            Channel.create({
                name: 'private-channel',
                workspaceId: testWorkspace._id,
                members: [], // Pas de membres
            }).then((privateChannel) => {
                clientSocket.on('connect', () => {
                    clientSocket.on('error', (error) => {
                        expect(error.message).toContain('permission')
                        done()
                    })

                    clientSocket.emit(
                        'join-channel',
                        privateChannel._id.toString()
                    )
                })
            })
        })
    })

    describe('Multiples clients', () => {
        let secondClient

        beforeEach(() => {
            secondClient = new Client(
                `http://localhost:${httpServerAddr.port}`,
                {
                    auth: {
                        token: authToken,
                    },
                }
            )
        })

        afterEach(() => {
            if (secondClient.connected) {
                secondClient.disconnect()
            }
        })

        test('devrait diffuser les messages à tous les clients connectés', (done) => {
            const messageContent = 'Message broadcast'
            let client1Received = false
            let client2Received = false

            const checkCompletion = () => {
                if (client1Received && client2Received) {
                    done()
                }
            }

            Promise.all([
                new Promise((resolve) => clientSocket.on('connect', resolve)),
                new Promise((resolve) => secondClient.on('connect', resolve)),
            ]).then(() => {
                // Les deux clients rejoignent le même channel
                clientSocket.emit('join-channel', testChannel._id.toString())
                secondClient.emit('join-channel', testChannel._id.toString())

                // Configurer les listeners
                clientSocket.on('new-message', (message) => {
                    expect(message.content).toBe(messageContent)
                    client1Received = true
                    checkCompletion()
                })

                secondClient.on('new-message', (message) => {
                    expect(message.content).toBe(messageContent)
                    client2Received = true
                    checkCompletion()
                })

                // Le premier client envoie un message
                setTimeout(() => {
                    clientSocket.emit('send-message', {
                        content: messageContent,
                        channelId: testChannel._id.toString(),
                    })
                }, 100)
            })
        })
    })

    describe('Gestion des erreurs', () => {
        test('devrait gérer les erreurs de message invalide', (done) => {
            clientSocket.on('connect', () => {
                clientSocket.on('error', (error) => {
                    expect(error.message).toContain('Invalid')
                    done()
                })

                // Envoyer un message invalide (sans contenu)
                clientSocket.emit('send-message', {
                    channelId: testChannel._id.toString(),
                    // Pas de content
                })
            })
        })

        test('devrait gérer les timeouts de connexion', (done) => {
            // Créer un client avec un timeout court
            const timeoutClient = new Client(
                `http://localhost:${httpServerAddr.port}`,
                {
                    auth: {
                        token: authToken,
                    },
                    timeout: 100,
                }
            )

            timeoutClient.on('connect_error', (error) => {
                expect(error.type).toBe('TransportError')
                timeoutClient.close()
                done()
            })

            // Simuler une latence pour déclencher le timeout
            setTimeout(() => {
                timeoutClient.connect()
            }, 200)
        })
    })
})
