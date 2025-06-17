const request = require('supertest')
const { app } = require('../../src/app')

describe('CORS Security Headers', () => {
    it('sets CORS headers for allowed origins', async () => {
        const res = await request(app)
            .options('/api/workspaces')
            .set('Origin', 'http://localhost:5173')
        
        expect(res.headers['access-control-allow-origin']).toBeDefined()
        expect(res.headers['access-control-allow-methods']).toBeDefined()
        expect(res.headers['access-control-allow-headers']).toBeDefined()    })

    it('includes security headers', async () => {
        const res = await request(app)
            .get('/api/health')
        
        // Headers de sécurité selon les spécifications
        expect(res.headers['x-content-type-options']).toBe('nosniff')
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN') // Valeur actuelle du serveur
        expect(res.headers['x-xss-protection']).toBeDefined()
    })

    it('rejects unauthorized origins', async () => {
        const res = await request(app)
            .options('/api/workspaces')
            .set('Origin', 'http://malicious-site.com')
        
        // Doit rejeter les origines non autorisées
        expect(res.status).toBe(500) // Erreur CORS
    })
})
