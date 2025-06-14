const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.Routes')
const workspaceRoutes = require('./workspace.Routes')
const channelRoutes = require('./channel.Routes')
const messageRoutes = require('./message.Routes')
const permissionRoutes = require('./permission.Routes')
const notificationRoutes = require('./notification.Routes')
const searchRoutes = require('./search.Routes')

router.use('/auth', authRoutes)
router.use('/workspaces', workspaceRoutes)
router.use('/channels', channelRoutes)
router.use('/messages', messageRoutes)
router.use('/permissions', permissionRoutes)
router.use('/notifications', notificationRoutes)
router.use('/search', searchRoutes)

module.exports = router
