#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const path = require('path')

/**
 * Fonction de détection d'IP locale (identique au serveur)
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces()

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
 * Met à jour ou crée un fichier .env avec les nouvelles valeurs
 */
function updateEnvFile(filePath, envVars) {
    let content = ''

    // Lire le fichier existant s'il existe
    if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8')
    }

    // Mettre à jour chaque variable
    Object.entries(envVars).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm')
        const line = `${key}=${value}`

        if (regex.test(content)) {
            // Remplacer la ligne existante
            content = content.replace(regex, line)
        } else {
            // Ajouter la nouvelle ligne
            content += content.endsWith('\n') || content === '' ? '' : '\n'
            content += `${line}\n`
        }
    })

    // Créer le dossier si nécessaire
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // Écrire le fichier
    fs.writeFileSync(filePath, content)
    console.log(`✅ Mis à jour: ${filePath}`)
}

/**
 * Génère les .env pour tous les clients
 */
function generateAllEnvFiles() {
    const localIP = getLocalIP()
    const serverPort = process.env.PORT || 3000

    console.log('\n🔄 Mise à jour automatique des fichiers .env SupChat')
    console.log('=================================================')
    console.log(`🌐 IP locale détectée: ${localIP}`)
    console.log(`🔌 Port serveur: ${serverPort}\n`)

    // Chemin de base du projet
    const projectRoot = path.resolve(__dirname, '..')

    // 1. client-web (.env)
    const webEnvPath = path.join(projectRoot, 'client-web', '.env')
    updateEnvFile(webEnvPath, {
        VITE_BACKEND_URL: `http://${localIP}:${serverPort}`,
        VITE_API_URL: `http://${localIP}:${serverPort}/api`,
        VITE_SOCKET_URL: `http://${localIP}:${serverPort}`,
        VITE_HOST_IP: localIP,
    })

    // 2. client-mobile (.env)
    const mobileEnvPath = path.join(projectRoot, 'client-mobile', '.env')
    updateEnvFile(mobileEnvPath, {
        EXPO_PUBLIC_HOST: localIP,
        EXPO_PUBLIC_API_URL: `http://${localIP}:${serverPort}/api`,
        EXPO_PUBLIC_SOCKET_URL: `http://${localIP}:${serverPort}`,
        EXPO_PUBLIC_BACKEND_URL: `http://${localIP}:${serverPort}`,
    })

    // 3. supchat-server (.env) - au cas où
    const serverEnvPath = path.join(projectRoot, 'supchat-server', '.env')
    const serverEnvVars = {}

    // Lire le .env existant pour ne pas écraser les secrets
    if (fs.existsSync(serverEnvPath)) {
        const existingContent = fs.readFileSync(serverEnvPath, 'utf8')
        // Ajouter seulement HOST_IP si pas de secrets sensibles à préserver
        if (!existingContent.includes('HOST_IP=')) {
            serverEnvVars['HOST_IP'] = localIP
        }
    } else {
        serverEnvVars['HOST_IP'] = localIP
        serverEnvVars['PORT'] = serverPort
    }

    if (Object.keys(serverEnvVars).length > 0) {
        updateEnvFile(serverEnvPath, serverEnvVars)
    }

    console.log('\n🎯 Variables générées:')
    console.log(
        `   client-web: VITE_BACKEND_URL=http://${localIP}:${serverPort}`
    )
    console.log(
        `   client-mobile: EXPO_PUBLIC_API_URL=http://${localIP}:${serverPort}/api`
    )
    console.log(
        '\n✨ Tous les .env sont à jour ! Vous pouvez maintenant lancer vos services.'
    )
    console.log('=================================================\n')
}

// Exécuter si appelé directement
if (require.main === module) {
    generateAllEnvFiles()
}

module.exports = {
    getLocalIP,
    updateEnvFile,
    generateAllEnvFiles,
}
