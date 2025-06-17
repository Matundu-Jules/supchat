// Configuration de l'environnement de test
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'testsecret'

const request = require('supertest')
const ioClient = require('socket.io-client')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { app, server, connectToDatabase } = require('../../src/app')
const { initSocket } = require('../../socket')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const { userFactory } = require('../factories/userFactory')
const TestHelpers = require('../helpers/testHelpers')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * Tests d'intégration pour les WebSockets - Version corrigée
 * Couverture complète de la communication temps réel :
 * - Connexion/déconnexion WebSocket avec authentification JWT
 * - Envoi et réception de messages en temps réel via 'send-message'
 * - Indicateurs de frappe via 'typing' et 'stop-typing'
 * - Rejoindre automatiquement les channels de l'utilisateur
 * - Notifications en temps réel
 * - Gestion des erreurs WebSocket
 * - Validation des permissions sur les channels
 */

jest.setTimeout(30000)

describe("WebSockets - Tests d'intégration complets (Version corrigée)", () => {
    let authToken1, authToken2
    let user1, user2
    let workspace, channel
    let clientSocket1, clientSocket2
    let serverPort
    let mongoServer

    beforeAll(async () => {
        // Utiliser la connexion existante de Mongoose
        if (mongoose.connection.readyState === 0) {
            // Si pas de connexion, créer une base de données en mémoire
            mongoServer = await MongoMemoryServer.create()
            const uri = mongoServer.getUri()
            await connectToDatabase(uri)
        }

        // Démarrer le serveur si ce n'est pas déjà fait
        if (!server.listening) {
            await new Promise((resolve) => {
                server.listen(0, () => {
                    serverPort = server.address().port
                    resolve()
                })
            })
        } else {
            serverPort = server.address().port
        } // Initialiser Socket.io sur le serveur seulement si pas déjà fait
        try {
            initSocket(server, ['http://localhost:*', 'http://127.0.0.1:*'])
        } catch (error) {
            // Socket.io peut être déjà initialisé
            console.log(
                'Socket.io already initialized or error:',
                error.message
            )
        }
    })

    beforeEach(async () => {
        // Nettoyer toutes les données de test
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Message.deleteMany({})

        // Créer deux utilisateurs de test
        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        user1 = await User.create(
            userFactory({
                email: TestHelpers.generateUniqueEmail(),
                password: hashedPassword,
                username: TestHelpers.generateUniqueUsername(),
                role: 'admin',
            })
        )

        user2 = await User.create(
            userFactory({
                email: TestHelpers.generateUniqueEmail(),
                password: hashedPassword,
                username: TestHelpers.generateUniqueUsername(),
                role: 'membre',
            })
        )

        // Générer les tokens JWT directement (plus fiable que l'API login)
        authToken1 = jwt.sign(
            { id: user1._id },
            process.env.JWT_SECRET || 'testsecret',
            { expiresIn: '1h' }
        )
        authToken2 = jwt.sign(
            { id: user2._id },
            process.env.JWT_SECRET || 'testsecret',
            { expiresIn: '1h' }
        )

        // Créer un workspace de test
        workspace = await Workspace.create({
            name: 'Test Workspace WebSocket',
            owner: user1._id,
            members: [user1._id, user2._id],
            type: 'public',
        })

        // Créer un channel de test avec les deux utilisateurs
        channel = await Channel.create({
            name: 'test-websocket',
            workspace: workspace._id,
            createdBy: user1._id,
            members: [user1._id, user2._id],
            type: 'public',
        })
    })

    afterEach(async () => {
        // Fermer les connexions socket proprement
        if (clientSocket1 && clientSocket1.connected) {
            clientSocket1.disconnect()
            clientSocket1 = null
        }
        if (clientSocket2 && clientSocket2.connected) {
            clientSocket2.disconnect()
            clientSocket2 = null
        }

        // Petit délai pour laisser les connexions se fermer
        await new Promise((resolve) => setTimeout(resolve, 100)) // Nettoyer les données
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Message.deleteMany({})
    })

    afterAll(async () => {
        try {
            // Nettoyer les données
            await User.deleteMany({})
            await Workspace.deleteMany({})
            await Channel.deleteMany({})
            await Message.deleteMany({})

            // Fermer le serveur seulement
            if (server.listening) {
                server.close()
            }

            // Fermer MongoMemoryServer seulement si on l'a créé
            if (mongoServer) {
                await mongoServer.stop()
            }
        } catch (error) {
            console.log('Cleanup error (can be ignored):', error.message)
        }
    })

    // Helper pour créer une connexion WebSocket authentifiée
    const createSocketConnection = (token, timeout = 8000) => {
        return new Promise((resolve, reject) => {
            const socket = ioClient(`http://localhost:${serverPort}`, {
                auth: { token },
                transports: ['websocket'],
                timeout: timeout,
                forceNew: true,
            })

            const timeoutId = setTimeout(() => {
                socket.disconnect()
                reject(new Error('Connection timeout'))
            }, timeout)

            socket.on('connect', () => {
                clearTimeout(timeoutId)
                resolve(socket)
            })

            socket.on('connect_error', (error) => {
                clearTimeout(timeoutId)
                reject(error)
            })
        })
    }

    describe('Authentification WebSocket', () => {
        it('devrait permettre la connexion avec un token JWT valide', async () => {
            clientSocket1 = await createSocketConnection(authToken1)

            expect(clientSocket1.connected).toBe(true)
            expect(clientSocket1.id).toBeDefined()
        })

        it('devrait rejeter la connexion avec un token invalide', async () => {
            await expect(
                createSocketConnection('token.invalide.ici')
            ).rejects.toThrow()
        })

        it('devrait rejeter la connexion sans token', async () => {
            await expect(createSocketConnection('')).rejects.toThrow()
        })

        it("devrait rejoindre automatiquement les channels de l'utilisateur", async () => {
            clientSocket1 = await createSocketConnection(authToken1)

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined non reçu'))
                }, 5000)

                clientSocket1.on('channels-joined', (data) => {
                    clearTimeout(timeout)
                    try {
                        expect(data.success).toBe(true)
                        expect(data.channels).toContain(channel._id.toString())
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        })
    })

    describe('Messages en temps réel', () => {
        beforeEach(async () => {
            // Créer les connexions et configurer les listeners avant de se connecter
            const socket1Promise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined pour socket1'))
                }, 8000)

                clientSocket1 = ioClient(`http://localhost:${serverPort}`, {
                    auth: { token: authToken1 },
                    transports: ['websocket'],
                    timeout: 8000,
                    forceNew: true,
                    autoConnect: false, // Ne pas se connecter automatiquement
                })

                clientSocket1.on('channels-joined', () => {
                    clearTimeout(timeout)
                    resolve()
                })

                clientSocket1.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    reject(error)
                })

                // Se connecter maintenant que les listeners sont configurés
                clientSocket1.connect()
            })

            const socket2Promise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined pour socket2'))
                }, 8000)

                clientSocket2 = ioClient(`http://localhost:${serverPort}`, {
                    auth: { token: authToken2 },
                    transports: ['websocket'],
                    timeout: 8000,
                    forceNew: true,
                    autoConnect: false, // Ne pas se connecter automatiquement
                })

                clientSocket2.on('channels-joined', () => {
                    clearTimeout(timeout)
                    resolve()
                })

                clientSocket2.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    reject(error)
                })

                // Se connecter maintenant que les listeners sont configurés
                clientSocket2.connect()
            })

            // Attendre que les deux clients soient connectés et aient rejoint leurs channels
            await Promise.all([socket1Promise, socket2Promise])
        })

        it('devrait envoyer et recevoir des messages via send-message', async () => {
            const messageData = {
                channelId: channel._id.toString(),
                content: 'Message de test WebSocket en temps réel',
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: message non reçu'))
                }, 8000)

                // Le socket2 écoute les nouveaux messages
                clientSocket2.on('new-message', (receivedMessage) => {
                    clearTimeout(timeout)
                    try {
                        expect(receivedMessage.content).toBe(
                            messageData.content
                        )
                        expect(receivedMessage.channelId).toBe(
                            messageData.channelId
                        )
                        expect(receivedMessage.author).toBeDefined()
                        expect(receivedMessage.author._id).toBe(
                            user1._id.toString()
                        )
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })

                // Le socket1 envoie le message
                setTimeout(() => {
                    clientSocket1.emit('send-message', messageData)
                }, 100)
            })
        })

        it('devrait sauvegarder les messages en base de données', async () => {
            const messageData = {
                channelId: channel._id.toString(),
                content: 'Message sauvegardé en BDD',
            }

            return new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: message non reçu'))
                }, 8000)

                clientSocket2.on('new-message', async () => {
                    clearTimeout(timeout)
                    try {
                        // Vérifier que le message est bien sauvé en BDD
                        const savedMessage = await Message.findOne({
                            content: messageData.content,
                        })
                        expect(savedMessage).toBeTruthy()
                        expect(savedMessage.userId.toString()).toBe(
                            user1._id.toString()
                        )
                        expect(savedMessage.channel.toString()).toBe(
                            channel._id.toString()
                        )
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })

                setTimeout(() => {
                    clientSocket1.emit('send-message', messageData)
                }, 100)
            })
        })

        it("devrait valider les permissions avant d'envoyer un message", async () => {
            // Créer un channel privé où user2 n'est pas membre
            const privateChannel = await Channel.create({
                name: 'private-channel',
                workspace: workspace._id,
                createdBy: user1._id,
                members: [user1._id], // Seulement user1
                type: 'private',
            })

            const messageData = {
                channelId: privateChannel._id.toString(),
                content: 'Message non autorisé',
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: erreur de permission non reçue'))
                }, 5000)

                clientSocket2.on('error', (error) => {
                    clearTimeout(timeout)
                    try {
                        expect(error.code).toBe('NO_PERMISSION')
                        expect(error.message).toContain('permission')
                        resolve()
                    } catch (testError) {
                        reject(testError)
                    }
                })

                // User2 tente d'envoyer un message dans le channel privé
                setTimeout(() => {
                    clientSocket2.emit('send-message', messageData)
                }, 100)
            })
        })

        it('devrait gérer les erreurs de validation des données', async () => {
            const invalidMessageData = {
                channelId: 'id-invalide',
                content: '', // Contenu vide
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: erreur de validation non reçue'))
                }, 5000)

                clientSocket1.on('error', (error) => {
                    clearTimeout(timeout)
                    try {
                        expect(error.code).toBeDefined()
                        expect(error.message).toBeDefined()
                        resolve()
                    } catch (testError) {
                        reject(testError)
                    }
                })

                setTimeout(() => {
                    clientSocket1.emit('send-message', invalidMessageData)
                }, 100)
            })
        })
    })

    describe('Indicateurs de frappe (typing)', () => {
        beforeEach(async () => {
            // Créer les connexions et configurer les listeners avant de se connecter
            const socket1Promise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined pour socket1'))
                }, 8000)

                clientSocket1 = ioClient(`http://localhost:${serverPort}`, {
                    auth: { token: authToken1 },
                    transports: ['websocket'],
                    timeout: 8000,
                    forceNew: true,
                    autoConnect: false, // Ne pas se connecter automatiquement
                })

                clientSocket1.on('channels-joined', () => {
                    clearTimeout(timeout)
                    resolve()
                })

                clientSocket1.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    reject(error)
                })

                // Se connecter maintenant que les listeners sont configurés
                clientSocket1.connect()
            })

            const socket2Promise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined pour socket2'))
                }, 8000)

                clientSocket2 = ioClient(`http://localhost:${serverPort}`, {
                    auth: { token: authToken2 },
                    transports: ['websocket'],
                    timeout: 8000,
                    forceNew: true,
                    autoConnect: false, // Ne pas se connecter automatiquement
                })

                clientSocket2.on('channels-joined', () => {
                    clearTimeout(timeout)
                    resolve()
                })

                clientSocket2.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    reject(error)
                })

                // Se connecter maintenant que les listeners sont configurés
                clientSocket2.connect()
            })

            // Attendre que les deux clients soient connectés et aient rejoint leurs channels
            await Promise.all([socket1Promise, socket2Promise])
        })

        it('devrait diffuser les indicateurs de frappe via typing', async () => {
            const typingData = {
                channelId: channel._id.toString(),
                isTyping: true,
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: user-typing non reçu'))
                }, 5000)

                clientSocket2.on('user-typing', (data) => {
                    clearTimeout(timeout)
                    try {
                        expect(data.userId).toBe(user1._id.toString())
                        expect(data.channelId).toBe(channel._id.toString())
                        expect(data.username).toBe(user1.username)
                        expect(data.isTyping).toBe(true)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })

                setTimeout(() => {
                    clientSocket1.emit('typing', typingData)
                }, 100)
            })
        })

        it('devrait arrêter les indicateurs de frappe via stop-typing', async () => {
            const typingData = {
                channelId: channel._id.toString(),
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: séquence typing/stop-typing'))
                }, 8000)

                let typingStarted = false

                clientSocket2.on('user-typing', (data) => {
                    try {
                        if (!typingStarted && data.isTyping) {
                            typingStarted = true
                            // Arrêter de taper après un délai
                            setTimeout(() => {
                                clientSocket1.emit('stop-typing', typingData)
                            }, 200)
                        } else if (typingStarted && !data.isTyping) {
                            clearTimeout(timeout)
                            expect(data.userId).toBe(user1._id.toString())
                            expect(data.isTyping).toBe(false)
                            resolve()
                        }
                    } catch (error) {
                        clearTimeout(timeout)
                        reject(error)
                    }
                })

                // Commencer à taper
                setTimeout(() => {
                    clientSocket1.emit('typing', {
                        ...typingData,
                        isTyping: true,
                    })
                }, 100)
            })
        })

        it('devrait automatiquement arrêter le typing après 3 secondes', async () => {
            const typingData = {
                channelId: channel._id.toString(),
                isTyping: true,
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: auto-stop typing non reçu'))
                }, 10000)

                let typingStarted = false
                let startTime

                clientSocket2.on('user-typing', (data) => {
                    try {
                        if (!typingStarted && data.isTyping) {
                            typingStarted = true
                            startTime = Date.now()
                        } else if (typingStarted && !data.isTyping) {
                            clearTimeout(timeout)
                            const elapsed = Date.now() - startTime
                            expect(elapsed).toBeGreaterThan(2900) // Au moins 2.9 secondes
                            expect(elapsed).toBeLessThan(3500) // Moins de 3.5 secondes
                            resolve()
                        }
                    } catch (error) {
                        clearTimeout(timeout)
                        reject(error)
                    }
                })

                setTimeout(() => {
                    clientSocket1.emit('typing', typingData)
                }, 100)
            })
        }, 12000) // Timeout plus long pour ce test
    })

    describe('Gestion des erreurs et sécurité', () => {
        beforeEach(async () => {
            clientSocket1 = await createSocketConnection(authToken1)
        })

        it('devrait gérer les déconnexions inattendues', async () => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: disconnect non reçu'))
                }, 5000)

                clientSocket1.on('disconnect', (reason) => {
                    clearTimeout(timeout)
                    try {
                        expect(reason).toBeDefined()
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })

                // Simuler une déconnexion
                setTimeout(() => {
                    clientSocket1.disconnect()
                }, 100)
            })
        })

        it('devrait valider le format des données reçues', async () => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: erreur de format non reçue'))
                }, 5000)

                clientSocket1.on('error', (error) => {
                    clearTimeout(timeout)
                    try {
                        expect(error.code).toBe('INVALID_DATA')
                        expect(error.message).toContain('format incorrect')
                        resolve()
                    } catch (testError) {
                        reject(testError)
                    }
                })

                // Envoyer des données invalides
                setTimeout(() => {
                    clientSocket1.emit('send-message', 'ceci-nest-pas-un-objet')
                }, 100)
            })
        })

        it('devrait rejeter les messages vers des channels inexistants', async () => {
            const messageData = {
                channelId: '507f1f77bcf86cd799439011', // ObjectId valide mais inexistant
                content: 'Message vers channel inexistant',
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(
                        new Error(
                            'Timeout: erreur channel inexistant non reçue'
                        )
                    )
                }, 5000)

                clientSocket1.on('error', (error) => {
                    clearTimeout(timeout)
                    try {
                        expect(error.code).toBe('CHANNEL_NOT_FOUND')
                        expect(error.message).toContain('Channel non trouvé')
                        resolve()
                    } catch (testError) {
                        reject(testError)
                    }
                })

                setTimeout(() => {
                    clientSocket1.emit('send-message', messageData)
                }, 100)
            })
        })
    })

    describe('Intégration complète', () => {
        it('devrait gérer un scénario complet : connexion, typing, message, déconnexion', async () => {
            // 1. Connexion des deux utilisateurs avec listeners configurés avant
            const socket1Promise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined pour socket1'))
                }, 8000)

                clientSocket1 = ioClient(`http://localhost:${serverPort}`, {
                    auth: { token: authToken1 },
                    transports: ['websocket'],
                    timeout: 8000,
                    forceNew: true,
                    autoConnect: false, // Ne pas se connecter automatiquement
                })

                clientSocket1.on('channels-joined', () => {
                    clearTimeout(timeout)
                    resolve()
                })

                clientSocket1.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    reject(error)
                })

                // Se connecter maintenant que les listeners sont configurés
                clientSocket1.connect()
            })

            const socket2Promise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: channels-joined pour socket2'))
                }, 8000)

                clientSocket2 = ioClient(`http://localhost:${serverPort}`, {
                    auth: { token: authToken2 },
                    transports: ['websocket'],
                    timeout: 8000,
                    forceNew: true,
                    autoConnect: false, // Ne pas se connecter automatiquement
                })

                clientSocket2.on('channels-joined', () => {
                    clearTimeout(timeout)
                    resolve()
                })

                clientSocket2.on('connect_error', (error) => {
                    clearTimeout(timeout)
                    reject(error)
                })

                // Se connecter maintenant que les listeners sont configurés
                clientSocket2.connect()
            })

            // Attendre que les deux clients soient connectés et aient rejoint leurs channels
            await Promise.all([socket1Promise, socket2Promise])

            // 2. User1 commence à taper
            const events = []

            clientSocket2.on('user-typing', (data) => {
                events.push({ type: 'typing', data })
            })

            clientSocket2.on('new-message', (data) => {
                events.push({ type: 'message', data })
            })

            // 3. Séquence complète
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: scénario complet'))
                }, 10000)

                setTimeout(() => {
                    // User1 tape
                    clientSocket1.emit('typing', {
                        channelId: channel._id.toString(),
                        isTyping: true,
                    })
                }, 100)

                setTimeout(() => {
                    // User1 arrête de taper et envoie un message
                    clientSocket1.emit('stop-typing', {
                        channelId: channel._id.toString(),
                    })

                    clientSocket1.emit('send-message', {
                        channelId: channel._id.toString(),
                        content: 'Message final du test complet',
                    })
                }, 500)

                setTimeout(() => {
                    clearTimeout(timeout)
                    try {
                        // Vérifications finales
                        expect(events.length).toBeGreaterThanOrEqual(2)

                        const typingEvent = events.find(
                            (e) => e.type === 'typing' && e.data.isTyping
                        )
                        const stopTypingEvent = events.find(
                            (e) => e.type === 'typing' && !e.data.isTyping
                        )
                        const messageEvent = events.find(
                            (e) => e.type === 'message'
                        )

                        expect(typingEvent).toBeDefined()
                        expect(stopTypingEvent).toBeDefined()
                        expect(messageEvent).toBeDefined()
                        expect(messageEvent.data.content).toBe(
                            'Message final du test complet'
                        )

                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                }, 2000)
            })
        })
    })
})
