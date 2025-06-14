// src/app.js

const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../public/swagger/swagger-output.json')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

dotenv.config()

const app = express()
const port = process.env.PORT
const server = http.createServer(app)
const { initSocket } = require('../socket')
const io = initSocket(server, ['http://localhost:5173', 'http://localhost:3000'])

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']

// ==== CORS ==== //
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true)
            if (allowedOrigins.includes(origin)) {
                return callback(null, true)
            }
            return callback(new Error('Not allowed by CORS'))
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-CSRF-TOKEN',
            'X-CSRF-Token',
        ],
    })
)

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ==== CLIENTID ==== //
app.use((req, res, next) => {
    if (!req.cookies['clientid']) {
        const cid = Math.random().toString(36).slice(2)
        res.cookie('clientid', cid, {
            httpOnly: false,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
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

const mongoUri =
    process.env.MONGO_URI ||
    `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${encodeURIComponent(
        MONGO_INITDB_ROOT_PASSWORD
    )}@${MONGO_HOST || 'localhost'}:${MONGO_PORT || 27017}/${
        MONGO_DB || 'supchat'
    }?authSource=${MONGO_AUTH_SOURCE || 'admin'}`

mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    })

// ==== ROUTES ==== //
const apiRoutes = require('../routes/index')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
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
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log(
        `Swagger docs available at http://localhost:${port}/api-docs/swagger-ui.html`
    )
})

// Export for controllers (needed for generateCsrfToken in authController)
module.exports = {
    app,
    io,
    server,
    generateCsrfToken,
    csrfMiddleware,
    invalidCsrfTokenError,
}
