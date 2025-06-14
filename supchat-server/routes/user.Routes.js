const express = require('express')
const multer = require('multer')
const path = require('path')
const userController = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { validate } = require('../middlewares/validationMiddleware')
const {
    updateProfileSchema,
    updatePreferencesSchema,
    updateEmailSchema,
} = require('../validators/userValidators')

const router = express.Router()

const avatarDir = path.join(__dirname, '../uploads')
const storage = multer.diskStorage({
    destination: avatarDir,
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `${unique}-${file.originalname}`)
    },
})
const upload = multer({ storage })

router.get('/profile', authMiddleware, userController.getProfile)
router.put(
    '/profile',
    authMiddleware,
    validate({ body: updateProfileSchema }),
    userController.updateProfile
)

router.put(
    '/email',
    authMiddleware,
    validate({ body: updateEmailSchema }),
    userController.updateEmail
)

router.post(
    '/avatar',
    authMiddleware,
    upload.single('avatar'),
    userController.uploadAvatar
)
router.delete('/avatar', authMiddleware, userController.deleteAvatar)

router.get('/preferences', authMiddleware, userController.getPreferences)
router.put(
    '/preferences',
    authMiddleware,
    validate({ body: updatePreferencesSchema }),
    userController.updatePreferences
)

router.get('/export', authMiddleware, userController.exportUserData)

module.exports = router
