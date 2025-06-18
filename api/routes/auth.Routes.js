// /routes/auth.Routes.js

const express = require('express')
const {
    register,
    login,
    logout,
    logoutAll,
    getUser,
    changePassword,
    setPassword,
    deleteUser,
    googleLogin,
    facebookLogin,
    forgotPassword,
    resetPassword,
    refreshToken,
} = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const router = express.Router()

// Inscription d'un utilisateur
router.post('/register', register)

// Connexion d'un utilisateur
router.post('/login', login)

// Déconnexion de l'utilisateur
router.post('/logout', logout)
router.post('/logout-all', authMiddleware, logoutAll)

// Récupération des informations de l'utilisateur connecté
router.get('/me', authMiddleware, getUser)

// Debug endpoint pour vérifier les cookies (développement uniquement)
if (process.env.NODE_ENV === 'development') {
    router.get('/debug-cookies', (req, res) => {
        res.json({
            cookies: req.cookies,
            headers: {
                authorization: req.headers.authorization,
                'user-agent': req.headers['user-agent'],
                origin: req.headers.origin,
                referer: req.headers.referer,
            },
            timestamp: new Date().toISOString(),
        })
    })
}

// Changement des informations de l'utilisateur connecté

// Changement du mot de passe de l'utilisateur connecté
router.patch('/me/password', authMiddleware, changePassword)

// Création d'un mot de passe pour les utilisateurs social login
router.post('/set-password', authMiddleware, setPassword)

// Suppression du compte utilisateur
router.delete('/me', authMiddleware, deleteUser)

// Connexion via Google
router.post('/google-login', googleLogin)

// Connexion via Facebook
router.post('/facebook-login', facebookLogin)

// Mot de passe oublié
router.post('/forgot-password', forgotPassword)

// Reset mot de passe
router.post('/reset-password', resetPassword)

// Refresh JWT
router.post('/refresh', refreshToken)

module.exports = router
