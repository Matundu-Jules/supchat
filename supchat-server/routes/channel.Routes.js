const express = require('express')
const rateLimit = require('express-rate-limit')
const multer = require('multer')
const path = require('path')
const {
    createChannel,
    getChannels,
    getChannelById,
    updateChannel,
    deleteChannel,
    inviteToChannel,
    joinChannel,
    leaveChannel,
    getChannelMembers,
    updateChannelMemberRole,
    removeChannelMember,
    addChannelMember,
} = require('../controllers/channelController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { validate } = require('../middlewares/validationMiddleware')
const {
    createChannelSchema,
    updateChannelSchema,
    channelIdParamSchema,
    inviteToChannelSchema,
    channelMemberParamSchema,
} = require('../validators/channelValidators')

// Configuration de multer pour l'upload de fichiers
const uploadDir = path.join(__dirname, '../uploads')
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `${unique}-${file.originalname}`)
    },
})
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
})

const router = express.Router()

// Limiteur : 5 messages max par minute par utilisateur sur un channel
const messageRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { message: 'Trop de messages envoyés, réessayez plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) =>
        `${req.user ? req.user.id : req.ip}-${req.params.id}`,
})

router.post(
    '/',
    authMiddleware,
    validate({ body: createChannelSchema }),
    createChannel
)
router.get('/', authMiddleware, getChannels)
router.get(
    '/:id',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    getChannelById
)
router.put(
    '/:id',
    authMiddleware,
    validate({ params: channelIdParamSchema, body: updateChannelSchema }),
    updateChannel
)
router.delete(
    '/:id',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    deleteChannel
)

router.post(
    '/:id/invite',
    authMiddleware,
    validate({ params: channelIdParamSchema, body: inviteToChannelSchema }),
    inviteToChannel
)

router.post(
    '/:id/join',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    joinChannel
)

router.delete(
    '/:id/leave',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    leaveChannel
)

// Routes pour la gestion des membres de canaux
router.get(
    '/:id/members',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    getChannelMembers
)

router.put(
    '/:id/members/:userId/role',
    authMiddleware,
    validate({ params: channelMemberParamSchema }),
    updateChannelMemberRole
)

router.delete(
    '/:id/members/:userId',
    authMiddleware,
    validate({ params: channelMemberParamSchema }),
    removeChannelMember
)

router.post(
    '/:id/members',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    addChannelMember
)

router.post(
    '/:id/messages',
    authMiddleware,
    messageRateLimiter,
    async (req, res, next) => {
        // Injecte channelId dans le body pour compatibilité avec le contrôleur
        req.body.channelId = req.params.id
        next()
    },
    require('../controllers/messageController').sendMessage
)

// Route pour récupérer les messages d'un channel
router.get(
    '/:id/messages',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    async (req, res, next) => {
        // Injecte channelId dans les params pour compatibilité avec le contrôleur
        req.params.channelId = req.params.id
        next()
    },
    require('../controllers/messageController').getMessagesByChannel
)

// Route pour uploader des fichiers dans un channel
router.post(
    '/:id/messages/upload',
    authMiddleware,
    messageRateLimiter,
    upload.single('file'),
    async (req, res, next) => {
        // Injecte channelId dans le body pour compatibilité avec le contrôleur
        req.body.channelId = req.params.id
        next()
    },
    require('../controllers/messageController').uploadFile,
    // Middleware de gestion d'erreurs Multer
    (error, req, res, next) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res
                    .status(413)
                    .json({ message: 'Fichier trop volumineux.' })
            }
            return res
                .status(400)
                .json({ message: "Erreur lors de l'upload du fichier." })
        }
        next(error)
    }
)

// Routes pour les paramètres de notification par channel
router.put(
    '/:id/notification-settings',
    authMiddleware,
    validate({ params: channelIdParamSchema }),
    async (req, res, next) => {
        // Injecte channelId dans le body
        req.body.channelId = req.params.id
        next()
    },
    require('../controllers/notificationController')
        .updateChannelNotificationSettings
)

module.exports = router
