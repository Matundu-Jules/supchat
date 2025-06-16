#!/usr/bin/env node

const { spawn, exec } = require('child_process')
const path = require('path')
const { generateAllEnvFiles } = require('./update-env')

/**
 * Lance une commande dans un répertoire spécifique
 */
function runCommand(command, cwd, label) {
    console.log(`🚀 Lancement: ${label}`)

    const child = spawn(command, [], {
        cwd,
        shell: true,
        stdio: 'inherit',
    })

    child.on('error', (err) => {
        console.error(`❌ Erreur ${label}:`, err.message)
    })

    return child
}

/**
 * Vérifie si npm install est nécessaire
 */
function checkDependencies(projectPath) {
    const nodeModulesPath = path.join(projectPath, 'node_modules')
    const packageJsonPath = path.join(projectPath, 'package.json')

    try {
        const fs = require('fs')
        if (!fs.existsSync(nodeModulesPath) && fs.existsSync(packageJsonPath)) {
            console.log(
                `📦 Installation des dépendances dans ${path.basename(
                    projectPath
                )}...`
            )
            return new Promise((resolve) => {
                const install = spawn('npm', ['install'], {
                    cwd: projectPath,
                    stdio: 'inherit',
                })
                install.on('close', resolve)
            })
        }
    } catch (err) {
        console.warn(
            `⚠️  Erreur vérification dépendances ${projectPath}:`,
            err.message
        )
    }

    return Promise.resolve()
}

/**
 * Lance tous les services SupChat en mode développement
 */
async function startDevEnvironment() {
    console.log('\n🔧 SupChat - Lancement Environnement de Développement')
    console.log('=====================================================\n')

    // 1. Mise à jour automatique des .env
    console.log('📝 Étape 1: Mise à jour des fichiers .env...')
    generateAllEnvFiles()

    // Chemins des projets
    const projectRoot = path.resolve(__dirname, '..')
    const serverPath = path.join(projectRoot, 'supchat-server')
    const webPath = path.join(projectRoot, 'client-web')
    const mobilePath = path.join(projectRoot, 'client-mobile')

    // 2. Vérifier les dépendances
    console.log('\n📦 Étape 2: Vérification des dépendances...')
    await checkDependencies(serverPath)
    await checkDependencies(webPath)
    await checkDependencies(mobilePath)

    // 3. Lancement des services
    console.log('\n🚀 Étape 3: Lancement des services...\n')

    // Lancer la base de données (Docker)
    console.log('🐳 Démarrage base de données MongoDB...')
    runCommand('docker-compose up db -d', projectRoot, 'MongoDB (Docker)')

    // Attendre un peu que la DB démarre
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Lancer le serveur backend
    const serverProcess = runCommand(
        'npm start',
        serverPath,
        'SupChat Server (Backend)'
    )

    // Attendre que le serveur démarre
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Lancer le client web
    const webProcess = runCommand(
        'npm run dev',
        webPath,
        'Client Web (React + Vite)'
    )

    // Lancer le client mobile
    const mobileProcess = runCommand(
        'npm start',
        mobilePath,
        'Client Mobile (Expo)'
    )

    console.log('\n✨ Tous les services SupChat sont en cours de démarrage !')
    console.log('=========================================================')
    console.log('📱 Accès aux services:')
    console.log('   • Client Web: http://localhost:5173')
    console.log('   • Client Mobile: Suivez les instructions Expo')
    console.log('   • API Backend: Voir les logs du serveur ci-dessus')
    console.log('')
    console.log('⏹️  Pour arrêter tous les services: Ctrl+C')
    console.log('=========================================================\n')

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
        console.log('\n🛑 Arrêt des services SupChat...')
        serverProcess?.kill()
        webProcess?.kill()
        mobileProcess?.kill()
        process.exit(0)
    })
}

// Lancer si appelé directement
if (require.main === module) {
    startDevEnvironment().catch(console.error)
}

module.exports = {
    startDevEnvironment,
    runCommand,
    checkDependencies,
}
