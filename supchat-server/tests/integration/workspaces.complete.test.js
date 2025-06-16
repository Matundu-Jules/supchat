const request = require('supertest')
const { app } = require('../../src/app')
const User = require('../../models/User')
const Workspace = require('../../models/Workspace')
const { userFactory } = require('../factories/userFactory')
const { workspaceFactory } = require('../factories/workspaceFactory')
const TestHelpers = require('../helpers/testHelpers')
const bcrypt = require('bcryptjs')

/**
 * Tests d'intégration pour les Workspaces
 * Couverture :
 * - Création de workspaces (publics/privés)
 * - Gestion des membres
 * - Invitations par email/lien
 * - Permissions sur les workspaces
 * - Dashboard des workspaces
 */
describe("Workspaces - Tests d'intégration", () => {
    let authToken
    let user
    let adminToken
    let adminUser
    let userEmail
    let adminEmail

    beforeEach(async () => {
        // Nettoyer les données existantes
        await User.deleteMany({})
        await Workspace.deleteMany({})

        // Créer un utilisateur normal et un admin
        const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

        userEmail = TestHelpers.generateUniqueEmail()
        adminEmail = TestHelpers.generateUniqueEmail()

        user = await User.create(
            userFactory({
                email: userEmail,
                password: hashedPassword,
                role: 'membre',
                username: TestHelpers.generateUniqueUsername(),
            })
        )

        adminUser = await User.create(
            userFactory({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                username: TestHelpers.generateUniqueUsername(),
            })
        )

        // Obtenir les tokens d'authentification
        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: userEmail, password: 'TestPassword123!' })
        authToken = userLogin.body.token

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminEmail, password: 'TestPassword123!' })
        adminToken = adminLogin.body.token
    })

    describe('POST /api/workspaces', () => {
        it('devrait créer un workspace public', async () => {
            const workspaceData = {
                name: 'Workspace Public Test',
                description: 'Un workspace de test public',
                type: 'public',
            }

            const res = await request(app)
                .post('/api/workspaces')
                .set('Authorization', `Bearer ${authToken}`)
                .send(workspaceData)

            expect(res.statusCode).toBe(201)
            expect(res.body.workspace).toHaveProperty(
                'name',
                workspaceData.name
            )
            expect(res.body.workspace).toHaveProperty('type', 'public')
            expect(res.body.workspace).toHaveProperty(
                'owner',
                user._id.toString()
            )
            expect(res.body.workspace.members).toContain(user._id.toString())
        })

        it('devrait créer un workspace privé', async () => {
            const workspaceData = {
                name: 'Workspace Privé Test',
                description: 'Un workspace de test privé',
                type: 'private',
            }

            const res = await request(app)
                .post('/api/workspaces')
                .set('Authorization', `Bearer ${authToken}`)
                .send(workspaceData)

            expect(res.statusCode).toBe(201)
            expect(res.body.workspace).toHaveProperty('type', 'private')
        })

        it('devrait rejeter la création sans authentification', async () => {
            const workspaceData = {
                name: 'Workspace Test',
                description: 'Test sans auth',
            }

            const res = await request(app)
                .post('/api/workspaces')
                .send(workspaceData)

            expect(res.statusCode).toBe(401)
        })

        it('devrait rejeter la création avec des données invalides', async () => {
            const workspaceData = {
                // name manquant
                description: 'Test données invalides',
            }

            const res = await request(app)
                .post('/api/workspaces')
                .set('Authorization', `Bearer ${authToken}`)
                .send(workspaceData)

            expect(res.statusCode).toBe(400)
        })
    })

    describe('GET /api/workspaces', () => {
        it("devrait récupérer la liste des workspaces de l'utilisateur", async () => {
            // Créer quelques workspaces
            const workspace1 = await Workspace.create(
                workspaceFactory({
                    name: 'Workspace 1',
                    owner: user._id,
                    members: [user._id],
                })
            )

            const workspace2 = await Workspace.create(
                workspaceFactory({
                    name: 'Workspace 2',
                    owner: user._id,
                    members: [user._id],
                })
            )

            const res = await request(app)
                .get('/api/workspaces')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.workspaces).toHaveLength(2)
            expect(res.body.workspaces.map((w) => w.name)).toContain(
                'Workspace 1'
            )
            expect(res.body.workspaces.map((w) => w.name)).toContain(
                'Workspace 2'
            )
        })

        it('devrait récupérer uniquement les workspaces publics pour un utilisateur non membre', async () => {
            const otherUser = await User.create(
                userFactory({ email: TestHelpers.generateUniqueEmail('other') })
            )

            // Workspace public
            await Workspace.create(
                workspaceFactory({
                    name: 'Public Workspace',
                    type: 'public',
                    owner: otherUser._id,
                    members: [otherUser._id],
                })
            )

            // Workspace privé
            await Workspace.create(
                workspaceFactory({
                    name: 'Private Workspace',
                    type: 'private',
                    owner: otherUser._id,
                    members: [otherUser._id],
                })
            )

            const res = await request(app)
                .get('/api/workspaces/public')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body.workspaces).toHaveLength(1)
            expect(res.body.workspaces[0]).toHaveProperty(
                'name',
                'Public Workspace'
            )
        })
    })

    describe('PUT /api/workspaces/:id', () => {
        it('devrait permettre au propriétaire de modifier le workspace', async () => {
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: user._id,
                    members: [user._id],
                })
            )

            const updateData = {
                name: 'Workspace Modifié',
                description: 'Description mise à jour',
            }

            const res = await request(app)
                .put(`/api/workspaces/${workspace._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.workspace).toHaveProperty('name', updateData.name)
            expect(res.body.workspace).toHaveProperty(
                'description',
                updateData.description
            )
        })

        it('devrait rejeter la modification par un non-propriétaire', async () => {
            const otherUser = await User.create(
                userFactory({ email: 'other@test.com' })
            )
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: otherUser._id,
                    members: [otherUser._id],
                })
            )

            const updateData = {
                name: 'Tentative de modification',
            }

            const res = await request(app)
                .put(`/api/workspaces/${workspace._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('DELETE /api/workspaces/:id', () => {
        it('devrait permettre au propriétaire de supprimer le workspace', async () => {
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: user._id,
                    members: [user._id],
                })
            )

            const res = await request(app)
                .delete(`/api/workspaces/${workspace._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            // Vérifier que le workspace est supprimé
            const deletedWorkspace = await Workspace.findById(workspace._id)
            expect(deletedWorkspace).toBeNull()
        })

        it('devrait rejeter la suppression par un non-propriétaire', async () => {
            const otherUser = await User.create(
                userFactory({ email: 'other@test.com' })
            )
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: otherUser._id,
                    members: [otherUser._id],
                })
            )

            const res = await request(app)
                .delete(`/api/workspaces/${workspace._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(403)
        })
    })

    describe('POST /api/workspaces/:id/invite', () => {
        it('devrait inviter un utilisateur par email', async () => {
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: user._id,
                    members: [user._id],
                })
            )

            const inviteData = {
                email: 'invite@test.com',
                role: 'membre',
            }

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(inviteData)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('invitationId')
        })

        it("devrait générer un lien d'invitation", async () => {
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: user._id,
                    members: [user._id],
                })
            )

            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite-link`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ expiresIn: '7d' })

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('inviteLink')
            expect(res.body).toHaveProperty('expiresAt')
        })
    })

    describe('POST /api/workspaces/join/:inviteCode', () => {
        it("devrait permettre de rejoindre un workspace avec un code d'invitation valide", async () => {
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: adminUser._id,
                    members: [adminUser._id],
                    inviteCode: 'VALID_CODE_123',
                })
            )

            const res = await request(app)
                .post(`/api/workspaces/join/VALID_CODE_123`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('message')
            expect(res.body.workspace.members).toContain(user._id.toString())
        })

        it("devrait rejeter un code d'invitation invalide", async () => {
            const res = await request(app)
                .post('/api/workspaces/join/INVALID_CODE')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(404)
        })
    })

    describe('DELETE /api/workspaces/:id/members/:userId', () => {
        it('devrait permettre au propriétaire de retirer un membre', async () => {
            const memberUser = await User.create(
                userFactory({ email: 'member@test.com' })
            )
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: user._id,
                    members: [user._id, memberUser._id],
                })
            )

            const res = await request(app)
                .delete(
                    `/api/workspaces/${workspace._id}/members/${memberUser._id}`
                )
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            // Vérifier que le membre est retiré
            const updatedWorkspace = await Workspace.findById(workspace._id)
            expect(updatedWorkspace.members).not.toContain(memberUser._id)
        })

        it('devrait permettre à un membre de quitter le workspace', async () => {
            const workspace = await Workspace.create(
                workspaceFactory({
                    owner: adminUser._id,
                    members: [adminUser._id, user._id],
                })
            )

            const res = await request(app)
                .delete(`/api/workspaces/${workspace._id}/leave`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toBe(200)

            // Vérifier que l'utilisateur a quitté
            const updatedWorkspace = await Workspace.findById(workspace._id)
            expect(updatedWorkspace.members).not.toContain(user._id)
        })
    })
})
