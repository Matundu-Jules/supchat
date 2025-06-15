const request = require('supertest')
const { app } = require('../../src/app')

describe('Security headers', () => {
    it('sets CORS headers', async () => {
        const res = await request(app)
            .options('/api/workspaces')
            .set('Origin', 'http://localhost:5173')
        expect(res.headers['access-control-allow-origin']).toBeDefined()
    })
})
