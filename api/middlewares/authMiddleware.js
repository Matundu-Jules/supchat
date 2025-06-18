const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
    try {
        // Récupère le JWT dans le cookie 'access' ou dans l'en-tête Authorization
        let token = req.cookies && req.cookies.access
        if (
            !token &&
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        )
            token = req.headers.authorization.split(' ')[1]

        if (!token) {
            return res
                .status(401)
                .json({ message: 'Accès refusé - Token manquant' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' })
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            return res
                .status(401)
                .json({ message: 'Token expiré - Reconnexion requise' })
        }

        req.user = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error.message)

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' })
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' })
        }

        return res.status(401).json({ message: 'Token invalide ou expiré' })
    }
}

const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res
            .status(403)
            .json({ message: 'Accès refusé. Permission insuffisante.' })
    }
    next()
}

module.exports = { authMiddleware, roleMiddleware }
