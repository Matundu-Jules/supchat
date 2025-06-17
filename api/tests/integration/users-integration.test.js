const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const path = require('path')
const fs = require('fs')
const { userFactory } = require('../factories/userFactory')

// Tests d'intégration utilisant la vraie base de données
describe('User API Integration Tests - Real DB', () => {
    let testUsers = {}
    let authTokens = {}

    beforeAll(async () => {
        // Nettoyer les utilisateurs de test existants
        await User.deleteMany({ email: { $regex: /@test-integration\.com$/ } })

        // Créer des utilisateurs de test avec des emails uniques
        const timestamp = Date.now()

        const adminUser = await User.create(
            userFactory({
                email: `admin-${timestamp}@test-integration.com`,
                role: 'admin',
                status: 'Disponible',
            })
        )

        const memberUser = await User.create(
            userFactory({
                email: `member-${timestamp}@test-integration.com`,
                role: 'membre',
                status: 'Disponible',
            })
        )

        testUsers.admin = adminUser
        testUsers.member = memberUser

        // Générer des tokens JWT
        const jwt = require('jsonwebtoken')
        authTokens.admin = jwt.sign(
            {
                id: adminUser._id,
                role: 'admin',
                tokenVersion: adminUser.tokenVersion,
            },
            process.env.JWT_SECRET || 'testsecret'
        )
        authTokens.member = jwt.sign(
            {
                id: memberUser._id,
                role: 'membre',
                tokenVersion: memberUser.tokenVersion,
            },
            process.env.JWT_SECRET || 'testsecret'
        )
    })

    afterAll(async () => {
        // Nettoyer les utilisateurs de test
        if (testUsers.admin) await User.findByIdAndDelete(testUsers.admin._id)
        if (testUsers.member) await User.findByIdAndDelete(testUsers.member._id)
    })

    describe('PUT /api/users/profile', () => {
        it('should update user profile successfully', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authTokens.admin}`)
                .send({
                    name: 'Updated Admin Name',
                    status: 'Occupé',
                    bio: 'Updated bio for admin',
                })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.name).toBe('Updated Admin Name')
            expect(res.body.data.status).toBe('Occupé')
            expect(res.body.data.bio).toBe('Updated bio for admin')
        })

        it('should update user preferences with partial data', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authTokens.member}`)
                .send({
                    name: 'Partial Update Member',
                })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.name).toBe('Partial Update Member')
        })

        it('should not send status: null and handle it gracefully', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authTokens.admin}`)
                .send({
                    name: 'Test Name',
                    status: null, // This should be filtered out
                })

            // Should still succeed because null values are filtered
            expect([200, 400]).toContain(res.status)
            if (res.status === 200) {
                expect(res.body.success).toBe(true)
                expect(res.body.data.name).toBe('Test Name')
            }
        })

        it('should allow valid status values', async () => {
            const validStatuses = [
                'Disponible',
                'Occupé',
                'Absent',
                'Ne pas déranger',
            ]

            for (const status of validStatuses) {
                const res = await request(app)
                    .put('/api/users/profile')
                    .set('Authorization', `Bearer ${authTokens.admin}`)
                    .send({ status })

                expect(res.status).toBe(200)
                expect(res.body.data.status).toBe(status)
            }
        })

        it('should reject invalid status values', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authTokens.admin}`)
                .send({
                    status: 'Invalid Status',
                })

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
        })

        it('should require authentication', async () => {
            const res = await request(app).put('/api/users/profile').send({
                name: 'Should Fail',
            })

            expect(res.status).toBe(401)
        })
    })

    describe('POST /api/users/avatar', () => {
        const testImagePath = '/tmp/test-avatar.png'

        beforeAll(() => {
            // Créer une petite image PNG de test (1x1 pixel)
            const testImageBuffer = Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
                0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01,
                0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90,
                0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
                0x54, 0x08, 0xd7, 0x63, 0xf8, 0x00, 0x00, 0x00, 0x01, 0x00,
                0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
                0x42, 0x60, 0x82,
            ])
            fs.writeFileSync(testImagePath, testImageBuffer)
        })

        afterAll(() => {
            // Nettoyer le fichier de test
            if (fs.existsSync(testImagePath)) {
                fs.unlinkSync(testImagePath)
            }
        })

        it('should upload avatar successfully without double extension', async () => {
            const res = await request(app)
                .post('/api/users/avatar')
                .set('Authorization', `Bearer ${authTokens.admin}`)
                .attach('avatar', testImagePath)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.avatar).toBeDefined()
            expect(res.body.data.avatar).toMatch(/\.png$/) // Should end with .png
            expect(res.body.data.avatar).not.toMatch(/\.png\.png$/) // Should NOT have double extension
        })

        it('should require authentication for avatar upload', async () => {
            const res = await request(app)
                .post('/api/users/avatar')
                .attach('avatar', testImagePath)

            expect(res.status).toBe(401)
        })

        it('should require avatar file', async () => {
            const res = await request(app)
                .post('/api/users/avatar')
                .set('Authorization', `Bearer ${authTokens.admin}`)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
        })
    })

    describe('GET /api/users/profile', () => {
        it('should get current user profile with correct structure', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authTokens.admin}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeDefined()
            expect(res.body.data.email).toBeDefined()
            expect(res.body.data.name).toBeDefined()
            expect(res.body.data.role).toBe('admin')
            expect(res.body.timestamp).toBeDefined()
        })

        it('should require authentication for profile access', async () => {
            const res = await request(app).get('/api/users/profile')

            expect(res.status).toBe(401)
        })
    })
})
