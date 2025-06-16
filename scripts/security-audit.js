#!/usr/bin/env node

// scripts/security-audit.js
// Script d'audit de sécurité pour SupChat

const fs = require('fs')
const path = require('path')
const { getSecureLocalIP } = require('./secure-update-env')

/**
 * Patterns de sécurité à détecter
 */
const SECURITY_PATTERNS = {
    // Secrets potentiels
    secrets: [
        /api[_-]?key\s*[=:]\s*['"]?[a-zA-Z0-9]{16,}['"]?/gi,
        /secret[_-]?key\s*[=:]\s*['"]?[a-zA-Z0-9]{16,}['"]?/gi,
        /password\s*[=:]\s*['"]?[^'"\s]{8,}['"]?/gi,
        /token\s*[=:]\s*['"]?[a-zA-Z0-9]{16,}['"]?/gi,
        /jwt[_-]?secret\s*[=:]\s*['"]?[^'"\s]{16,}['"]?/gi,
    ],

    // IP publiques (non-privées)
    publicIPs: [
        /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g,
    ],

    // URLs HTTP en dur (non-HTTPS)
    insecureUrls: [
        /http:\/\/(?!localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.)[^\s'"]+/gi,
    ],

    // Variables d'environnement exposées
    exposedEnvVars: [/process\.env\.[A-Z_]+/g, /import\.meta\.env\.[A-Z_]+/g],
}

/**
 * Fichiers à exclure de l'audit
 */
const EXCLUDED_PATHS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    'uploads',
    'data',
    'logs',
]

/**
 * Extensions de fichiers à auditer
 */
const AUDITED_EXTENSIONS = [
    '.js',
    '.ts',
    '.tsx',
    '.jsx',
    '.json',
    '.env',
    '.yml',
    '.yaml',
]

/**
 * Scanne un fichier à la recherche de problèmes de sécurité
 */
function scanFile(filePath) {
    const issues = []
    const relativePath = path.relative(process.cwd(), filePath)

    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const lines = content.split('\n')

        // Vérifier les secrets
        SECURITY_PATTERNS.secrets.forEach((pattern) => {
            let match
            while ((match = pattern.exec(content)) !== null) {
                const lineNumber = content
                    .substring(0, match.index)
                    .split('\n').length
                issues.push({
                    type: 'SECRET',
                    severity: 'HIGH',
                    file: relativePath,
                    line: lineNumber,
                    message: 'Secret potentiel détecté',
                    context: lines[lineNumber - 1]?.trim().substring(0, 100),
                })
            }
        })

        // Vérifier les IP publiques
        SECURITY_PATTERNS.publicIPs.forEach((pattern) => {
            let match
            while ((match = pattern.exec(content)) !== null) {
                const ip = match[0]
                const lineNumber = content
                    .substring(0, match.index)
                    .split('\n').length

                // Ignorer les IP privées
                if (
                    ip.startsWith('192.168.') ||
                    ip.startsWith('10.') ||
                    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
                    ip === '127.0.0.1' ||
                    ip === '0.0.0.0'
                ) {
                    continue
                }

                issues.push({
                    type: 'PUBLIC_IP',
                    severity: 'MEDIUM',
                    file: relativePath,
                    line: lineNumber,
                    message: `IP publique détectée: ${ip}`,
                    context: lines[lineNumber - 1]?.trim().substring(0, 100),
                })
            }
        })

        // Vérifier les URLs HTTP insécurisées
        SECURITY_PATTERNS.insecureUrls.forEach((pattern) => {
            let match
            while ((match = pattern.exec(content)) !== null) {
                const lineNumber = content
                    .substring(0, match.index)
                    .split('\n').length
                issues.push({
                    type: 'INSECURE_URL',
                    severity: 'MEDIUM',
                    file: relativePath,
                    line: lineNumber,
                    message: 'URL HTTP non-sécurisée détectée',
                    context: lines[lineNumber - 1]?.trim().substring(0, 100),
                })
            }
        })

        // Vérifier les variables d'environnement exposées (côté client uniquement)
        if (
            filePath.includes('client-web') ||
            filePath.includes('client-mobile')
        ) {
            SECURITY_PATTERNS.exposedEnvVars.forEach((pattern) => {
                let match
                while ((match = pattern.exec(content)) !== null) {
                    const envVar = match[0]
                    const lineNumber = content
                        .substring(0, match.index)
                        .split('\n').length

                    // Ignorer les variables autorisées
                    if (
                        envVar.includes('VITE_') ||
                        envVar.includes('EXPO_PUBLIC_') ||
                        envVar.includes('NODE_ENV') ||
                        envVar.includes('MODE')
                    ) {
                        continue
                    }

                    issues.push({
                        type: 'EXPOSED_ENV',
                        severity: 'HIGH',
                        file: relativePath,
                        line: lineNumber,
                        message: `Variable d'environnement potentiellement exposée: ${envVar}`,
                        context: lines[lineNumber - 1]
                            ?.trim()
                            .substring(0, 100),
                    })
                }
            })
        }
    } catch (error) {
        issues.push({
            type: 'SCAN_ERROR',
            severity: 'LOW',
            file: relativePath,
            line: 0,
            message: `Erreur de lecture: ${error.message}`,
            context: '',
        })
    }

    return issues
}

/**
 * Scanne récursivement un répertoire
 */
function scanDirectory(dirPath) {
    const issues = []

    try {
        const entries = fs.readdirSync(dirPath)

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry)
            const stat = fs.statSync(fullPath)

            // Ignorer les répertoires exclus
            if (EXCLUDED_PATHS.some((excluded) => entry.includes(excluded))) {
                continue
            }

            if (stat.isDirectory()) {
                issues.push(...scanDirectory(fullPath))
            } else if (stat.isFile()) {
                const ext = path.extname(entry)
                if (AUDITED_EXTENSIONS.includes(ext)) {
                    issues.push(...scanFile(fullPath))
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️  Erreur scan répertoire ${dirPath}:`, error.message)
    }

    return issues
}

/**
 * Vérifie la configuration des fichiers .env
 */
function auditEnvFiles() {
    const issues = []
    const envFiles = [
        'client-web/.env',
        'client-mobile/.env',
        'supchat-server/.env',
        '.env',
    ]

    for (const envFile of envFiles) {
        const fullPath = path.join(process.cwd(), envFile)
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8')

            // Vérifier les permissions
            const stats = fs.statSync(fullPath)
            const mode = (stats.mode & parseInt('777', 8)).toString(8)
            if (mode !== '600') {
                issues.push({
                    type: 'FILE_PERMISSIONS',
                    severity: 'MEDIUM',
                    file: envFile,
                    line: 0,
                    message: `Permissions fichier trop permissives: ${mode} (recommandé: 600)`,
                    context: '',
                })
            }

            // Vérifier le contenu
            if (
                content.includes('password') ||
                content.includes('secret') ||
                content.includes('key')
            ) {
                if (envFile.includes('client-')) {
                    issues.push({
                        type: 'CLIENT_SECRET',
                        severity: 'HIGH',
                        file: envFile,
                        line: 0,
                        message:
                            'Secrets potentiels dans fichier .env côté client',
                        context: '',
                    })
                }
            }
        }
    }

    return issues
}

/**
 * Audit principal de sécurité
 */
function runSecurityAudit() {
    console.log('\n🔍 AUDIT DE SÉCURITÉ SUPCHAT')
    console.log('=============================\n')

    const startTime = Date.now()
    let issues = []

    // Scanner les répertoires principaux
    const scanDirs = [
        'client-web/src',
        'client-mobile',
        'supchat-server/src',
        'scripts',
    ]

    for (const dir of scanDirs) {
        const fullPath = path.join(process.cwd(), dir)
        if (fs.existsSync(fullPath)) {
            console.log(`🔍 Scan: ${dir}...`)
            issues.push(...scanDirectory(fullPath))
        }
    }

    // Audit des fichiers .env
    console.log('🔍 Audit des fichiers .env...')
    issues.push(...auditEnvFiles())

    const endTime = Date.now()
    const duration = endTime - startTime

    // Grouper par sévérité
    const groupedIssues = {
        HIGH: issues.filter((i) => i.severity === 'HIGH'),
        MEDIUM: issues.filter((i) => i.severity === 'MEDIUM'),
        LOW: issues.filter((i) => i.severity === 'LOW'),
    }

    // Afficher les résultats
    console.log("\n📊 RÉSULTATS DE L'AUDIT")
    console.log('========================')
    console.log(`⏱️  Durée: ${duration}ms`)
    console.log(`📁 Fichiers scannés: ${scanDirs.length} répertoires`)
    console.log(`🚨 Issues trouvées: ${issues.length}\n`)

    if (issues.length === 0) {
        console.log('✅ AUCUN PROBLÈME DE SÉCURITÉ DÉTECTÉ !')
        console.log('🎉 Votre projet SupChat semble sécurisé.\n')
        return
    }

    // Afficher les issues par sévérité
    Object.entries(groupedIssues).forEach(([severity, severityIssues]) => {
        if (severityIssues.length === 0) return

        const icon =
            severity === 'HIGH' ? '🚨' : severity === 'MEDIUM' ? '⚠️' : 'ℹ️'
        console.log(`${icon} ${severity} (${severityIssues.length}):`)

        severityIssues.forEach((issue) => {
            console.log(`   📄 ${issue.file}:${issue.line} - ${issue.message}`)
            if (issue.context) {
                console.log(`      📝 ${issue.context}`)
            }
        })
        console.log('')
    })

    // Recommandations
    console.log('💡 RECOMMANDATIONS:')
    console.log('===================')

    if (groupedIssues.HIGH.length > 0) {
        console.log('🚨 CRITIQUE - Corriger immédiatement:')
        console.log('   • Supprimer tous les secrets du code source')
        console.log("   • Utiliser des variables d'environnement sécurisées")
        console.log('   • Ne jamais commit les fichiers .env\n')
    }

    if (groupedIssues.MEDIUM.length > 0) {
        console.log('⚠️  IMPORTANT - Corriger avant production:')
        console.log('   • Utiliser HTTPS en production')
        console.log('   • Restreindre les IP publiques')
        console.log('   • Configurer les permissions de fichiers\n')
    }

    console.log('🔒 SÉCURITÉ GÉNÉRALE:')
    console.log('   • Utilisez npm run secure-env au lieu de update-env')
    console.log('   • Lisez le SECURITY-GUIDE.md')
    console.log('   • Auditez régulièrement avec ce script')
    console.log('   • Configurez HTTPS en production\n')

    console.log('========================\n')
}

// Lancer l'audit si appelé directement
if (require.main === module) {
    runSecurityAudit()
}

module.exports = {
    runSecurityAudit,
    scanFile,
    scanDirectory,
    auditEnvFiles,
}
