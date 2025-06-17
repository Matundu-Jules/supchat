const express = require('express')
const { search, searchAdvanced } = require('../controllers/searchController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/', authMiddleware, search)
router.get('/advanced', authMiddleware, searchAdvanced)

module.exports = router
