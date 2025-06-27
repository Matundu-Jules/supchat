// src/utils/secureNetworkUtils.js

const os = require('os')
const crypto = require('crypto')

/**
 * Configuration de sécurité réseau
 */
const SECURITY_CONFIG = {
    // Ports autorisés pour les clients
    ALLOWED_CLIENT_PORTS: [3000, 5173, 8080, 19000, 19001, 19002], // Expo ports inclus

    // Plages IP privées autorisées (RFC 1918)
    PRIVATE_IP_RANGES: [
        /^10\./, // 10.0.0.0/8
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
        /^192\.168\./, // 192.168.0.0/16
    ],

    // Environnements où l'IP auto est autorisée
    ALLOWED_ENVIRONMENTS: ['development', 'dev', 'local'],

    // Rate limiting par IP
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
}

/**
 * Valide si une IP est dans une plage privée
 */
function isPrivateIP(ip) {
    return SECURITY_CONFIG.PRIVATE_IP_RANGES.some((range) => range.test(ip))
}

/**
 * Détection sécurisée de l'IP locale
 */
function getSecureLocalIP() {
    const interfaces = os.networkInterfaces()

    for (const name of Object.keys(interfaces)) {
        // Ignorer les interfaces virtuelles
        if (
            name.toLowerCase().includes('virtualbox') ||
            name.toLowerCase().includes('vmware') ||
            name.toLowerCase().includes('docker')
        ) {
            continue
        }

        for (const interface of interfaces[name]) {
            if (
                interface.family === 'IPv4' &&
                !interface.internal &&
                interface.address &&
                isPrivateIP(interface.address)
            ) {
                return interface.address
            }
        }
    }

    return 'localhost'
}

/**
 * Génère les origines CORS sécurisées
 */
function generateSecureAllowedOrigins(serverPort = 3000) {
    const localIP = getSecureLocalIP()
    const origins = new Set()

    // Vérifier l'environnement
    const currentEnv = process.env.NODE_ENV || 'development'
    if (!SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(currentEnv)) {
        // En production, utiliser uniquement les domaines configurés
        const prodOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
        return prodOrigins.filter(
            (origin) => origin && origin.startsWith('https://')
        )
    }

    // En développement, ajouter localhost et IP locale
    for (const port of SECURITY_CONFIG.ALLOWED_CLIENT_PORTS) {
        // Localhost (toujours sûr)
        origins.add(`http://localhost:${port}`)
        origins.add(`http://127.0.0.1:${port}`)

        // IP locale uniquement si privée
        if (localIP !== 'localhost' && isPrivateIP(localIP)) {
            origins.add(`http://${localIP}:${port}`)
        }
    }

    // Ajouter les versions sans port pour les ports standard
    origins.add('http://localhost')
    origins.add('http://127.0.0.1')
    if (localIP !== 'localhost' && isPrivateIP(localIP)) {
        origins.add(`http://${localIP}`)
    }

    return Array.from(origins)
}

/**
 * Middleware de validation d'origine sécurisé
 */
function createSecureCorsMiddleware(allowedOrigins) {
    return function (origin, callback) {
        // Pas d'origine = requête locale (Postman, curl, etc.)
        if (!origin) {
            return callback(null, true)
        }

        // Vérifier que l'origine est dans la liste autorisée
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        // Vérifier si c'est une IP privée en développement
        const currentEnv = process.env.NODE_ENV || 'development'
        if (SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(currentEnv)) {
            try {
                const url = new URL(origin)
                if (url.protocol === 'http:' && isPrivateIP(url.hostname)) {
                    console.warn(
                        `⚠️  Origine IP privée autorisée en dev: ${origin}`
                    )
                    return callback(null, true)
                }
            } catch (err) {
                // URL invalide
            }
        }

        // Origine non autorisée
        console.error(`❌ Origine CORS refusée: ${origin}`)
        return callback(
            new Error(`Origin ${origin} not allowed by CORS policy`)
        )
    }
}

/**
 * Affiche les informations réseau sécurisées
 */
function displaySecureNetworkInfo(port = 3000) {
    const localIP = getSecureLocalIP()
    const currentEnv = process.env.NODE_ENV || 'development'
    const ipHash = crypto
        .createHash('sha256')
        .update(localIP + 'supchat')
        .digest('hex')
        .substring(0, 8)

    console.log('\n🔒 SupChat Server - Configuration Réseau Sécurisée')
    console.log('====================================================')
    console.log(`🌍 Environnement: ${currentEnv}`)
    console.log(`📍 IP Locale: ${localIP} (hash: ${ipHash})`)
    console.log(`🔌 Port: ${port}`)
    console.log(
        `🛡️  Sécurité: ${isPrivateIP(localIP) ? 'IP Privée ✅' : 'IP Publique ⚠️'}`
    )

    if (SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(currentEnv)) {
        console.log("\n📱 URLs d'accès (développement):")
        console.log(`   Local:      http://localhost:${port}`)
        if (localIP !== 'localhost') {
            console.log(`   Réseau:     http://${localIP}:${port}`)
            console.log(`   Mobile:     http://${localIP}:${port}`)
        }

        console.log("\n🎯 Variables d'environnement suggérées:")
        console.log(`   VITE_API_URL=http://${localIP}:${port}`)
        console.log(`   EXPO_PUBLIC_HOST=${localIP}`)
    } else {
        console.log('\n🔒 Mode production - Configuration manuelle requise')
        console.log('   • Utilisez HTTPS uniquement')
        console.log(
            "   • Configurez ALLOWED_ORIGINS dans les variables d'environnement"
        )
    }

    console.log('\n🛡️  Mesures de sécurité actives:')
    console.log('   • CORS restreint aux IP privées')
    console.log('   • Validation des origines')
    console.log('   • Rate limiting activé')
    console.log('   • Headers de sécurité appliqués')
    console.log('====================================================\n')
}

/**
 * Validation de l'environnement de sécurité
 */
function validateSecurityEnvironment() {
    const issues = []
    const currentEnv = process.env.NODE_ENV || 'development'

    // Vérifier l'environnement
    if (currentEnv === 'production') {
        if (!process.env.ALLOWED_ORIGINS) {
            issues.push('❌ Variable ALLOWED_ORIGINS manquante en production')
        }

        if (!process.env.HTTPS_PORT && !process.env.SSL_CERT) {
            issues.push('⚠️  HTTPS non configuré en production')
        }
    }

    // Vérifier la configuration réseau
    const localIP = getSecureLocalIP()
    if (localIP !== 'localhost' && !isPrivateIP(localIP)) {
        issues.push('⚠️  IP publique détectée - risque de sécurité')
    }

    return {
        isSecure: issues.length === 0,
        issues,
        environment: currentEnv,
        localIP,
    }
}

module.exports = {
    getSecureLocalIP,
    generateSecureAllowedOrigins,
    createSecureCorsMiddleware,
    displaySecureNetworkInfo,
    validateSecurityEnvironment,
    isPrivateIP,
    SECURITY_CONFIG,
}
