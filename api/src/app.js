// src/app.js

const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
// const swaggerFile = require('../public/swagger/swagger-output.json') // Temporaire
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const path = require('path')
const {
    getLocalIP,
    generateAllowedOrigins,
    displayNetworkInfo,
} = require('./utils/networkUtils')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)

// Génération automatique des origines autorisées basée sur l'IP locale
const allowedOrigins = generateAllowedOrigins(port)

const { initSocket } = require('../socket')
const io = initSocket(server, allowedOrigins)

// ==== CONFIGURATION CORS BASÉE SUR L'ENVIRONNEMENT ==== //
const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.CSRF_DEV_MODE === 'true'

if (isDevelopment) {
    // DÉVELOPPEMENT : CORS ouvert pour faciliter le dev
    console.log('🔓 CORS Mode Development: Toutes origines autorisées')
    app.use(
        cors({
            origin: true, // Autorise toutes les origines en développement
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-CSRF-TOKEN',
                'X-CSRF-Token',
            ],
        })
    )
} else {
    // PRODUCTION : CORS restrictif pour la sécurité
    console.log('🔒 CORS Mode Production: Origines restreintes')
    console.log('🔒 Allowed Origins:', allowedOrigins)

    app.use(
        cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true)
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true)
                }
                console.log('❌ CORS Rejected:', origin)
                return callback(new Error('Not allowed by CORS'))
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-CSRF-TOKEN',
                'X-CSRF-Token',
            ],
        })
    )
}

app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        // Note: x-xss-protection est désactivé par défaut dans les nouvelles versions d'Helmet
        // car il est considéré comme obsolète et potentiellement dangereux
    })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '100kb' })) // Limite la taille des requêtes JSON
app.use(express.urlencoded({ extended: true, limit: '100kb' }))
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ==== CLIENTID ==== //
app.use((req, res, next) => {
    if (!req.cookies['clientid']) {
        const cid = Math.random().toString(36).slice(2)
        const isProd = process.env.NODE_ENV === 'production'
        res.cookie('clientid', cid, {
            httpOnly: false,
            sameSite: isProd ? 'strict' : 'lax',
            secure: isProd,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        req.cookies['clientid'] = cid
    }
    next()
})

// ==== CSRF PROTECTION (csrf-csrf) ==== //
const {
    csrfMiddleware,
    invalidCsrfTokenError,
    generateCsrfToken,
} = require('./csrf')

// ==== ROUTE POUR FOURNIR LE TOKEN CSRF ==== //
app.get('/api/csrf-token', (req, res) => {
    const token = generateCsrfToken(req, res, { overwrite: true })
    res.json({ csrfToken: token })
})

// Exclure CSRF sur les routes publiques de reset
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        return next()
    }
    if (
        req.path === '/api/auth/forgot-password' ||
        req.path === '/api/auth/reset-password'
    ) {
        return next()
    }
    return csrfMiddleware(req, res, next)
})

// ==== MONGODB ==== //
const {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_AUTH_SOURCE,
} = process.env

let mongoUri
if (process.env.MONGO_URI) {
    mongoUri = process.env.MONGO_URI
} else if (MONGO_INITDB_ROOT_USERNAME && MONGO_INITDB_ROOT_PASSWORD) {
    mongoUri = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST || 'db'}:${MONGO_PORT || '27017'}/${MONGO_DB || 'supchat'}?authSource=${MONGO_AUTH_SOURCE || 'admin'}`
} else {
    mongoUri = `mongodb://${MONGO_HOST || 'db'}:${MONGO_PORT || '27017'}/${MONGO_DB || 'supchat'}`
}

console.log('🔍 MongoDB URI:', mongoUri.replace(/:[^:]*@/, ':***@'))

// Nouvelle fonction pour connecter à MongoDB (utilisable dans les tests)
async function connectToDatabase(uri) {
    try {
        console.log('🔧 Tentative de connexion à MongoDB...')
        const options = {
            connectTimeoutMS: 10000, // 10s au lieu de 60s
            serverSelectionTimeoutMS: 5000, // 5s au lieu de 60s
            socketTimeoutMS: 10000, // 10s au lieu de 60s
            maxPoolSize: 10,
            retryWrites: true,
        }
        await mongoose.connect(uri || mongoUri, options)
        console.log('✅ MongoDB connected successfully')
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message)
        throw error
    }
}

if (process.env.NODE_ENV !== 'test') {
    // Fonction pour attendre que MongoDB soit prêt (en arrière-plan)
    async function waitForMongoDB(maxRetries = 10, delay = 2000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(
                    `🔄 Tentative de connexion MongoDB ${i + 1}/${maxRetries}...`
                )
                await connectToDatabase()
                console.log('✅ MongoDB connected successfully')
                return // Connexion réussie
            } catch (error) {
                console.log(`⚠️ Échec tentative ${i + 1}: ${error.message}`)
                if (i === maxRetries - 1) {
                    console.error(
                        '❌ Impossible de se connecter à MongoDB après',
                        maxRetries,
                        'tentatives'
                    )
                    // Ne pas exit en développement, juste logger l'erreur
                    if (process.env.NODE_ENV === 'production') {
                        process.exit(1)
                    }
                    return
                }
                console.log(
                    `⏰ Attente de ${delay / 1000}s avant nouvelle tentative...`
                )
                await new Promise((resolve) => setTimeout(resolve, delay))
            }
        }
    }

    // Démarrer la connexion MongoDB en arrière-plan (ne bloque pas le serveur)
    waitForMongoDB().catch((err) => {
        console.error('❌ Erreur lors de la connexion MongoDB:', err)
    })
} else {
    console.log('MongoDB connection skipped in test environment')
}

// ==== ROUTES ==== //
const apiRoutes = require('../routes/index')
const healthRoutes = require('../routes/health')

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile)) // Temporaire
app.use('/api', healthRoutes)
app.use('/api', apiRoutes)

// ==== 404 ==== //
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' })
})

// ==== ERROR HANDLER (INCLUANT CSRF) ==== //
app.use((err, req, res, next) => {
    if (err === invalidCsrfTokenError) {
        return res.status(403).json({ message: 'Invalid CSRF token' })
    }
    console.error('Server error:', err)
    res.status(500).json({ message: 'Internal server error' })
})

// ==== START ==== //
if (process.env.NODE_ENV !== 'test') {
    server.listen(port, () => {
        // Affichage des informations réseau avec IP locale
        displayNetworkInfo(port)
        console.log(
            `📖 Swagger docs available at http://localhost:${port}/api-docs/swagger-ui.html`
        )
    })
}

// Export for controllers (needed for generateCsrfToken in authController)
module.exports = {
    app,
    io,
    server,
    generateCsrfToken,
    csrfMiddleware,
    invalidCsrfTokenError,
    connectToDatabase, // <-- export de la fonction
}
