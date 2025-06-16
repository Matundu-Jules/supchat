#!/usr/bin/env node

// scripts/test-connection.js
// Script pour tester la connectivité entre les clients et le serveur

const { getLocalIP } = require('./update-env')
const http = require('http')
const { URL } = require('url')

/**
 * Teste la connectivité vers une URL
 */
function testConnection(url, timeout = 5000) {
    return new Promise((resolve) => {
        try {
            const urlObj = new URL(url)
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname,
                method: 'GET',
                timeout: timeout,
            }

            const req = http.request(options, (res) => {
                resolve({
                    success: true,
                    status: res.statusCode,
                    message: `HTTP ${res.statusCode}`,
                })
            })

            req.on('error', (err) => {
                resolve({
                    success: false,
                    status: null,
                    message: err.message,
                })
            })

            req.on('timeout', () => {
                req.destroy()
                resolve({
                    success: false,
                    status: null,
                    message: 'Timeout de connexion',
                })
            })

            req.end()
        } catch (error) {
            resolve({
                success: false,
                status: null,
                message: error.message,
            })
        }
    })
}

/**
 * Teste la connectivité de tous les services SupChat
 */
async function testSupChatConnectivity() {
    const localIP = getLocalIP()
    const serverPort = process.env.PORT || 3000

    console.log('\n🔍 Test de Connectivité SupChat')
    console.log('================================')
    console.log(`🌐 IP locale détectée: ${localIP}`)
    console.log(`🔌 Port serveur: ${serverPort}\n`)

    const tests = [
        {
            name: 'Serveur Backend (localhost)',
            url: `http://localhost:${serverPort}/api/health`,
        },
        {
            name: 'Serveur Backend (IP réseau)',
            url: `http://${localIP}:${serverPort}/api/health`,
        },
        {
            name: 'Client Web (dev server)',
            url: 'http://localhost:5173',
        },
        {
            name: 'Client Web (IP réseau)',
            url: `http://${localIP}:5173`,
        },
    ]

    const results = []

    for (const test of tests) {
        process.stdout.write(`🔍 Test ${test.name}... `)
        const result = await testConnection(test.url)

        if (result.success) {
            console.log(`✅ ${result.message}`)
        } else {
            console.log(`❌ ${result.message}`)
        }

        results.push({
            ...test,
            ...result,
        })
    }

    console.log('\n📊 Résumé des Tests:')
    console.log('====================')

    const successCount = results.filter((r) => r.success).length
    const totalCount = results.length

    console.log(`✅ Réussis: ${successCount}/${totalCount}`)
    console.log(`❌ Échoués: ${totalCount - successCount}/${totalCount}\n`)

    if (successCount === 0) {
        console.log("🚨 Aucun service n'est accessible !")
        console.log('💡 Solutions:')
        console.log(
            '   1. Lancez le serveur backend: cd supchat-server && npm start'
        )
        console.log('   2. Lancez le client web: cd client-web && npm run dev')
        console.log('   3. Vérifiez votre firewall Windows')
    } else if (successCount < totalCount) {
        console.log('⚠️  Certains services ne sont pas accessibles')

        const failedTests = results.filter((r) => !r.success)
        failedTests.forEach((test) => {
            console.log(`   • ${test.name}: ${test.message}`)
        })

        if (failedTests.some((t) => t.url.includes(localIP))) {
            console.log('\n💡 Pour les tests IP réseau:')
            console.log(
                '   • Vérifiez que votre firewall autorise les connexions entrantes'
            )
            console.log("   • Assurez-vous d'être sur le même réseau WiFi")
        }
    } else {
        console.log('🎉 Tous les services sont accessibles !')
        console.log('\n📱 URLs pour mobile:')
        console.log(`   • API: http://${localIP}:${serverPort}/api`)
        console.log(`   • Web: http://${localIP}:5173`)
    }

    console.log('\n🔧 Commandes utiles:')
    console.log('   • Mettre à jour les .env: node scripts/update-env.js')
    console.log('   • Lancer tout: node scripts/start-dev.js')
    console.log('   • Menu PowerShell: .\\scripts\\start-supchat.ps1')
    console.log('================================\n')

    return results
}

// Lancer le test si appelé directement
if (require.main === module) {
    testSupChatConnectivity().catch(console.error)
}

module.exports = {
    testConnection,
    testSupChatConnectivity,
}
