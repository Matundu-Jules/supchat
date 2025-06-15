const express = require('express')
const workspaceController = require('../controllers/workspaceController')
const {
    authMiddleware,
    roleMiddleware,
} = require('../middlewares/authMiddleware')
const {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteToWorkspaceSchema,
    joinWorkspaceSchema,
    workspaceIdParamSchema,
} = require('../validators/workspaceValidators')
const { validate } = require('../middlewares/validationMiddleware')

const router = express.Router()

// Créer un workspace (admin uniquement)
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin']),
    validate({ body: createWorkspaceSchema }),
    workspaceController.createWorkspace
)

// Récupérer tous les workspaces de l'utilisateur connecté
router.get('/', authMiddleware, workspaceController.getAllWorkspaces)

// Récupérer un workspace par ID
router.get(
    '/:id',
    authMiddleware,
    validate({ params: workspaceIdParamSchema }),
    workspaceController.getWorkspaceById
)

// Route publique pour infos publiques d'un workspace (pas d'authMiddleware)
router.get('/:id/public', workspaceController.getWorkspacePublic)

// Mettre à jour un workspace
router.put(
    '/:id',
    authMiddleware,
    validate({ params: workspaceIdParamSchema, body: updateWorkspaceSchema }),
    workspaceController.updateWorkspace
)

// Supprimer un workspace
router.delete(
    '/:id',
    authMiddleware,
    validate({ params: workspaceIdParamSchema }),
    workspaceController.deleteWorkspace
)

// Inviter un membre dans un workspace
router.post(
    '/:id/invite',
    authMiddleware,
    validate({
        params: workspaceIdParamSchema,
        body: inviteToWorkspaceSchema,
    }),
    workspaceController.inviteToWorkspace
)

// Rejoindre un workspace via un code d'invitation
router.post(
    '/join',
    authMiddleware,
    validate({ body: joinWorkspaceSchema }),
    workspaceController.joinWorkspace
)

module.exports = router
