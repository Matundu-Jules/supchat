const request = require('supertest')
const { app } = require('../src/app')

describe('Test des routes Workspace', () => {
    const fakeId = '507f191e810c19729de860ea'

    it('Renvoie 401 lors de la création sans authentification', async () => {
        const res = await request(app)
            .post('/api/workspaces')
            .send({ name: 'Workspace Test' })
        expect(res.statusCode).toBe(401)
    })

    it('Renvoie 401 lors de la récupération', async () => {
        const res = await request(app).get('/api/workspaces')
        expect(res.statusCode).toBe(401)
    })

    it('Renvoie 401 lors de la mise à jour', async () => {
        const res = await request(app)
            .put(`/api/workspaces/${fakeId}`)
            .send({ name: 'Nouveau' })
        expect(res.statusCode).toBe(401)
    })

    it('Renvoie 401 lors de la suppression', async () => {
        const res = await request(app).delete(`/api/workspaces/${fakeId}`)
        expect(res.statusCode).toBe(401)
    })

    it("Renvoie 401 lors de l'invitation", async () => {
        const res = await request(app)
            .post(`/api/workspaces/${fakeId}/invite`)
            .send({ email: 'invite@example.com' })
        expect(res.statusCode).toBe(401)
    })

    it('Renvoie 401 lors de la jointure', async () => {
        const res = await request(app)
            .post('/api/workspaces/join')
            .send({ inviteCode: fakeId })
        expect(res.statusCode).toBe(401)
    })
})
