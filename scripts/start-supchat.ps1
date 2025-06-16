# scripts/start-supchat.ps1
# Script PowerShell pour lancer SupChat rapidement avec détection automatique d'IP

Write-Host "`n🚀 SupChat - Lancement Rapide avec Détection IP Automatique" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Vérifier si Node.js est installé
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "💡 Télécharge Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Aller dans le répertoire du projet
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host "`n📝 Étape 1: Détection automatique de l'IP et mise à jour des .env..." -ForegroundColor Green
try {
    node scripts/update-env.js
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de l'exécution du script update-env.js"
    }
} catch {
    Write-Host "❌ Erreur lors de la mise à jour des .env: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Étape 2: Choix du service à lancer..." -ForegroundColor Green
Write-Host "1. 🌐 Serveur Backend uniquement (supchat-server)"
Write-Host "2. 💻 Client Web uniquement (client-web)"
Write-Host "3. 📱 Client Mobile uniquement (client-mobile)"
Write-Host "4. 🗄️  Base de données uniquement (MongoDB Docker)"
Write-Host "5. 🚀 Tout lancer (Backend + Web + Mobile + DB)"
Write-Host "6. 🔧 Environnement complet (avec script start-dev.js)"

$choice = Read-Host "`nChoisis une option (1-6)"

switch ($choice) {
    "1" {
        Write-Host "`n🌐 Lancement du serveur backend..." -ForegroundColor Blue
        Set-Location "supchat-server"
        npm start
    }
    "2" {
        Write-Host "`n💻 Lancement du client web..." -ForegroundColor Blue
        Set-Location "client-web"
        npm run dev
    }
    "3" {
        Write-Host "`n📱 Lancement du client mobile..." -ForegroundColor Blue
        Set-Location "client-mobile"
        npm start
    }
    "4" {
        Write-Host "`n🗄️  Lancement de la base de données..." -ForegroundColor Blue
        docker-compose up db
    }
    "5" {
        Write-Host "`n🚀 Lancement de tous les services..." -ForegroundColor Blue
        
        # Lancer la DB en arrière-plan
        Write-Host "🗄️  Démarrage MongoDB..." -ForegroundColor Yellow
        Start-Process -FilePath "docker-compose" -ArgumentList "up", "db", "-d" -NoNewWindow -Wait
        
        Start-Sleep -Seconds 3
        
        # Lancer le backend en arrière-plan
        Write-Host "🌐 Démarrage du serveur backend..." -ForegroundColor Yellow
        $backendJob = Start-Job -ScriptBlock {
            Set-Location "$using:ProjectRoot\supchat-server"
            npm start
        }
        
        Start-Sleep -Seconds 5
        
        # Lancer le client web en arrière-plan
        Write-Host "💻 Démarrage du client web..." -ForegroundColor Yellow
        $webJob = Start-Job -ScriptBlock {
            Set-Location "$using:ProjectRoot\client-web"
            npm run dev
        }
        
        # Lancer le client mobile en premier plan
        Write-Host "📱 Démarrage du client mobile..." -ForegroundColor Yellow
        Set-Location "client-mobile"
        npm start
        
        # Nettoyer les jobs à la fin
        Stop-Job $backendJob, $webJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob, $webJob -ErrorAction SilentlyContinue
    }
    "6" {
        Write-Host "`n🔧 Lancement avec script Node.js complet..." -ForegroundColor Blue
        node scripts/start-dev.js
    }
    default {
        Write-Host "`n❌ Option invalide!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✨ Script terminé!" -ForegroundColor Green
