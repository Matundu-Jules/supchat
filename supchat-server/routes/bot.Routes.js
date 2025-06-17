const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const {
    createReminder,
    createPoll,
    votePoll,
    customWebhook,
} = require('../controllers/botController')

const router = express.Router()

// Routes Reminder Bot
router.post('/reminder/create', authMiddleware, createReminder)

// Routes Poll Bot
router.post('/poll/create', authMiddleware, createPoll)
router.post('/poll/:id/vote', authMiddleware, votePoll)

// Routes Custom Bot
router.post('/custom/webhook', customWebhook)

module.exports = router
