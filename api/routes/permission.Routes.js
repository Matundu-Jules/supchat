const express = require('express')
const {
    setPermission,
    createPermission,
    checkPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
} = require('../controllers/permissionController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const router = express.Router()

// Nouvelle API compatible avec les tests
router.post('/', authMiddleware, createPermission)
router.get('/check', authMiddleware, checkPermission)

// API existante
router.post('/set', authMiddleware, setPermission)
router.get('/', authMiddleware, getPermissions)
router.get('/:id', authMiddleware, getPermissionById)
router.put('/:id', authMiddleware, updatePermission)
router.delete('/:id', authMiddleware, deletePermission)

module.exports = router
