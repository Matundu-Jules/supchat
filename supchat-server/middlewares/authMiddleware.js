const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
    try {
        // Récupère directement le JWT dans le cookie 'access'
        const token = req.cookies && req.cookies.access
        if (!token) return res.status(401).json({ message: 'Accès refusé' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')

        if (!req.user)
            return res.status(401).json({ message: 'Utilisateur non trouvé' })

        next()
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' })
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
