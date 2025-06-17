const { doubleCsrf } = require('csrf-csrf')

const isProd =
    process.env.NODE_ENV === 'production' && !process.env.CSRF_DEV_MODE
const csrfCookieOptions = {
    httpOnly: false,
    sameSite: isProd ? 'strict' : 'lax', // Plus permissif en développement
    secure: isProd, // Pas de HTTPS requis en développement
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
