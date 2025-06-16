const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const { channelFactory } = require('../factories/channelFactory')
const { messageFactory } = require('../factories/messageFactory')
const TestHelpers = require('../helpers/testHelpers')
const bcrypt = require('bcryptjs')

/**
 * Tests d'intégration pour les Intégrations et la Recherche
 * Couverture :
 * - Intégrations (Google Drive, Microsoft Teams, GitHub)
 * - Bots (rappels, sondages, automatisation API tierces)
 * - Recherche unifiée (messages, fichiers, channels, utilisateurs)
 * - Recherche avec aperçu de contexte
 */
describe("Intégrations & Recherche - Tests d'intégration", () => {
    let authToken
    let user
    let workspace
    let channel

    beforeEach(async () => {
        // Nettoyer les données existantes
        await User.deleteMany({})
        await Workspace.deleteMany({})
        await Channel.deleteMany({})
        await Message.deleteMany({})

        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        user = await User.create(
            userFactory({
                email: TestHelpers.generateUniqueEmail(),
                password: hashedPassword,
                username: TestHelpers.generateUniqueUsername(),
            })
        )

        workspace = await Workspace.create(
            workspaceFactory({
                owner: user._id,
                members: [user._id],
            })
        )

        channel = await Channel.create(
            channelFactory({
                name: 'general',
                workspace: workspace._id,
                members: [user._id],
            })
        )

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'TestPassword123!' })
        authToken = userLogin.body.token
    })

    describe('Recherche Unifiée', () => {
        beforeEach(async () => {
            // Créer du contenu de test pour la recherche
            await Message.create(
                messageFactory({
                    content: 'Discussion importante sur le projet JavaScript',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            await Message.create(
                messageFactory({
                    content: 'Réunion prévue demain pour parler de React',
                    userId: user._id,
                    channel: channel._id,
                })
            )

            await Message.create(
                messageFactory({
                    content:
                        "Code review nécessaire sur le module d'authentification",
                    userId: user._id,
                    channel: channel._id,
                })
            )

            await Channel.create(
                channelFactory({
                    name: 'javascript-dev',
                    description: 'Channel pour le développement JavaScript',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )

            await Channel.create(
                channelFactory({
                    name: 'react-team',
                    description: 'Équipe React et frontend',
                    workspace: workspace._id,
                    members: [user._id],
                })
            )
        })

        describe('GET /api/search', () => {
            it('devrait rechercher dans tous les types de contenu', async () => {
                const res = await request(app)
                    .get('/api/search?q=JavaScript')
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('messages')
                expect(res.body).toHaveProperty('channels')
                expect(res.body).toHaveProperty('users')

                expect(res.body.messages.length).toBeGreaterThan(0)
                expect(res.body.channels.length).toBeGreaterThan(0)
            })

            it('devrait filtrer par type de contenu', async () => {
                const res = await request(app)
                    .get('/api/search?q=React&type=messages')
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('messages')
                expect(res.body.messages.length).toBeGreaterThan(0)
                expect(res.body.messages[0].content).toContain('React')
            })

            it('devrait rechercher dans les channels', async () => {
                const res = await request(app)
                    .get('/api/search?q=javascript&type=channels')
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('channels')
                expect(res.body.channels.length).toBeGreaterThan(0)
                expect(res.body.channels[0].name).toContain('javascript')
            })

            it('devrait fournir un aperçu de contexte pour les messages', async () => {
                const res = await request(app)
                    .get('/api/search?q=authentification&type=messages')
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body.messages.length).toBeGreaterThan(0)
                expect(res.body.messages[0]).toHaveProperty('context')
                expect(res.body.messages[0]).toHaveProperty('channel')
                expect(res.body.messages[0]).toHaveProperty('timestamp')
            })

            it('devrait limiter les résultats par défaut', async () => {
                const res = await request(app)
                    .get('/api/search?q=e') // Recherche très large
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body.messages.length).toBeLessThanOrEqual(10)
                expect(res.body.channels.length).toBeLessThanOrEqual(10)
            })

            it('devrait permettre la pagination des résultats', async () => {
                const res = await request(app)
                    .get('/api/search?q=e&page=1&limit=5')
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('pagination')
                expect(res.body.pagination).toHaveProperty('currentPage', 1)
                expect(res.body.pagination).toHaveProperty('limit', 5)
            })
        })

        describe('GET /api/search/advanced', () => {
            it('devrait permettre une recherche avancée avec filtres', async () => {
                const res = await request(app)
                    .get(
                        `/api/search/advanced?q=projet&channel=${channel._id}&fromDate=2024-01-01`
                    )
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('messages')
            })

            it('devrait rechercher par auteur', async () => {
                const res = await request(app)
                    .get(`/api/search/advanced?q=*&author=${user._id}`)
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(
                    res.body.messages.every(
                        (m) => m.userId === user._id.toString()
                    )
                ).toBe(true)
            })

            it('devrait rechercher par période', async () => {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)

                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)

                const res = await request(app)
                    .get(
                        `/api/search/advanced?q=*&fromDate=${yesterday.toISOString()}&toDate=${tomorrow.toISOString()}`
                    )
                    .set('Authorization', `Bearer ${authToken}`)

                expect(res.statusCode).toBe(200)
                expect(res.body).toHaveProperty('messages')
            })
        })
    })

    describe('Intégrations Externes', () => {
        describe('Google Drive Integration', () => {
            describe('POST /api/integrations/google-drive/connect', () => {
                it('devrait connecter un compte Google Drive', async () => {
                    const integrationData = {
                        authCode: 'mock_google_auth_code',
                        workspaceId: workspace._id,
                    }

                    const res = await request(app)
                        .post('/api/integrations/google-drive/connect')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(integrationData)

                    expect(res.statusCode).toBe(200)
                    expect(res.body).toHaveProperty('integration')
                    expect(res.body.integration).toHaveProperty(
                        'type',
                        'google-drive'
                    )
                    expect(res.body.integration).toHaveProperty(
                        'connected',
                        true
                    )
                })
            })

            describe('POST /api/integrations/google-drive/share', () => {
                it('devrait partager un fichier Google Drive dans un channel', async () => {
                    const shareData = {
                        fileId: 'google_drive_file_123',
                        fileName: 'Document important.pdf',
                        channelId: channel._id,
                    }

                    const res = await request(app)
                        .post('/api/integrations/google-drive/share')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(shareData)

                    expect(res.statusCode).toBe(201)
                    expect(res.body.message).toHaveProperty(
                        'type',
                        'file_share'
                    )
                    expect(res.body.message).toHaveProperty('content')
                    expect(res.body.message.content).toContain(
                        'Document important.pdf'
                    )
                })
            })
        })

        describe('GitHub Integration', () => {
            describe('POST /api/integrations/github/connect', () => {
                it('devrait connecter un repository GitHub', async () => {
                    const integrationData = {
                        repositoryUrl: 'https://github.com/user/repo',
                        accessToken: 'github_access_token_123',
                        workspaceId: workspace._id,
                        channelId: channel._id,
                    }

                    const res = await request(app)
                        .post('/api/integrations/github/connect')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(integrationData)

                    expect(res.statusCode).toBe(200)
                    expect(res.body).toHaveProperty('integration')
                    expect(res.body.integration).toHaveProperty(
                        'type',
                        'github'
                    )
                })
            })

            describe('POST /api/integrations/github/webhook', () => {
                it('devrait traiter un webhook GitHub de push', async () => {
                    const webhookData = {
                        action: 'push',
                        repository: {
                            name: 'test-repo',
                            url: 'https://github.com/user/test-repo',
                        },
                        commits: [
                            {
                                message: 'Fix: correction du bug critique',
                                author: { name: 'Dev User' },
                                url: 'https://github.com/user/test-repo/commit/abc123',
                            },
                        ],
                    }

                    const res = await request(app)
                        .post('/api/integrations/github/webhook')
                        .set('X-GitHub-Event', 'push')
                        .send(webhookData)

                    expect(res.statusCode).toBe(200)

                    // Vérifier qu'un message a été créé dans le channel
                    const messages = await Message.find({
                        channel: channel._id,
                        type: 'integration',
                    })
                    expect(messages.length).toBeGreaterThan(0)
                })
            })
        })

        describe('Microsoft Teams Integration', () => {
            describe('POST /api/integrations/teams/connect', () => {
                it('devrait connecter avec Microsoft Teams', async () => {
                    const integrationData = {
                        tenantId: 'microsoft_tenant_123',
                        accessToken: 'teams_access_token',
                        workspaceId: workspace._id,
                    }

                    const res = await request(app)
                        .post('/api/integrations/teams/connect')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(integrationData)

                    expect(res.statusCode).toBe(200)
                    expect(res.body).toHaveProperty('integration')
                })
            })
        })
    })

    describe('Bots et Automatisation', () => {
        describe('Reminder Bot', () => {
            describe('POST /api/bots/reminder/create', () => {
                it('devrait créer un rappel automatique', async () => {
                    const reminderData = {
                        message: 'Réunion équipe dans 15 minutes',
                        scheduledFor: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                        channelId: channel._id,
                        recurring: false,
                    }

                    const res = await request(app)
                        .post('/api/bots/reminder/create')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(reminderData)

                    expect(res.statusCode).toBe(201)
                    expect(res.body.reminder).toHaveProperty(
                        'message',
                        reminderData.message
                    )
                    expect(res.body.reminder).toHaveProperty('active', true)
                })

                it('devrait créer un rappel récurrent', async () => {
                    const reminderData = {
                        message: 'Daily standup',
                        scheduledFor: new Date(
                            Date.now() + 24 * 60 * 60 * 1000
                        ), // 24h
                        channelId: channel._id,
                        recurring: true,
                        recurringPattern: 'daily',
                    }

                    const res = await request(app)
                        .post('/api/bots/reminder/create')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(reminderData)

                    expect(res.statusCode).toBe(201)
                    expect(res.body.reminder).toHaveProperty('recurring', true)
                })
            })
        })

        describe('Poll Bot', () => {
            describe('POST /api/bots/poll/create', () => {
                it('devrait créer un sondage', async () => {
                    const pollData = {
                        question: 'Quelle technologie préférez-vous ?',
                        options: ['React', 'Vue.js', 'Angular', 'Svelte'],
                        channelId: channel._id,
                        allowMultiple: false,
                        expiresAt: new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                        ), // 7 jours
                    }

                    const res = await request(app)
                        .post('/api/bots/poll/create')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(pollData)

                    expect(res.statusCode).toBe(201)
                    expect(res.body.poll).toHaveProperty(
                        'question',
                        pollData.question
                    )
                    expect(res.body.poll.options).toHaveLength(4)
                    expect(res.body.message).toHaveProperty('type', 'poll')
                })
            })

            describe('POST /api/bots/poll/:id/vote', () => {
                it('devrait permettre de voter dans un sondage', async () => {
                    // Créer un sondage d'abord
                    const pollRes = await request(app)
                        .post('/api/bots/poll/create')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            question: 'Test poll',
                            options: ['Option A', 'Option B'],
                            channelId: channel._id,
                        })

                    const pollId = pollRes.body.poll._id

                    const voteData = {
                        optionIndex: 0,
                    }

                    const res = await request(app)
                        .post(`/api/bots/poll/${pollId}/vote`)
                        .set('Authorization', `Bearer ${authToken}`)
                        .send(voteData)

                    expect(res.statusCode).toBe(200)
                    expect(res.body.poll.options[0].votes).toContain(
                        user._id.toString()
                    )
                })
            })
        })

        describe('Custom Bot Integration', () => {
            describe('POST /api/bots/custom/webhook', () => {
                it('devrait traiter un webhook de bot personnalisé', async () => {
                    const webhookData = {
                        botId: 'custom_bot_123',
                        channelId: channel._id,
                        message:
                            'Notification du système de monitoring: Tout va bien! 🟢',
                        data: {
                            status: 'healthy',
                            uptime: '99.9%',
                        },
                    }

                    const res = await request(app)
                        .post('/api/bots/custom/webhook')
                        .set('Authorization', 'Bearer custom_bot_token')
                        .send(webhookData)

                    expect(res.statusCode).toBe(200)

                    // Vérifier qu'un message bot a été créé
                    const messages = await Message.find({
                        channel: channel._id,
                        type: 'bot',
                    })
                    expect(messages.length).toBeGreaterThan(0)
                })
            })
        })
    })

    describe('Recherche de Fichiers', () => {
        it('devrait rechercher les fichiers partagés', async () => {
            // Créer des messages avec fichiers
            await Message.create(
                messageFactory({
                    content: 'Voici le rapport mensuel',
                    userId: user._id,
                    channel: channel._id,
                    type: 'file',
                    fileName: 'rapport_janvier.pdf',
                    fileUrl: '/uploads/rapport_janvier.pdf',
                })
            )

            await Message.create(
                messageFactory({
                    content: 'Image de la réunion',
                    userId: user._id,
                    channel: channel._id,
                    type: 'image',
                    fileName: 'meeting_photo.jpg',
                    fileUrl: '/uploads/meeting_photo.jpg',
                })
            )

            const res = await request(app)
                .get('/api/search?q=rapport&type=files')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('files')
            expect(res.body.files.length).toBeGreaterThan(0)
            expect(res.body.files[0]).toHaveProperty('fileName')
            expect(res.body.files[0].fileName).toContain('rapport')
        })

        it('devrait filtrer les fichiers par type', async () => {
            const res = await request(app)
                .get('/api/search?q=*&type=files&fileType=image')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('files')
            if (res.body.files.length > 0) {
                expect(res.body.files.every((f) => f.type === 'image')).toBe(
                    true
                )
            }
        })
    })

    describe('GET /api/integrations', () => {
        it('devrait lister les intégrations disponibles', async () => {
            const res = await request(app)
                .get('/api/integrations')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('integrations')
            expect(res.body.integrations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ type: 'google-drive' }),
                    expect.objectContaining({ type: 'github' }),
                    expect.objectContaining({ type: 'microsoft-teams' }),
                ])
            )
        })
    })

    describe('DELETE /api/integrations/:id', () => {
        it('devrait supprimer une intégration', async () => {
            // Simuler une intégration existante
            const integrationRes = await request(app)
                .post('/api/integrations/google-drive/connect')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    authCode: 'mock_code',
                    workspaceId: workspace._id,
                })

            const integrationId = integrationRes.body.integration._id

            const res = await request(app)
                .delete(`/api/integrations/${integrationId}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty(
                'message',
                'Integration supprimée avec succès'
            )
        })
    })
})
