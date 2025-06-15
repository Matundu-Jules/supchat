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
    requestJoinWorkspaceSchema,
    workspaceIdParamSchema,
    requestUserIdParamSchema,
} = require('../validators/workspaceValidators')
const { validate } = require('../middlewares/validationMiddleware')

const router = express.Router()

// Créer un workspace (tous les utilisateurs authentifiés)
router.post(
    '/',
    authMiddleware,
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

// Récupérer les membres d'un workspace
router.get(
    '/:id/members',
    authMiddleware,
    validate({ params: workspaceIdParamSchema }),
    workspaceController.getWorkspaceMembers
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

// Demander à rejoindre un workspace public
router.post(
    '/:id/request-join',
    authMiddleware,
    validate({
        params: workspaceIdParamSchema,
        body: requestJoinWorkspaceSchema,
    }),
    workspaceController.requestToJoinWorkspace
)

// Récupérer les demandes de rejoindre pour un workspace
router.get(
    '/:id/join-requests',
    authMiddleware,
    validate({ params: workspaceIdParamSchema }),
    workspaceController.getJoinRequests
)

// Approuver une demande de rejoindre
router.post(
    '/:id/join-requests/:requestUserId/approve',
    authMiddleware,
    validate({ params: requestUserIdParamSchema }),
    workspaceController.approveJoinRequest
)

// Rejeter une demande de rejoindre
router.post(
    '/:id/join-requests/:requestUserId/reject',
    authMiddleware,
    validate({ params: requestUserIdParamSchema }),
    workspaceController.rejectJoinRequest
)

// Supprimer un membre d'un workspace
router.delete(
    '/:id/members/:userId',
    authMiddleware,
    validate({ params: requestUserIdParamSchema }), // Réutilise le même validateur car il valide id et userId
    workspaceController.removeMember
)

module.exports = router
