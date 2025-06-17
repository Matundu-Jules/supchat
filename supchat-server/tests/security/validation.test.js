const request = require('supertest')
const { app } = require('../../src/app')

describe('Input Validation Security', () => {
    it('rejects invalid workspace payload', async () => {
        const res = await request(app)
            .post('/api/workspaces')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .send({}) // Payload vide - manque le nom requis

        expect(res.status).toBe(400)
        expect(res.body.error).toBeDefined()
    })

    it('validates workspace name length', async () => {
        const res = await request(app)
            .post('/api/workspaces')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .send({ name: 'x'.repeat(101) }) // Nom trop long

        expect(res.status).toBe(400)
    })

    it('sanitizes XSS attempts', async () => {
        const res = await request(app)
            .post('/api/workspaces')
            .set('Authorization', `Bearer ${global.tokens.admin}`)
            .send({
                name: "<script>alert('xss')</script>",
                description: 'Test workspace',
            })

        // Doit créer le workspace mais nettoyer le contenu
        if (res.status === 201) {
            expect(res.body.workspace.name).not.toContain('<script>')
        } else {
            expect(res.status).toBe(400) // Ou rejeter complètement
        }
    })

    it('validates MongoDB ObjectId format', async () => {
        const res = await request(app)
            .get('/api/workspaces/invalid-object-id')
            .set('Authorization', `Bearer ${global.tokens.admin}`)

        expect(res.status).toBe(400)
    })
})
