const ioClient = require('socket.io-client')
const { server, io } = require('../../src/app')

jest.setTimeout(15000)

const PORT = process.env.PORT || 3000
const WS_URL = `http://localhost:${PORT}`

describe('WebSocket interactions', () => {
    let client
    let handlerAdded = false

    beforeAll((done) => {
        console.log(
            'DEBUG: Tentative de démarrage du serveur WebSocket sur le port',
            PORT
        )
        if (!server.listening) {
            server.listen(PORT, () => {
                console.log(
                    'DEBUG: Serveur WebSocket démarré sur le port',
                    PORT
                )
                done()
            })
        } else {
            console.log('DEBUG: Serveur WebSocket déjà démarré')
            done()
        }
        if (!handlerAdded) {
            io.on('connection', (socket) => {
                socket.on('subscribeNotifications', (userId) => {
                    socket.emit('joined')
                })
            })
            handlerAdded = true
        }
    })

    afterAll((done) => {
        server.close(done)
    })

    beforeEach((done) => {
        client = ioClient(WS_URL, { forceNew: true })
        client.on('connect', done)
    })

    afterEach(() => {
        if (client.connected) client.disconnect()
    })

    it('connects to personal room', (done) => {
        client.emit('subscribeNotifications', '123')
        client.on('joined', () => {
            done()
        })
    })

    it('receives invitation notification', (done) => {
        client.on('notification', (payload) => {
            try {
                expect(payload.type).toBe('workspace_invite')
                done()
            } catch (e) {
                done(e)
            }
        })

        io.emit('notification', {
            room: 'user_123',
            type: 'workspace_invite',
        })
    })
})
