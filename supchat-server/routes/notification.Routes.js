const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
} = require('../controllers/notificationController')

const router = express.Router()

router.get('/', authMiddleware, getNotifications)
router.put('/:id/read', authMiddleware, markAsRead)
router.put('/read-all', authMiddleware, markAllAsRead)
router.delete('/:id', authMiddleware, deleteNotification)

// Routes pour les préférences de notification
router.get('/preferences', authMiddleware, getNotificationPreferences)
router.put('/preferences', authMiddleware, updateNotificationPreferences)

module.exports = router
