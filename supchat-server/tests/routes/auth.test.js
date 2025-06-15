const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const { userFactory } = require('../factories/userFactory')
const bcrypt = require('bcryptjs')

describe('POST /auth/login', () => {
    it('login with email and password', async () => {
        const hashedPassword = await bcrypt.hash('pass', 10)
        const user = await User.create(
            userFactory({ password: hashedPassword })
        )

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'pass' })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('token')
    })

    it('fails with wrong credentials', async () => {
        const hashedPassword = await bcrypt.hash('pass', 10)
        const user = await User.create(
            userFactory({ password: hashedPassword })
        )

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'wrong' })

        expect(res.status).toBe(401)
    })

    it('login with provider token', async () => {
        const user = await User.create(userFactory({ googleId: 'gid-1' }))

        const res = await request(app)
            .post('/api/auth/login')
            .send({ provider: 'google', token: 'fake' })

        expect(res.status).toBe(200)
    })
})
