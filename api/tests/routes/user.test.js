const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const path = require('path')
const fs = require('fs')
const { userFactory } = require('../factories/userFactory')

describe('PUT /api/user/profile', () => {
    it('should update user preferences successfully', async () => {
        const res = await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .send({
                name: 'Updated Name',
                status: 'Disponible',
                bio: 'Updated bio',
                preferences: {
                    notifications: true,
                    theme: 'dark',
                },
            })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.name).toBe('Updated Name')
        expect(res.body.data.status).toBe('Disponible')
        expect(res.body.data.bio).toBe('Updated bio')
    })

    it('should update user preferences with partial data', async () => {
        const res = await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${global.tokens.member}`)
            .send({
                name: 'Partial Update',
            })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.name).toBe('Partial Update')
    })

    it('should not allow empty status string', async () => {
        const res = await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .send({
                status: '',
            })

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
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
                .put('/api/user/profile')
                .set('Authorization', `Bearer ${global.tokens.admin}`)
                .send({ status })

            expect(res.status).toBe(200)
            expect(res.body.data.status).toBe(status)
        }
    })

    it('should reject invalid status values', async () => {
        const res = await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .send({
                status: 'Invalid Status',
            })

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })

    it('should require authentication', async () => {
        const res = await request(app).put('/api/user/profile').send({
            name: 'Should Fail',
        })

        expect(res.status).toBe(401)
    })
})

describe('POST /api/user/avatar', () => {
    const testImagePath = path.join(__dirname, '../fixtures/test-avatar.png')

    beforeAll(() => {
        // Create test fixtures directory if it doesn't exist
        const fixturesDir = path.join(__dirname, '../fixtures')
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true })
        }

        // Create a simple test image (1x1 PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
            0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
            0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
            0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63,
            0xf8, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
        ])
        fs.writeFileSync(testImagePath, testImageBuffer)
    })

    afterAll(() => {
        // Clean up test fixtures
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath)
        }
    })

    it('should upload avatar successfully', async () => {
        const res = await request(app)
            .post('/api/user/avatar')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .attach('avatar', testImagePath)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.avatar).toBeDefined()
        expect(res.body.data.avatar).toMatch(/\.png$/) // Should end with .png, not .png.png
        expect(res.body.data.avatar).not.toMatch(/\.png\.png$/) // Should not have double extension
    })

    it('should only accept image files', async () => {
        // Create a text file
        const textFilePath = path.join(__dirname, '../fixtures/test.txt')
        fs.writeFileSync(textFilePath, 'This is not an image')

        const res = await request(app)
            .post('/api/user/avatar')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .attach('avatar', textFilePath)

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)

        // Clean up
        fs.unlinkSync(textFilePath)
    })

    it('should require authentication for avatar upload', async () => {
        const res = await request(app)
            .post('/api/user/avatar')
            .attach('avatar', testImagePath)

        expect(res.status).toBe(401)
    })

    it('should require avatar file', async () => {
        const res = await request(app)
            .post('/api/user/avatar')
            .set('Authorization', `Bearer ${global.tokens.admin}`)

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })

    it('should handle large file rejection', async () => {
        // Create a large fake image (this will depend on your multer configuration)
        const largeImagePath = path.join(
            __dirname,
            '../fixtures/large-image.png'
        )
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024) // 10MB
        fs.writeFileSync(largeImagePath, largeBuffer)

        const res = await request(app)
            .post('/api/user/avatar')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .attach('avatar', largeImagePath)

        // This should fail if you have file size limits
        expect([400, 413]).toContain(res.status)

        // Clean up
        fs.unlinkSync(largeImagePath)
    })
})

describe('GET /api/user/profile', () => {
    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${global.tokens.admin}`)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.email).toBeDefined()
        expect(res.body.data.name).toBeDefined()
        expect(res.body.data.role).toBe('admin')
    })

    it('should require authentication for profile access', async () => {
        const res = await request(app).get('/api/user/profile')

        expect(res.status).toBe(401)
    })
})
