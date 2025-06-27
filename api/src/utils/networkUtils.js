// src/utils/networkUtils.js

const os = require('os')

/**
 * Détecte automatiquement l'IP locale de la machine
 * @returns {string} IP locale ou 'localhost' en fallback
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces() // Priorité aux interfaces non-internes (WiFi, Ethernet)
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // IPv4, non-interne, et address valide
            if (iface.family === 'IPv4' && !iface.internal && iface.address) {
                return iface.address
            }
        }
    }

    // Fallback sur localhost si aucune IP trouvée
    return 'localhost'
}

/**
 * Génère les URLs autorisées pour CORS et Socket.io basées sur l'IP détectée
 * @param {number} port - Port du serveur
 * @returns {Array} Liste des origines autorisées
 */
function generateAllowedOrigins(port = 3000) {
    const localIP = getLocalIP()
    const ports = [5173, 3000, 8080, 80] // Ports communs client-web et mobile

    const origins = []

    // Ajouter localhost et 127.0.0.1
    ports.forEach((clientPort) => {
        origins.push(`http://localhost:${clientPort}`)
        origins.push(`http://127.0.0.1:${clientPort}`)
    }) // Ajouter l'IP locale détectée
    if (localIP !== 'localhost') {
        ports.forEach((clientPort) => {
            origins.push(`http://${localIP}:${clientPort}`)
        })
    }

    // Ajouter les IPs VirtualBox communes pour le développement
    const virtualBoxIPs = ['localhost', '10.0.2.2', '192.168.1.1']
    virtualBoxIPs.forEach((vbIP) => {
        ports.forEach((clientPort) => {
            origins.push(`http://${vbIP}:${clientPort}`)
        })
        origins.push(`http://${vbIP}`)
    })

    // Ajouter les versions sans port pour 80
    origins.push('http://localhost')
    origins.push('http://127.0.0.1')
    if (localIP !== 'localhost') {
        origins.push(`http://${localIP}`)
    }

    return origins
}

/**
 * Affiche les informations de configuration réseau
 * @param {number} port - Port du serveur
 */
function displayNetworkInfo(port = 3000) {
    const localIP = getLocalIP()

    console.log('\n🌐 SupChat Server - Configuration Réseau')
    console.log('=========================================')
    console.log(`📍 IP Locale détectée: ${localIP}`)
    console.log(`🔌 Port: ${port}`)
    console.log("\n📱 URLs d'accès:")
    console.log(`   Local:      http://localhost:${port}`)
    if (localIP !== 'localhost') {
        console.log(`   Réseau:     http://${localIP}:${port}`)
        console.log(`   Mobile:     http://${localIP}:${port}`)
    }
    console.log('\n🎯 Pour client-web (Vite):')
    console.log(`   VITE_API_URL=http://${localIP}:${port}`)
    console.log('\n📱 Pour client-mobile (Expo):')
    console.log(`   EXPO_PUBLIC_HOST=${localIP}`)
    console.log(`   EXPO_PUBLIC_API_URL=http://${localIP}:${port}/api`)
    console.log('=========================================\n')
}

module.exports = {
    getLocalIP,
    generateAllowedOrigins,
    displayNetworkInfo,
}
