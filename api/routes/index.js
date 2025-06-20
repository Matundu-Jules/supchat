const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.Routes')
const workspaceRoutes = require('./workspace.Routes')
const channelRoutes = require('./channel.Routes')
const messageRoutes = require('./message.Routes')
const permissionRoutes = require('./permission.Routes')
const notificationRoutes = require('./notification.Routes')
const searchRoutes = require('./search.Routes')
const userRoutes = require('./user.Routes')
const integrationRoutes = require('./integration.Routes')
const reactionRoutes = require('./reaction.Routes')
const notificationPrefRoutes = require('./notificationPref.Routes')
const botRoutes = require('./bot.Routes')

router.use('/auth', authRoutes)
router.use('/workspaces', workspaceRoutes)
router.use('/channels', channelRoutes)
router.use('/messages', messageRoutes)
router.use('/permissions', permissionRoutes)
router.use('/notifications', notificationRoutes)
router.use('/search', searchRoutes)
router.use('/user', userRoutes)
router.use('/integrations', integrationRoutes)
router.use('/reactions', reactionRoutes)
router.use('/notification-prefs', notificationPrefRoutes)
router.use('/bots', botRoutes)

module.exports = router
