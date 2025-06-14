const express = require('express')
const userController = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { validate } = require('../middlewares/validationMiddleware')
const {
    updateProfileSchema,
    updatePreferencesSchema,
} = require('../validators/userValidators')

const router = express.Router()

router.get('/profile', authMiddleware, userController.getProfile)
router.put(
    '/profile',
    authMiddleware,
    validate({ body: updateProfileSchema }),
    userController.updateProfile
)

router.get('/preferences', authMiddleware, userController.getPreferences)
router.put(
    '/preferences',
    authMiddleware,
    validate({ body: updatePreferencesSchema }),
    userController.updatePreferences
)

router.get('/export', authMiddleware, userController.exportUserData)

module.exports = router
