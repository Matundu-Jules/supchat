// Configuration des tests pour éviter les conflits
const mongoose = require('mongoose')

class TestHelper {
    static generateUniqueEmail(prefix = 'test') {
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 10000)
        return `${prefix}-${timestamp}-${random}@test.com`
    }

    static generateUniqueUsername(prefix = 'user') {
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 10000)
        return `${prefix}-${timestamp}-${random}`
    }

    static async cleanupDatabase() {
        // Nettoyer toutes les collections de test
        const collections = await mongoose.connection.db.collections()

        for (let collection of collections) {
            if (
                collection.collectionName.includes('test') ||
                process.env.NODE_ENV === 'test'
            ) {
                await collection.deleteMany({})
            }
        }
    }

    static async clearCollection(modelName) {
        if (mongoose.models[modelName]) {
            await mongoose.models[modelName].deleteMany({})
        }
    }

    static getValidRoutes() {
        return {
            auth: {
                register: '/api/auth/register',
                login: '/api/auth/login',
                logout: '/api/auth/logout',
                me: '/api/auth/me',
                changePassword: '/api/auth/me/password',
                setPassword: '/api/auth/set-password',
                deleteUser: '/api/auth/me',
                googleLogin: '/api/auth/google-login',
                facebookLogin: '/api/auth/facebook-login',
                forgotPassword: '/api/auth/forgot-password',
                resetPassword: '/api/auth/reset-password',
                refreshToken: '/api/auth/refresh',
            },
            workspaces: {
                create: '/api/workspaces',
                list: '/api/workspaces',
                get: (id) => `/api/workspaces/${id}`,
                update: (id) => `/api/workspaces/${id}`,
                delete: (id) => `/api/workspaces/${id}`,
                join: (id) => `/api/workspaces/${id}/join`,
                leave: (id) => `/api/workspaces/${id}/leave`,
                members: (id) => `/api/workspaces/${id}/members`,
                invite: (id) => `/api/workspaces/${id}/invite`,
            },
            channels: {
                create: '/api/channels',
                list: '/api/channels',
                get: (id) => `/api/channels/${id}`,
                update: (id) => `/api/channels/${id}`,
                delete: (id) => `/api/channels/${id}`,
                join: (id) => `/api/channels/${id}/join`,
                leave: (id) => `/api/channels/${id}/leave`,
                members: (id) => `/api/channels/${id}/members`,
            },
            messages: {
                create: '/api/messages',
                list: '/api/messages',
                get: (id) => `/api/messages/${id}`,
                update: (id) => `/api/messages/${id}`,
                delete: (id) => `/api/messages/${id}`,
                reactions: (id) => `/api/messages/${id}/reactions`,
                thread: (id) => `/api/messages/${id}/thread`,
            },
            notifications: {
                list: '/api/notifications',
                markRead: (id) => `/api/notifications/${id}/read`,
                markAllRead: '/api/notifications/read-all',
                preferences: '/api/notification-prefs',
            },
            search: {
                messages: '/api/search/messages',
                users: '/api/search/users',
                channels: '/api/search/channels',
            },
        }
    }

    static getExpectedResponseSchema() {
        return {
            user: {
                required: [
                    '_id',
                    'email',
                    'username',
                    'createdAt',
                    'updatedAt',
                ],
                forbidden: ['password', '__v'],
            },
            workspace: {
                required: [
                    '_id',
                    'name',
                    'owner',
                    'members',
                    'createdAt',
                    'updatedAt',
                ],
                forbidden: ['__v'],
            },
            channel: {
                required: [
                    '_id',
                    'name',
                    'workspace',
                    'members',
                    'createdAt',
                    'updatedAt',
                ],
                forbidden: ['__v'],
            },
            message: {
                required: [
                    '_id',
                    'content',
                    'author',
                    'channel',
                    'workspace',
                    'createdAt',
                    'updatedAt',
                ],
                forbidden: ['__v'],
            },
            notification: {
                required: [
                    '_id',
                    'recipient',
                    'type',
                    'message',
                    'isRead',
                    'createdAt',
                ],
                forbidden: ['__v'],
            },
        }
    }

    static validateResponseSchema(response, schemaType) {
        const schema = this.getExpectedResponseSchema()[schemaType]
        if (!schema) return true

        // Vérifier les propriétés requises
        for (const prop of schema.required) {
            if (!response.hasOwnProperty(prop)) {
                throw new Error(
                    `Property '${prop}' is required but missing from response`
                )
            }
        }

        // Vérifier les propriétés interdites
        for (const prop of schema.forbidden) {
            if (response.hasOwnProperty(prop)) {
                throw new Error(
                    `Property '${prop}' should not be present in response`
                )
            }
        }

        return true
    }

    static async setupTestEnvironment() {
        // Configuration spécifique pour les tests
        if (process.env.NODE_ENV !== 'test') {
            process.env.NODE_ENV = 'test'
        }

        // Utiliser une base de données de test séparée
        if (!process.env.MONGODB_URI_TEST) {
            process.env.MONGODB_URI_TEST =
                'mongodb://localhost:27017/supchat_test'
        }
    }

    static getTestTimeouts() {
        return {
            short: 5000, // 5 secondes
            medium: 10000, // 10 secondes
            long: 20000, // 20 secondes
            websocket: 30000, // 30 secondes pour WebSocket
        }
    }
}

module.exports = TestHelper
