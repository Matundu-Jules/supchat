const { faker } = require('@faker-js/faker')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const Channel = require('../../models/Channel')
const jwt = require('jsonwebtoken')

class TestHelpers {
    static generateUniqueEmail(prefix = 'test') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`
    }

    static generateUniqueUsername() {
        return `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }

    static generateUniqueId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }

    static async createTestUser(overrides = {}) {
        const userData = {
            name: faker.person.fullName(),
            email: this.generateUniqueEmail(),
            username: this.generateUniqueUsername(),
            password: 'TestPassword123!',
            role: 'membre',
            ...overrides,
        }

        return await User.create(userData)
    }

    static async createTestWorkspace(owner, overrides = {}) {
        const workspaceData = {
            name: `test-workspace-${Date.now()}`,
            description: 'Test workspace',
            type: 'private',
            owner: owner._id,
            members: [owner._id],
            ...overrides,
        }

        return await Workspace.create(workspaceData)
    }

    static async createTestChannel(workspace, creator, overrides = {}) {
        const channelData = {
            name: `test-channel-${Date.now()}`,
            description: 'Test channel',
            type: 'public',
            workspace: workspace._id,
            creator: creator._id,
            members: [creator._id],
            ...overrides,
        }

        return await Channel.create(channelData)
    }

    static generateAuthToken(user) {
        return jwt.sign(
            {
                id: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion || 0,
            },
            process.env.JWT_SECRET || 'testsecret'
        )
    }

    static async cleanupDatabase() {
        try {
            await User.deleteMany({})
            await Workspace.deleteMany({})
            await Channel.deleteMany({})
        } catch (error) {
            console.log('Cleanup error (can be ignored):', error.message)
        }
    }
}

// Export pour compatibilité avec les anciens imports
module.exports = TestHelpers
module.exports.generateUniqueEmail = TestHelpers.generateUniqueEmail
module.exports.generateUniqueId = TestHelpers.generateUniqueId
module.exports.generateUniqueUsername = TestHelpers.generateUniqueUsername
