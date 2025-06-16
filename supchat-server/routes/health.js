// Health check endpoint simple
// Ajoutez cette route à votre serveur Express

// Si vous avez un fichier routes/health.js
const express = require('express')
const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    })
})

module.exports = router

// Dans votre app.js principal, ajoutez :
// app.use('/api', require('./routes/health'));
