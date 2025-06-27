/**
 * Tests de charge pour la messagerie WebSocket
 * Vérifie les performances avec multiple connexions simultanées
 */

const { Server } = require('socket.io')
const { createServer } = require('http')
const Client = require('socket.io-client')
const app = require('../../src/app')
const { connectDB, disconnectDB } = require('../utils/database')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const jwt = require('jsonwebtoken')

describe('WebSocket Load Testing', () => {
    let httpServer
    let httpServerAddr
    let ioServer
    let testUser
    let testWorkspace
    let testChannel
    let authToken

    beforeAll(async () => {
        await connectDB()

        httpServer = createServer(app)
        ioServer = new Server(httpServer, {
            // Configuration optimisée pour les tests de charge
            transports: ['websocket'],
            pingTimeout: 60000,
            pingInterval: 25000,
        })

        require('../../socket')(ioServer)

        httpServer.listen(() => {
            httpServerAddr = httpServer.address()
        })

        // Créer des données de test une seule fois
        testUser = await User.create({
            username: 'loadtestuser',
            email: 'loadtest@example.com',
            password: 'password123',
        })

        testWorkspace = await Workspace.create({
            name: 'Load Test Workspace',
            ownerId: testUser._id,
            members: [testUser._id],
        })

        testChannel = await Channel.create({
            name: 'load-test-channel',
            workspaceId: testWorkspace._id,
            members: [testUser._id],
        })

        authToken = jwt.sign(
            { userId: testUser._id },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        )
    })

    afterAll(async () => {
        ioServer.close()
        httpServer.close()
        await disconnectDB()
    })

    describe('Connexions multiples', () => {
        test('devrait gérer 50 connexions simultanées', async () => {
            const numberOfClients = 50
            const clients = []
            const connections = []

            try {
                // Créer toutes les connexions
                for (let i = 0; i < numberOfClients; i++) {
                    const client = new Client(
                        `http://localhost:${httpServerAddr.port}`,
                        {
                            auth: { token: authToken },
                            transports: ['websocket'],
                        }
                    )

                    clients.push(client)

                    const connectionPromise = new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error(`Client ${i} connection timeout`))
                        }, 5000)

                        client.on('connect', () => {
                            clearTimeout(timeout)
                            resolve(i)
                        })

                        client.on('connect_error', (error) => {
                            clearTimeout(timeout)
                            reject(error)
                        })
                    })

                    connections.push(connectionPromise)
                }

                // Attendre que toutes les connexions soient établies
                const connectedClients = await Promise.all(connections)
                expect(connectedClients).toHaveLength(numberOfClients)

                // Vérifier que tous les clients sont connectés
                const connectedCount = clients.filter(
                    (client) => client.connected
                ).length
                expect(connectedCount).toBe(numberOfClients)
            } finally {
                // Nettoyer toutes les connexions
                clients.forEach((client) => {
                    if (client.connected) {
                        client.disconnect()
                    }
                })
            }
        }, 30000) // Timeout de 30 secondes

        test('devrait gérer la déconnexion simultanée de multiples clients', async () => {
            const numberOfClients = 20
            const clients = []

            // Créer et connecter les clients
            for (let i = 0; i < numberOfClients; i++) {
                const client = new Client(
                    `http://localhost:${httpServerAddr.port}`,
                    {
                        auth: { token: authToken },
                        transports: ['websocket'],
                    }
                )

                clients.push(client)

                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`Client ${i} connection timeout`))
                    }, 3000)

                    client.on('connect', () => {
                        clearTimeout(timeout)
                        resolve()
                    })

                    client.on('connect_error', (error) => {
                        clearTimeout(timeout)
                        reject(error)
                    })
                })
            }

            // Déconnecter tous les clients simultanément
            const disconnectionPromises = clients.map((client, index) => {
                return new Promise((resolve) => {
                    client.on('disconnect', () => {
                        resolve(index)
                    })
                    client.disconnect()
                })
            })

            const disconnectedClients = await Promise.all(disconnectionPromises)
            expect(disconnectedClients).toHaveLength(numberOfClients)
        }, 20000)
    })

    describe('Messagerie sous charge', () => {
        test("devrait gérer l'envoi de messages par 10 clients simultanément", async () => {
            const numberOfClients = 10
            const messagesPerClient = 5
            const clients = []
            const allMessages = []

            try {
                // Créer et connecter les clients
                for (let i = 0; i < numberOfClients; i++) {
                    const client = new Client(
                        `http://localhost:${httpServerAddr.port}`,
                        {
                            auth: { token: authToken },
                            transports: ['websocket'],
                        }
                    )

                    clients.push(client)

                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error(`Client ${i} connection timeout`))
                        }, 3000)

                        client.on('connect', () => {
                            clearTimeout(timeout)
                            // Rejoindre le channel
                            client.emit(
                                'join-channel',
                                testChannel._id.toString()
                            )
                            resolve()
                        })

                        client.on('connect_error', (error) => {
                            clearTimeout(timeout)
                            reject(error)
                        })
                    })

                    // Écouter les messages
                    client.on('new-message', (message) => {
                        allMessages.push(message)
                    })
                }

                // Attendre un peu pour que tous les clients rejoignent le channel
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Chaque client envoie plusieurs messages
                const sendPromises = []

                for (
                    let clientIndex = 0;
                    clientIndex < numberOfClients;
                    clientIndex++
                ) {
                    for (
                        let msgIndex = 0;
                        msgIndex < messagesPerClient;
                        msgIndex++
                    ) {
                        const messageContent = `Message ${msgIndex} du client ${clientIndex}`

                        const sendPromise = new Promise((resolve) => {
                            clients[clientIndex].emit('send-message', {
                                content: messageContent,
                                channelId: testChannel._id.toString(),
                            })

                            // Petite pause entre les messages pour éviter la surcharge
                            setTimeout(resolve, 50)
                        })

                        sendPromises.push(sendPromise)
                    }
                }

                await Promise.all(sendPromises)

                // Attendre que tous les messages soient reçus
                await new Promise((resolve) => setTimeout(resolve, 2000))

                // Vérifier qu'on a reçu le bon nombre de messages
                // Chaque message est reçu par tous les clients connectés
                const expectedTotalMessages =
                    numberOfClients * messagesPerClient * numberOfClients
                expect(allMessages.length).toBe(expectedTotalMessages)
            } finally {
                clients.forEach((client) => {
                    if (client.connected) {
                        client.disconnect()
                    }
                })
            }
        }, 30000)

        test('devrait maintenir la performance avec des messages volumineux', async () => {
            const numberOfClients = 5
            const clients = []
            const receivedMessages = []
            const largeContent = 'A'.repeat(1000) // Message de 1KB

            try {
                // Créer et connecter les clients
                for (let i = 0; i < numberOfClients; i++) {
                    const client = new Client(
                        `http://localhost:${httpServerAddr.port}`,
                        {
                            auth: { token: authToken },
                            transports: ['websocket'],
                        }
                    )

                    clients.push(client)

                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error(`Client ${i} connection timeout`))
                        }, 3000)

                        client.on('connect', () => {
                            clearTimeout(timeout)
                            client.emit(
                                'join-channel',
                                testChannel._id.toString()
                            )
                            resolve()
                        })

                        client.on('connect_error', (error) => {
                            clearTimeout(timeout)
                            reject(error)
                        })
                    })

                    client.on('new-message', (message) => {
                        receivedMessages.push({
                            clientIndex: i,
                            messageSize: message.content.length,
                            timestamp: Date.now(),
                        })
                    })
                }

                await new Promise((resolve) => setTimeout(resolve, 500))

                const startTime = Date.now()

                // Envoyer des messages volumineux
                const sendPromises = clients.map((client, index) => {
                    return new Promise((resolve) => {
                        client.emit('send-message', {
                            content: `${largeContent} - Client ${index}`,
                            channelId: testChannel._id.toString(),
                        })
                        resolve()
                    })
                })

                await Promise.all(sendPromises)
                await new Promise((resolve) => setTimeout(resolve, 2000))

                const endTime = Date.now()
                const totalTime = endTime - startTime

                // Vérifier les performances
                expect(totalTime).toBeLessThan(5000) // Moins de 5 secondes
                expect(receivedMessages.length).toBe(
                    numberOfClients * numberOfClients
                )

                // Vérifier que tous les messages ont la bonne taille
                receivedMessages.forEach((msg) => {
                    expect(msg.messageSize).toBeGreaterThan(1000)
                })
            } finally {
                clients.forEach((client) => {
                    if (client.connected) {
                        client.disconnect()
                    }
                })
            }
        }, 20000)
    })

    describe('Résilience sous charge', () => {
        test('devrait récupérer après des déconnexions/reconnexions multiples', async () => {
            const numberOfClients = 5
            const clients = []
            let reconnectionCount = 0

            try {
                // Créer les clients avec reconnexion automatique
                for (let i = 0; i < numberOfClients; i++) {
                    const client = new Client(
                        `http://localhost:${httpServerAddr.port}`,
                        {
                            auth: { token: authToken },
                            transports: ['websocket'],
                            autoConnect: false,
                        }
                    )

                    clients.push(client)

                    client.on('reconnect', () => {
                        reconnectionCount++
                    })
                }

                // Connecter tous les clients
                const connectionPromises = clients.map((client) => {
                    return new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Connection timeout'))
                        }, 3000)

                        client.on('connect', () => {
                            clearTimeout(timeout)
                            resolve()
                        })

                        client.connect()
                    })
                })

                await Promise.all(connectionPromises)

                // Simuler des déconnexions/reconnexions
                for (let cycle = 0; cycle < 3; cycle++) {
                    // Déconnecter la moitié des clients
                    const clientsToDisconnect = clients.slice(
                        0,
                        Math.floor(numberOfClients / 2)
                    )

                    clientsToDisconnect.forEach((client) => {
                        client.disconnect()
                    })

                    await new Promise((resolve) => setTimeout(resolve, 1000))

                    // Reconnecter
                    const reconnectionPromises = clientsToDisconnect.map(
                        (client) => {
                            return new Promise((resolve, reject) => {
                                const timeout = setTimeout(() => {
                                    reject(new Error('Reconnection timeout'))
                                }, 3000)

                                const handler = () => {
                                    clearTimeout(timeout)
                                    client.off('connect', handler)
                                    resolve()
                                }

                                client.on('connect', handler)
                                client.connect()
                            })
                        }
                    )

                    await Promise.all(reconnectionPromises)
                    await new Promise((resolve) => setTimeout(resolve, 500))
                }

                // Vérifier que tous les clients sont reconnectés
                const connectedCount = clients.filter(
                    (client) => client.connected
                ).length
                expect(connectedCount).toBe(numberOfClients)
            } finally {
                clients.forEach((client) => {
                    if (client.connected) {
                        client.disconnect()
                    }
                })
            }
        }, 30000)
    })

    describe('Métriques de performance', () => {
        test('devrait mesurer la latence des messages', async () => {
            const numberOfMessages = 10
            const client = new Client(
                `http://localhost:${httpServerAddr.port}`,
                {
                    auth: { token: authToken },
                    transports: ['websocket'],
                }
            )

            const latencies = []

            try {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Connection timeout'))
                    }, 3000)

                    client.on('connect', () => {
                        clearTimeout(timeout)
                        client.emit('join-channel', testChannel._id.toString())
                        resolve()
                    })
                })

                for (let i = 0; i < numberOfMessages; i++) {
                    const startTime = Date.now()

                    await new Promise((resolve) => {
                        client.once('message-sent', () => {
                            const endTime = Date.now()
                            const latency = endTime - startTime
                            latencies.push(latency)
                            resolve()
                        })

                        client.emit('send-message', {
                            content: `Latency test message ${i}`,
                            channelId: testChannel._id.toString(),
                        })
                    })

                    // Petite pause entre les messages
                    await new Promise((resolve) => setTimeout(resolve, 100))
                }

                // Calculer les métriques
                const avgLatency =
                    latencies.reduce((sum, lat) => sum + lat, 0) /
                    latencies.length
                const maxLatency = Math.max(...latencies)
                const minLatency = Math.min(...latencies)

                console.log(`Latency metrics:
          - Average: ${avgLatency.toFixed(2)}ms
          - Maximum: ${maxLatency}ms
          - Minimum: ${minLatency}ms`)

                // Vérifier que la latence reste acceptable
                expect(avgLatency).toBeLessThan(1000) // Moins de 1 seconde en moyenne
                expect(maxLatency).toBeLessThan(2000) // Moins de 2 secondes au maximum
            } finally {
                if (client.connected) {
                    client.disconnect()
                }
            }
        }, 20000)
    })
})
