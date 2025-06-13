const express = require('express')
const workspaceController = require('../controllers/workspaceController')
const {
    authMiddleware,
    roleMiddleware,
} = require('../middlewares/authMiddleware')

const router = express.Router()

// Créer un workspace (admin uniquement)
router.post('/', authMiddleware, workspaceController.createWorkspace)

// Récupérer tous les workspaces de l'utilisateur connecté
router.get('/', authMiddleware, workspaceController.getAllWorkspaces)

// Récupérer un workspace par ID
router.get('/:id', authMiddleware, workspaceController.getWorkspaceById)

// Mettre à jour un workspace
router.put('/:id', authMiddleware, workspaceController.updateWorkspace)

// Supprimer un workspace
router.delete('/:id', authMiddleware, workspaceController.deleteWorkspace)

// Inviter un membre dans un workspace
router.post(
    '/:id/invite',
    authMiddleware,
    workspaceController.inviteToWorkspace
)

// Rejoindre un workspace via un code d'invitation
router.post('/join', authMiddleware, workspaceController.joinWorkspace)

module.exports = router
