const { doubleCsrf } = require('csrf-csrf')

const isProd = process.env.NODE_ENV === 'production'

const csrfCookieOptions = {
    httpOnly: false,
    sameSite: isProd ? 'strict' : 'none', // None pour cross-origin en dev
    secure: isProd, // Pas de HTTPS requis en développement mais necessary for SameSite=none
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

// En développement, permettre SameSite=none pour cross-origin
if (!isProd) {
    csrfCookieOptions.secure = false // Pas de HTTPS en développement
    csrfCookieOptions.sameSite = 'lax' // Lax au lieu de none pour éviter les problèmes HTTPS
}

const doubleCsrfResult = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'unsecure-default',
    cookieName: 'XSRF-TOKEN',
    cookieOptions: csrfCookieOptions,
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) =>
        req.cookies['clientid'] ||
        req.headers['x-forwarded-for'] ||
        req.ip ||
        Math.random().toString(36).slice(2),
})

// Middleware function
const csrfMiddleware = doubleCsrfResult.doubleCsrfProtection

// Token generator
const generateCsrfToken = doubleCsrfResult.generateCsrfToken

// Error object
const invalidCsrfTokenError = doubleCsrfResult.invalidCsrfTokenError

module.exports = {
    generateCsrfToken,
    csrfMiddleware,
    invalidCsrfTokenError,
}
