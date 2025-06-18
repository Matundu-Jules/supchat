// conntrollers/authController.js

const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')
const nodemailer = require('nodemailer')
const { render } = require('@react-email/render')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const { generateCsrfToken } = require('../src/csrf')

const ACCESS_EXPIRE = 15 * 60 // 15 min (sec)
const REFRESH_EXPIRE = 7 * 24 * 60 * 60 // 7 jours (sec)
const isProd = process.env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax', // Plus permissif en développement
    path: '/',
    domain: isProd ? undefined : undefined, // Pas de restriction de domaine en dev
}
const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: REFRESH_EXPIRE * 1000,
}
const accessCookieOptions = {
    ...cookieOptions,
    maxAge: ACCESS_EXPIRE * 1000,
}

// Génération du token JWT (access)
const generateAccessToken = (user) =>
    jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRE,
        }
    )
const generateRefreshToken = (user) =>
    jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion },
        process.env.JWT_REFRESH,
        {
            expiresIn: REFRESH_EXPIRE,
        }
    )

// ================== REGISTER ==================
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Validation de sécurité côté serveur
        if (
            !name ||
            typeof name !== 'string' ||
            name.length < 1 ||
            name.length > 255
        ) {
            return res.status(400).json({
                message: 'Le nom doit contenir entre 1 et 255 caractères',
            })
        }
        if (!email || typeof email !== 'string' || email.length > 255) {
            return res
                .status(400)
                .json({ message: 'Email invalide ou trop long' })
        }

        // Validation du format d'email avec regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Format d'email invalide" })
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                message: 'Le mot de passe doit contenir au moins 8 caractères',
            })
        }

        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: 'Email déjà utilisé' })

        const hashedPassword = await bcrypt.hash(password, 12)
        // Forcer le rôle par défaut à 'membre', ignorer tout rôle fourni dans req.body
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'membre',
        })
        await user.save() // (Optionnel) Générer le CSRF ici si tu connectes direct après register
        generateCsrfToken(req, res, { overwrite: true }) // Retourner seulement les informations non sensibles de l'utilisateur
        const { _id, name: userName, email: userEmail, role, createdAt } = user
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: { _id, name: userName, email: userEmail, role, createdAt },
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ================== LOGIN (COOKIE MODE) ==================
exports.login = async (req, res) => {
    try {
        // Authentification par provider (ex: Google)
        if (req.body.provider === 'google') {
            let user
            if (process.env.NODE_ENV === 'test') {
                // En test, prendre le premier utilisateur avec un googleId
                user = await User.findOne({ googleId: { $exists: true } })
            } else {
                user = await User.findOne({ googleId: req.body.token })
            }
            if (!user) {
                return res
                    .status(401)
                    .json({ message: 'Utilisateur Google non trouvé' })
            }
            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)
            res.cookie('access', accessToken, accessCookieOptions)
            res.cookie('refresh', refreshToken, refreshCookieOptions)
            generateCsrfToken(req, res, { overwrite: true })
            const { _id, name, email: user_email, role, createdAt } = user
            return res.status(200).json({
                token: accessToken,
                user: { _id, name, email: user_email, role, createdAt },
            })
        }
        // Authentification classique
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(401).json({ message: 'Mot de passe incorrect' })

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        // Set HttpOnly cookies
        res.cookie('access', accessToken, accessCookieOptions)
        res.cookie('refresh', refreshToken, refreshCookieOptions)

        // Génère un nouveau token CSRF à chaque login
        generateCsrfToken(req, res, { overwrite: true })

        const { _id, name, email: user_email, role, createdAt } = user

        return res.status(200).json({
            token: accessToken,
            user: { _id, name, email: user_email, role, createdAt },
        })
    } catch (error) {
        console.error('Erreur login:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

// ================== LOGOUT ==================
exports.logout = (req, res) => {
    // On retire maxAge des options pour clearCookie
    const clearCookieOptions = { ...accessCookieOptions }
    delete clearCookieOptions.maxAge

    const clearRefreshCookieOptions = { ...refreshCookieOptions }
    delete clearRefreshCookieOptions.maxAge

    res.clearCookie('access', clearCookieOptions)
    res.clearCookie('refresh', clearRefreshCookieOptions)
    res.clearCookie('XSRF-TOKEN', {
        httpOnly: false,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
    })

    res.status(200).json({ message: 'Déconnexion réussie' })
}

// ================== LOGOUT ALL SESSIONS ==================
exports.logoutAll = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        user.tokenVersion += 1
        await user.save()

        // Clear cookies as for simple logout
        const clearCookieOptions = { ...accessCookieOptions }
        delete clearCookieOptions.maxAge
        const clearRefreshCookieOptions = { ...refreshCookieOptions }
        delete clearRefreshCookieOptions.maxAge
        res.clearCookie('access', clearCookieOptions)
        res.clearCookie('refresh', clearRefreshCookieOptions)
        res.clearCookie('XSRF-TOKEN', {
            httpOnly: false,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
        })
        res.status(200).json({ message: 'Déconnecté de tous les appareils' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

// ================== GET USER DATA ==================
exports.getUser = async (req, res) => {
    try {
        // Désactive tout le cache dès le début de la route
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0') // req.user est injecté par le authMiddleware
        if (!req.user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }
        const {
            _id,
            name,
            email,
            role,
            createdAt,
            googleId,
            facebookId,
            hasPassword,
        } = req.user

        res.status(200).json({
            _id,
            name,
            email,
            role,
            createdAt,
            googleId,
            facebookId,
            hasPassword: hasPassword || false,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ================== CHANGE PASSWORD (utilisateur connecté) ==================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id
        const { oldPassword, newPassword } = req.body
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch)
            return res
                .status(400)
                .json({ message: 'Ancien mot de passe incorrect.' })
        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()
        res.status(200).json({ message: 'Mot de passe modifié avec succès.' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ================== DELETE ACCOUNT ==================
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.id // L'utilisateur connecté
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }
        await User.findByIdAndDelete(userId)

        // Déconnexion côté serveur (suppression des cookies)
        const clearCookieOptions = { ...accessCookieOptions }
        delete clearCookieOptions.maxAge

        const clearRefreshCookieOptions = { ...refreshCookieOptions }
        delete clearRefreshCookieOptions.maxAge

        res.clearCookie('access', clearCookieOptions)
        res.clearCookie('refresh', clearRefreshCookieOptions)
        res.clearCookie('XSRF-TOKEN', {
            httpOnly: false,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
        })

        return res
            .status(200)
            .json({ message: 'Compte supprimé et déconnecté avec succès.' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ================== GOOGLE LOGIN (cookie) ==================
exports.googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body

        if (!tokenId) {
            return res.status(400).json({
                message: 'Token Google manquant',
            })
        }

        console.log('🔍 Tentative de vérification du token Google...')

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        if (!payload || !payload.email) {
            return res.status(400).json({
                message: 'Token Google invalide - payload manquant',
            })
        }

        const { email, name, sub } = payload
        console.log(`✅ Token Google valide pour: ${email}`)

        let user = await User.findOne({ email })

        if (!user) {
            // Création si aucun utilisateur avec cet email
            console.log(`👤 Création d'un nouvel utilisateur: ${email}`)
            user = new User({ name, email, googleId: sub, hasPassword: false })
            await user.save()
        } else if (!user.googleId) {
            // Si l'utilisateur existe mais n'a pas encore de googleId, on le lie
            console.log(`🔗 Liaison du compte existant avec Google: ${email}`)
            user.googleId = sub
            // Si l'utilisateur a un mot de passe existant, on garde hasPassword = true
            if (!user.password) {
                user.hasPassword = false
            } else {
                user.hasPassword = true
            }
            await user.save()
        } else {
            // L'utilisateur existe déjà avec googleId - vérifier hasPassword
            console.log(`👋 Connexion utilisateur existant: ${email}`)
            user.hasPassword = !!user.password
            await user.save()
        }

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        res.cookie('access', accessToken, accessCookieOptions)
        res.cookie('refresh', refreshToken, refreshCookieOptions) // Génère un nouveau token CSRF à chaque Google login
        generateCsrfToken(req, res, { overwrite: true })

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                googleId: user.googleId,
                facebookId: user.facebookId,
                hasPassword: user.hasPassword || false,
            },
        })
    } catch (error) {
        console.error('❌ Erreur Google Login:', error)
        console.error('Details:', {
            message: error.message,
            stack: error.stack,
            tokenId: req.body?.tokenId ? 'présent' : 'manquant',
        })

        res.status(500).json({
            message: "Erreur d'authentification Google",
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'Internal server error',
        })
    }
}

// ================== FACEBOOK LOGIN (cookie) ==================
exports.facebookLogin = async (req, res) => {
    try {
        const { accessToken } = req.body
        const response = await axios.get(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
        )

        const { id, name, email } = response.data
        if (!email) {
            return res.status(400).json({
                message:
                    "Facebook ne retourne pas d'email pour cet utilisateur.",
            })
        }
        let user = await User.findOne({ email })
        if (!user) {
            user = new User({ name, email, facebookId: id, hasPassword: false })
            await user.save()
        } else if (!user.facebookId) {
            user.facebookId = id
            // Si l'utilisateur a un mot de passe existant, on garde hasPassword = true
            if (!user.password) {
                user.hasPassword = false
            } else {
                user.hasPassword = true
            }
            await user.save()
        } else {
            // L'utilisateur existe déjà avec facebookId - vérifier hasPassword
            user.hasPassword = !!user.password
            await user.save()
        }

        const jwtAccess = generateAccessToken(user)
        const jwtRefresh = generateRefreshToken(user)

        res.cookie('access', jwtAccess, accessCookieOptions)
        res.cookie('refresh', jwtRefresh, refreshCookieOptions) // Génère un nouveau token CSRF à chaque Facebook login
        generateCsrfToken(req, res, { overwrite: true })

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                googleId: user.googleId,
                facebookId: user.facebookId,
                hasPassword: user.hasPassword || false,
            },
        })
    } catch (error) {
        res.status(500).json({
            message: "Erreur d'authentification Facebook",
            error,
        })
    }
}

// ================== REFRESH ACCESS TOKEN ==================
exports.refreshToken = async (req, res) => {
    try {
        const { refresh } = req.cookies

        if (!refresh) {
            console.log('🚫 Refresh token manquant dans les cookies')
            return res
                .status(401)
                .json({ message: 'Token de refresh manquant' })
        }

        let payload
        try {
            payload = jwt.verify(refresh, process.env.JWT_REFRESH)
        } catch (jwtError) {
            console.log('🚫 Token de refresh invalide:', jwtError.message)
            return res
                .status(403)
                .json({ message: 'Token de refresh invalide' })
        }

        const user = await User.findById(payload.id)
        if (!user) {
            console.log('🚫 Utilisateur non trouvé pour le refresh token')
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }

        if (payload.tokenVersion !== user.tokenVersion) {
            console.log(
                '🚫 Version de token différente:',
                payload.tokenVersion,
                'vs',
                user.tokenVersion
            )
            return res.status(401).json({ message: 'Token obsolète' })
        }

        const newAccess = generateAccessToken(user)
        res.cookie('access', newAccess, accessCookieOptions)

        // Génère un nouveau token CSRF à chaque refresh
        generateCsrfToken(req, res, { overwrite: true })

        console.log('✅ Token refreshed pour:', user.email)
        return res.sendStatus(204)
    } catch (error) {
        console.error('❌ Error in refreshToken:', error)
        return res.status(500).json({ message: 'Erreur lors du refresh' })
    }
}

// ================== FORGOT PASSWORD (init) ==================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user)
            return res
                .status(404)
                .json({ message: 'Aucun compte avec cet email.' })

        // Génère un token de reset
        const resetToken = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = Date.now() + 3600 * 1000 // 1h
        await user.save()

        // Génération du HTML avec React Email
        const ResetPasswordEmail = require('../emails/ResetPasswordEmail')
        const emailHtml = renderToStaticMarkup(
            React.createElement(ResetPasswordEmail, {
                resetUrl: `http://localhost:5173/reset-password?token=${resetToken}`,
                userName: user.name || user.email,
            })
        )

        // Création du transporteur Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env['GMAIL_USER'], // adresse gmail
                pass: process.env['GMAIL_PASS'], // mot de passe d'application
            },
        })

        // Envoi du mail
        await transporter.sendMail({
            from: `"Support SupChat" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: 'Réinitialisation du mot de passe',
            html: emailHtml,
        })

        res.status(200).json({
            message:
                'Lien de réinitialisation envoyé par email (vérifie ta boîte mail).',
        })
    } catch (error) {
        console.error('Erreur forgotPassword:', error)
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ================== RESET PASSWORD ==================
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
        if (!token || !newPassword) {
            return res
                .status(400)
                .json({ message: 'Token et nouveau mot de passe requis.' })
        }

        // Recherche l'utilisateur avec un token valide et non expiré
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Token invalide ou expiré.' })
        }

        // interdiction de réutiliser d'anciens mots de passe
        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({
                message: "Utilise un mot de passe différent de l'ancien.",
            })
        }

        // Mise à jour du mot de passe (hashé)
        user.password = await bcrypt.hash(newPassword, 10)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.status(200).json({
            message: 'Mot de passe réinitialisé avec succès.',
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// Déconnexion globale de tous les appareils
exports.logoutAll = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }

        // Incrémente la version du token pour invalider tous les tokens existants
        user.tokenVersion += 1
        await user.save()

        // Supprime les cookies du client actuel
        res.clearCookie('accessToken', accessCookieOptions)
        res.clearCookie('refreshToken', refreshCookieOptions)

        res.status(200).json({
            message:
                'Déconnexion globale réussie. Tous les appareils ont été déconnectés.',
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// Suppression du compte utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }

        // Supprime l'utilisateur de la base de données
        await User.findByIdAndDelete(req.user.id) // Supprime les cookies
        res.clearCookie('accessToken', accessCookieOptions)
        res.clearCookie('refreshToken', refreshCookieOptions)

        res.status(200).json({
            message: 'Compte supprimé avec succès.',
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

// ================== SET PASSWORD (pour utilisateurs social login) ==================
exports.setPassword = async (req, res) => {
    try {
        const { newPassword } = req.body

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                message: 'Le mot de passe doit contenir au moins 8 caractères.',
            })
        }

        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' })
        }

        // Vérifier si l'utilisateur s'est connecté via social login
        if (!user.googleId && !user.facebookId) {
            return res.status(400).json({
                message:
                    'Cette fonctionnalité est réservée aux utilisateurs connectés via les réseaux sociaux.',
            })
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Mettre à jour le mot de passe et hasPassword
        user.password = hashedPassword
        user.hasPassword = true
        await user.save()

        res.status(200).json({
            message: 'Mot de passe créé avec succès.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                googleId: user.googleId,
                facebookId: user.facebookId,
                hasPassword: user.hasPassword,
            },
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}
