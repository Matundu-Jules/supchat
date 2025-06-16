#!/usr/bin/env node

// scripts/secure-update-env.js
// Version sécurisée du script de mise à jour des variables d'environnement

const os = require('os')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * Configuration de sécurité
 */
const SECURITY_CONFIG = {
    // Environnements autorisés pour l'IP automatique
    ALLOWED_ENVIRONMENTS: ['development', 'dev', 'local'],

    // Plages IP privées autorisées (RFC 1918)
    PRIVATE_IP_RANGES: [
        /^10\./, // 10.0.0.0/8
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
        /^192\.168\./, // 192.168.0.0/16
    ],

    // Interfaces réseau à exclure
    EXCLUDED_INTERFACES: ['VirtualBox', 'VMware', 'Hyper-V', 'Docker'],

    // Mode debug autorisé uniquement en développement
    DEBUG_MODE: process.env.NODE_ENV === 'development',
}

/**
 * Valide si une IP est dans une plage privée autorisée
 */
function isPrivateIPAllowed(ip) {
    return SECURITY_CONFIG.PRIVATE_IP_RANGES.some((range) => range.test(ip))
}

/**
 * Valide si l'interface réseau est autorisée
 */
function isInterfaceAllowed(interfaceName) {
    return !SECURITY_CONFIG.EXCLUDED_INTERFACES.some((excluded) =>
        interfaceName.toLowerCase().includes(excluded.toLowerCase())
    )
}

/**
 * Détection sécurisée de l'IP locale
 */
function getSecureLocalIP() {
    const interfaces = os.networkInterfaces()
    const candidates = []

    for (const [name, addresses] of Object.entries(interfaces)) {
        // Vérifier si l'interface est autorisée
        if (!isInterfaceAllowed(name)) {
            if (SECURITY_CONFIG.DEBUG_MODE) {
                console.log(`⚠️  Interface exclue: ${name}`)
            }
            continue
        }

        for (const address of addresses) {
            // IPv4, non-interne, et dans une plage privée autorisée
            if (
                address.family === 'IPv4' &&
                !address.internal &&
                address.address &&
                isPrivateIPAllowed(address.address)
            ) {
                candidates.push({
                    ip: address.address,
                    interface: name,
                    netmask: address.netmask,
                })
            }
        }
    }

    if (candidates.length === 0) {
        if (SECURITY_CONFIG.DEBUG_MODE) {
            console.warn(
                '⚠️  Aucune IP privée valide trouvée, utilisation de localhost'
            )
        }
        return null
    }

    // Prioriser l'interface WiFi/Ethernet principale
    const prioritized = candidates.sort((a, b) => {
        const aScore =
            a.interface.toLowerCase().includes('wi-fi') ||
            a.interface.toLowerCase().includes('ethernet')
                ? 10
                : 0
        const bScore =
            b.interface.toLowerCase().includes('wi-fi') ||
            b.interface.toLowerCase().includes('ethernet')
                ? 10
                : 0
        return bScore - aScore
    })

    const selected = prioritized[0]

    if (SECURITY_CONFIG.DEBUG_MODE) {
        console.log(
            `✅ IP sélectionnée: ${selected.ip} (${selected.interface})`
        )
    }

    return selected.ip
}

/**
 * Génère un hash pour masquer l'IP en logs publics
 */
function generateIPHash(ip) {
    return crypto
        .createHash('sha256')
        .update(ip + 'supchat-salt')
        .digest('hex')
        .substring(0, 8)
}

/**
 * Met à jour sécurisée d'un fichier .env
 */
function secureUpdateEnvFile(filePath, envVars, isClientSide = false) {
    let content = ''

    // Lire le fichier existant s'il existe
    if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8')
    }

    // Vérifier l'environnement pour les variables client
    if (
        isClientSide &&
        !SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(
            process.env.NODE_ENV || 'development'
        )
    ) {
        console.warn(
            `⚠️  IP automatique désactivée en environnement: ${process.env.NODE_ENV}`
        )
        return
    }

    // Mettre à jour chaque variable avec validation
    Object.entries(envVars).forEach(([key, value]) => {
        // Valider que les variables client contiennent bien une IP privée
        if (
            isClientSide &&
            value.includes('http://') &&
            !value.includes('localhost')
        ) {
            const urlMatch = value.match(/http:\/\/([^:\/]+)/)
            if (urlMatch && !isPrivateIPAllowed(urlMatch[1])) {
                console.error(`❌ IP publique détectée pour ${key}: ${value}`)
                return
            }
        }

        const regex = new RegExp(`^${key}=.*$`, 'm')
        const line = `${key}=${value}`

        if (regex.test(content)) {
            content = content.replace(regex, line)
        } else {
            content += content.endsWith('\n') || content === '' ? '' : '\n'
            content += `${line}\n`
        }
    })

    // Créer le dossier si nécessaire
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // Écrire le fichier avec permissions restreintes
    fs.writeFileSync(filePath, content, { mode: 0o600 })

    const relativePath = path.relative(process.cwd(), filePath)
    console.log(`✅ Mis à jour (sécurisé): ${relativePath}`)
}

/**
 * Génère les .env de manière sécurisée
 */
function secureGenerateEnvFiles() {
    console.log('\n🔒 Mise à jour SÉCURISÉE des fichiers .env SupChat')
    console.log('==================================================')

    // Vérifier l'environnement
    const currentEnv = process.env.NODE_ENV || 'development'
    if (!SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(currentEnv)) {
        console.error('❌ Génération IP automatique désactivée en production !')
        console.log(
            "💡 Configurez manuellement les variables d'environnement en production"
        )
        return
    }

    const localIP = getSecureLocalIP()
    if (!localIP) {
        console.error('❌ Impossible de détecter une IP privée sécurisée')
        console.log('💡 Utilisation de localhost par défaut')
        return
    }

    const serverPort = process.env.PORT || 3000
    const ipHash = generateIPHash(localIP)

    console.log(`🔐 IP locale sécurisée: ${localIP} (hash: ${ipHash})`)
    console.log(`🔌 Port serveur: ${serverPort}`)
    console.log(`🌍 Environnement: ${currentEnv}\n`)

    const projectRoot = path.resolve(__dirname, '..')

    // 1. client-web (.env) - ATTENTION: variables exposées côté client
    const webEnvPath = path.join(projectRoot, 'client-web', '.env')
    secureUpdateEnvFile(
        webEnvPath,
        {
            VITE_BACKEND_URL: `http://${localIP}:${serverPort}`,
            VITE_API_URL: `http://${localIP}:${serverPort}/api`,
            VITE_SOCKET_URL: `http://${localIP}:${serverPort}`,
            VITE_HOST_IP: localIP,
            VITE_ENV: currentEnv,
            VITE_IP_HASH: ipHash, // Pour validation sans exposer l'IP complète
        },
        true
    )

    // 2. client-mobile (.env) - ATTENTION: variables exposées côté client
    const mobileEnvPath = path.join(projectRoot, 'client-mobile', '.env')
    secureUpdateEnvFile(
        mobileEnvPath,
        {
            EXPO_PUBLIC_HOST: localIP,
            EXPO_PUBLIC_API_URL: `http://${localIP}:${serverPort}/api`,
            EXPO_PUBLIC_SOCKET_URL: `http://${localIP}:${serverPort}`,
            EXPO_PUBLIC_BACKEND_URL: `http://${localIP}:${serverPort}`,
            EXPO_PUBLIC_ENV: currentEnv,
            EXPO_PUBLIC_IP_HASH: ipHash,
        },
        true
    )

    // 3. supchat-server (.env) - Variables serveur sécurisées
    const serverEnvPath = path.join(projectRoot, 'supchat-server', '.env')
    const serverEnvVars = {}

    // Préserver les secrets existants
    if (fs.existsSync(serverEnvPath)) {
        const existingContent = fs.readFileSync(serverEnvPath, 'utf8')
        if (!existingContent.includes('HOST_IP=')) {
            serverEnvVars['HOST_IP'] = localIP
            serverEnvVars['HOST_IP_HASH'] = ipHash
        }
    } else {
        serverEnvVars['HOST_IP'] = localIP
        serverEnvVars['HOST_IP_HASH'] = ipHash
        serverEnvVars['PORT'] = serverPort
        serverEnvVars['NODE_ENV'] = currentEnv
    }

    if (Object.keys(serverEnvVars).length > 0) {
        secureUpdateEnvFile(serverEnvPath, serverEnvVars, false)
    }

    console.log('\n🔒 Variables générées de manière sécurisée:')
    console.log(`   ✅ client-web: Configuration IP privée (${ipHash})`)
    console.log(`   ✅ client-mobile: Configuration IP privée (${ipHash})`)
    console.log(`   ✅ server: Configuration réseau sécurisée`)

    console.log('\n⚠️  AVERTISSEMENTS DE SÉCURITÉ:')
    console.log(
        '   • Les variables VITE_* et EXPO_PUBLIC_* sont EXPOSÉES côté client'
    )
    console.log("   • N'utilisez JAMAIS de secrets dans ces variables")
    console.log(
        '   • Cette configuration est UNIQUEMENT pour le développement local'
    )
    console.log('   • En production, configurez manuellement avec HTTPS')

    console.log('\n🛡️  Recommandations:')
    console.log('   • Utilisez HTTPS en production')
    console.log('   • Configurez un reverse proxy (nginx)')
    console.log(
        "   • Utilisez des variables d'environnement côté serveur pour les secrets"
    )
    console.log("   • Activez le firewall pour restreindre l'accès")

    console.log('==================================================\n')
}

// Vérification des permissions au démarrage
if (require.main === module) {
    // Vérifier si on est en mode développement
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Ce script ne doit PAS être utilisé en production !')
        process.exit(1)
    }

    secureGenerateEnvFiles()
}

module.exports = {
    getSecureLocalIP,
    secureGenerateEnvFiles,
    generateIPHash,
    SECURITY_CONFIG,
}
