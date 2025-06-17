const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { getPrefs, setPref } = require('../controllers/notificationPrefController')

const router = express.Router()

router.get('/', authMiddleware, getPrefs)
router.put('/', authMiddleware, setPref)

module.exports = router
