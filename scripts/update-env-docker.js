#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const path = require('path')

/**
 * Fonction de détection d'IP locale
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces()

    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (
                interface.family === 'IPv4' &&
                !interface.internal &&
                interface.address &&
                interface.address.startsWith('192.168.') // Préférer les IPs du réseau local
            ) {
                return interface.address
            }
        }
    }

    // Fallback: prendre n'importe quelle IP non-locale
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (
                interface.family === 'IPv4' &&
                !interface.internal &&
                interface.address
            ) {
                return interface.address
            }
        }
    }

    return 'localhost'
}

/**
 * Met à jour le fichier .env principal avec l'IP locale
 */
function updateMainEnvFile() {
    const localIP = getLocalIP()
    const envPath = path.join(__dirname, '..', '.env')

    console.log('\n🔄 Mise à jour du fichier .env pour Docker')
    console.log('==========================================')
    console.log(`🌐 IP locale détectée: ${localIP}`)

    if (!fs.existsSync(envPath)) {
        console.error('❌ Fichier .env introuvable!')
        return
    }

    let content = fs.readFileSync(envPath, 'utf8') // Variables à mettre à jour pour l'accès mobile
    const updates = {
        VITE_BACKEND_URL: `http://${localIP}:3000`,
        VITE_API_URL: `http://${localIP}:3000/api`,
        VITE_WEBSOCKET_URL: `http://${localIP}:3000`,
        EXPO_PUBLIC_API_URL: `http://${localIP}:3000/api`,
        EXPO_PUBLIC_DEFAULT_HOST: localIP,
        GOOGLE_REDIRECT_URI: `http://${localIP}:3000/api/auth/google/callback`,
        FACEBOOK_REDIRECT_URI: `http://${localIP}:3000/api/auth/facebook/callback`,
    }

    // Mettre à jour chaque variable
    Object.entries(updates).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm')
        const line = `${key}=${value}`

        if (regex.test(content)) {
            content = content.replace(regex, line)
            console.log(`✅ Mis à jour: ${key}=${value}`)
        } else {
            content += `\n${line}`
            console.log(`➕ Ajouté: ${key}=${value}`)
        }
    })

    fs.writeFileSync(envPath, content)

    console.log('\n🎯 Instructions:')
    console.log(`📱 Pour accéder depuis votre téléphone: http://${localIP}`)
    console.log(`🖥️  Pour accéder depuis votre PC: http://localhost`)
    console.log(
        '🔄 Redémarrez les conteneurs Docker pour appliquer les changements'
    )
    console.log('==========================================\n')
}

// Exécuter si appelé directement
if (require.main === module) {
    updateMainEnvFile()
}

module.exports = {
    getLocalIP,
    updateMainEnvFile,
}
