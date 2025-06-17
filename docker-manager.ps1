# Script de gestion Docker pour SUPCHAT - Version PowerShell
# Auteur: SUPCHAT Team
# Version: 1.0

# Configuration
$PROJECT_NAME = "supchat"
$SERVICES = @("web", "api", "mobile", "db", "cadvisor")

# Fonction pour afficher le header avec couleurs
function Show-Header {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    🚀 SUPCHAT DOCKER MANAGER                ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║              Gestion complète de l'environnement Docker     ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Fonction pour afficher l'état des containers
function Show-Status {
    Write-Host "`n📊 État actuel des containers:" -ForegroundColor Blue
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Blue
    
    try {
        $status = docker-compose ps 2>$null
        if ($status -match "supchat") {
            docker-compose ps
        } else {
            Write-Host "Aucun container en cours d'exécution" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Aucun container en cours d'exécution" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Fonction pour afficher le menu principal
function Show-Menu {
    Write-Host "ENVIRONNEMENTS:" -ForegroundColor White
    Write-Host "  1) 🚀 Lancer TOUT en DÉVELOPPEMENT (hot reload)" -ForegroundColor Green
    Write-Host "  2) 🏭 Lancer TOUT en PRODUCTION (optimisé)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "GESTION DES SERVICES:" -ForegroundColor White
    Write-Host "  3) 🔧 Démarrer un service spécifique" -ForegroundColor Cyan
    Write-Host "  4) ⏹️  Arrêter un service spécifique" -ForegroundColor Cyan
    Write-Host "  5) 🔄 Redémarrer un service spécifique" -ForegroundColor Cyan
    Write-Host "  6) 🏗️  Builder/Rebuilder un service" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "MONITORING & LOGS:" -ForegroundColor White
    Write-Host "  7) 📊 Voir l'état des containers" -ForegroundColor Yellow
    Write-Host "  8) 📝 Voir les logs d'un service" -ForegroundColor Yellow
    Write-Host "  9) 📈 Suivre les logs en temps réel" -ForegroundColor Yellow
    Write-Host " 10) 🖥️  Ouvrir un shell dans un container" -ForegroundColor Yellow
    Write-Host ""    Write-Host "MAINTENANCE:" -ForegroundColor White
    Write-Host " 11) 🛑 Arrêter TOUS les services" -ForegroundColor Red
    Write-Host " 12) 🧹 Options de nettoyage (soft/complet)" -ForegroundColor Red
    Write-Host " 13) 🔄 Restart complet (stop + build + start)" -ForegroundColor Red
    Write-Host ""
    Write-Host "UTILITAIRES:" -ForegroundColor White
    Write-Host " 14) 💾 Backup de la base de données" -ForegroundColor Blue
    Write-Host " 15) 📦 Voir l'utilisation des ressources" -ForegroundColor Blue
    Write-Host " 16) 🌐 Ouvrir les URLs de l'application" -ForegroundColor Blue
    Write-Host ""
    Write-Host " 0) ❌ Quitter" -ForegroundColor White
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
}

# Fonction pour sélectionner un service
function Select-Service {
    param([string]$Prompt)
    
    Write-Host "`n$Prompt" -ForegroundColor Cyan
    Write-Host "Services disponibles:"
    for ($i = 0; $i -lt $SERVICES.Count; $i++) {
        Write-Host "  $($i + 1)) $($SERVICES[$i])"
    }
    Write-Host ""
    
    $choice = Read-Host "Sélectionnez un service (numéro)"
    
    if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $SERVICES.Count) {
        return $SERVICES[[int]$choice - 1]
    } else {
        return $null
    }
}

# Fonction pour lancer l'environnement de développement
function Start-Development {
    Write-Host "`n🚀 Démarrage de l'environnement de DÉVELOPPEMENT..." -ForegroundColor Green
    Write-Host "Mode: Hot reload activé pour tous les services" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════"
    
    Write-Host "`nBuilding images de développement..." -ForegroundColor Blue
    docker-compose build --no-cache
    
    Write-Host "`nDémarrage des services..." -ForegroundColor Blue
    docker-compose up -d
    
    Write-Host "`n✅ Environnement de développement démarré !" -ForegroundColor Green
    Write-Host "📍 URLs disponibles:" -ForegroundColor Cyan
    Write-Host "   • Web (Frontend): http://localhost:80"
    Write-Host "   • API (Backend): http://localhost:3000"
    Write-Host "   • MongoDB: localhost:27017"
    Write-Host "   • cAdvisor (Monitoring): http://localhost:8080"
    
    Pause-Script
}

# Fonction pour lancer l'environnement de production
function Start-Production {
    Write-Host "`n🏭 Démarrage de l'environnement de PRODUCTION..." -ForegroundColor Magenta
    Write-Host "Mode: Images optimisées + Health checks" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════"
    
    Write-Host "`nBuilding images de production..." -ForegroundColor Blue
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    Write-Host "`nDémarrage des services..." -ForegroundColor Blue
    docker-compose -f docker-compose.prod.yml up -d
    
    Write-Host "`n✅ Environnement de production démarré !" -ForegroundColor Green
    Write-Host "📍 URLs disponibles:" -ForegroundColor Cyan
    Write-Host "   • Web (Frontend): http://localhost:80"
    Write-Host "   • API (Backend): http://localhost:3000"
    Write-Host "   • MongoDB: localhost:27017"
    Write-Host "   • cAdvisor (Monitoring): http://localhost:8080"
    
    Pause-Script
}

# Fonction pour démarrer un service spécifique
function Start-Service {
    $service = Select-Service "Quel service voulez-vous démarrer ?"
    if ($service) {
        Write-Host "`n🔧 Démarrage du service: $service" -ForegroundColor Green
        docker-compose up -d $service
        Write-Host "✅ Service $service démarré !" -ForegroundColor Green
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
    }
    Pause-Script
}

# Fonction pour arrêter un service spécifique
function Stop-Service {
    $service = Select-Service "Quel service voulez-vous arrêter ?"
    if ($service) {
        Write-Host "`n⏹️ Arrêt du service: $service" -ForegroundColor Red
        docker-compose stop $service
        Write-Host "✅ Service $service arrêté !" -ForegroundColor Green
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
    }
    Pause-Script
}

# Fonction pour redémarrer un service spécifique
function Restart-Service {
    $service = Select-Service "Quel service voulez-vous redémarrer ?"
    if ($service) {
        Write-Host "`n🔄 Redémarrage du service: $service" -ForegroundColor Yellow
        docker-compose restart $service
        Write-Host "✅ Service $service redémarré !" -ForegroundColor Green
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
    }
    Pause-Script
}

# Fonction pour builder un service
function Build-Service {
    $service = Select-Service "Quel service voulez-vous builder ?"
    if ($service) {
        Write-Host "`n🏗️ Building du service: $service" -ForegroundColor Blue
        Write-Host "Choisissez le mode:"
        Write-Host "  1) Développement (Dockerfile.dev)"
        Write-Host "  2) Production (Dockerfile)"
        $mode = Read-Host "Mode (1-2)"
        
        switch ($mode) {
            "1" {
                docker-compose build --no-cache $service
                Write-Host "✅ Service $service buildé en mode développement !" -ForegroundColor Green
            }
            "2" {
                docker-compose -f docker-compose.prod.yml build --no-cache $service
                Write-Host "✅ Service $service buildé en mode production !" -ForegroundColor Green
            }
            default {
                Write-Host "❌ Mode invalide" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
    }
    Pause-Script
}

# Fonction pour voir les logs d'un service
function View-Logs {
    $service = Select-Service "De quel service voulez-vous voir les logs ?"
    if ($service) {
        Write-Host "`n📝 Logs du service: $service" -ForegroundColor Yellow
        Write-Host "════════════════════════════════════════════════════════"
        docker-compose logs --tail=50 $service
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
    }
    Pause-Script
}

# Fonction pour suivre les logs en temps réel
function Follow-Logs {
    $service = Select-Service "De quel service voulez-vous suivre les logs ?"
    if ($service) {
        Write-Host "`n📈 Logs en temps réel du service: $service" -ForegroundColor Yellow
        Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Cyan
        Write-Host "════════════════════════════════════════════════════════"
        docker-compose logs -f $service
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
        Pause-Script
    }
}

# Fonction pour ouvrir un shell dans un container
function Open-Shell {
    $service = Select-Service "Dans quel container voulez-vous ouvrir un shell ?"
    if ($service) {
        Write-Host "`n🖥️ Ouverture d'un shell dans: $service" -ForegroundColor Cyan
        
        # Vérifier si le container est en cours d'exécution
        $status = docker-compose ps $service
        if ($status -match "Up") {
            switch ($service) {
                { $_ -in @("web", "api", "mobile") } {
                    docker-compose exec $service /bin/sh
                }
                "db" {
                    Write-Host "Choix disponibles:"
                    Write-Host "  1) Shell bash/sh"
                    Write-Host "  2) MongoDB shell (mongosh)"
                    $choice = Read-Host "Votre choix (1-2)"
                    switch ($choice) {
                        "1" { docker-compose exec $service /bin/bash }
                        "2" { docker-compose exec $service mongosh }
                        default { Write-Host "❌ Choix invalide" -ForegroundColor Red }
                    }
                }
                default {
                    docker-compose exec $service /bin/sh
                }
            }
        } else {
            Write-Host "❌ Le container $service n'est pas en cours d'exécution" -ForegroundColor Red
            Pause-Script
        }
    } else {
        Write-Host "❌ Service invalide" -ForegroundColor Red
        Pause-Script
    }
}

# Fonction pour arrêter tous les services
function Stop-All {
    Write-Host "`n🛑 Arrêt de TOUS les services..." -ForegroundColor Red
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    Write-Host "✅ Tous les services arrêtés !" -ForegroundColor Green
    Pause-Script
}

# Fonction de nettoyage complet
function Clean-All {
    Write-Host "`n🧹 Options de nettoyage du projet..." -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════════════"
    Write-Host "Choisissez le type de nettoyage :" -ForegroundColor White
    Write-Host "  1) 🔄 Nettoyage SOFT (containers + images, GARDE les volumes)" -ForegroundColor Yellow
    Write-Host "  2) 💥 Nettoyage COMPLET (containers + images + volumes - PERTE DE DONNÉES)" -ForegroundColor Red
    Write-Host "  3) 📊 Voir ce qui sera supprimé" -ForegroundColor Cyan
    Write-Host "  0) ❌ Annuler" -ForegroundColor White
    Write-Host ""
    $cleanupChoice = Read-Host "Votre choix (0-3)"
    
    switch ($cleanupChoice) {
        "1" {
            Write-Host "`n🔄 Nettoyage SOFT (préservation des données)..." -ForegroundColor Yellow
            Write-Host "✅ Les volumes (base de données) seront PRÉSERVÉS" -ForegroundColor Green
            $confirm = Read-Host "Continuer ? (y/N)"
            
            if ($confirm -match '^[Yy]$') {
                Write-Host "🛑 Arrêt des services..."
                docker-compose down
                docker-compose -f docker-compose.prod.yml down
                
                Write-Host "🗑️ Suppression des images..."
                $images = docker images --format "table {{.Repository}}:{{.Tag}}" | Where-Object { $_ -match $PROJECT_NAME }
                if ($images) {
                    $images | ForEach-Object { docker rmi $_ -f }
                }
                
                Write-Host "🧽 Nettoyage des ressources non utilisées..."
                docker system prune -f
                
                Write-Host "✅ Nettoyage SOFT terminé ! Données préservées." -ForegroundColor Green
            } else {
                Write-Host "Nettoyage annulé" -ForegroundColor Yellow
            }
        }
        "2" {
            Write-Host "`n💥 Nettoyage COMPLET (DESTRUCTEUR)..." -ForegroundColor Red
            Write-Host "⚠️  ATTENTION: Cela va supprimer:" -ForegroundColor Red
            Write-Host "   • Tous les containers"
            Write-Host "   • Toutes les images du projet"
            Write-Host "   • TOUS LES VOLUMES (base de données MongoDB)" -ForegroundColor Red
            Write-Host "   • TOUS LES FICHIERS STOCKÉS" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Conseil: Utilisez l'option 14 (Backup) avant ce nettoyage" -ForegroundColor Yellow
            Write-Host ""
            $confirm = Read-Host "Êtes-vous VRAIMENT sûr ? Tapez 'DELETE' pour confirmer"
            
            if ($confirm -eq "DELETE") {
                Write-Host "🛑 Arrêt des services..."
                docker-compose down -v
                docker-compose -f docker-compose.prod.yml down -v
                
                Write-Host "🗑️ Suppression des images..."
                $images = docker images --format "table {{.Repository}}:{{.Tag}}" | Where-Object { $_ -match $PROJECT_NAME }
                if ($images) {
                    $images | ForEach-Object { docker rmi $_ -f }
                }
                
                Write-Host "🧽 Nettoyage des ressources non utilisées..."
                docker system prune -f
                
                Write-Host "✅ Nettoyage COMPLET terminé ! Toutes les données supprimées." -ForegroundColor Green
            } else {
                Write-Host "Nettoyage COMPLET annulé (bonne décision !)" -ForegroundColor Yellow
            }
        }
        "3" {
            Write-Host "`n📊 Analyse de ce qui serait supprimé..." -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🐳 Containers en cours:" -ForegroundColor Blue
            docker-compose ps
            Write-Host ""
            Write-Host "🖼️ Images du projet:" -ForegroundColor Blue
            $images = docker images | Select-String $PROJECT_NAME
            if ($images) { $images } else { Write-Host "Aucune image trouvée" }
            Write-Host ""
            Write-Host "💾 Volumes du projet:" -ForegroundColor Blue
            $volumes = docker volume ls | Select-String $PROJECT_NAME
            if ($volumes) { $volumes } else { Write-Host "Volumes définis dans docker-compose.yml" }
            Write-Host ""
            Write-Host "💡 Volumes principaux:" -ForegroundColor Yellow
            Write-Host "   • mongo-data (base de données MongoDB)"
            Write-Host "   • Volumes de développement (code mappé)"
        }
        default {
            Write-Host "Nettoyage annulé" -ForegroundColor Yellow
        }
    }
    Pause-Script
}

# Fonction de restart complet
function Full-Restart {
    Write-Host "`n🔄 Restart complet du projet..." -ForegroundColor Yellow
    Write-Host "Choisissez l'environnement:"
    Write-Host "  1) Développement"
    Write-Host "  2) Production"
    $env = Read-Host "Environnement (1-2)"
    
    Write-Host "🛑 Arrêt des services..."
    Stop-All
    
    switch ($env) {
        "1" { Start-Development }
        "2" { Start-Production }
        default {
            Write-Host "❌ Choix invalide" -ForegroundColor Red
            Pause-Script
        }
    }
}

# Fonction de backup de la base de données
function Backup-Database {
    Write-Host "`n💾 Backup de la base de données MongoDB..." -ForegroundColor Blue
    
    # Vérifier si le container db est en cours d'exécution
    $status = docker-compose ps db
    if ($status -match "Up") {
        $backupDir = "./backups"
        if (!(Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir | Out-Null
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "$backupDir/mongodb_backup_$timestamp"
        
        Write-Host "📦 Création du backup..."
        docker-compose exec -T db mongodump --out /tmp/backup
        docker-compose exec -T db tar -czf "/tmp/backup_$timestamp.tar.gz" -C /tmp backup
        
        $containerId = docker-compose ps -q db
        docker cp "$containerId`:/tmp/backup_$timestamp.tar.gz" "$backupFile.tar.gz"
        
        Write-Host "✅ Backup créé: $backupFile.tar.gz" -ForegroundColor Green
    } else {
        Write-Host "❌ Le container de base de données n'est pas en cours d'exécution" -ForegroundColor Red
    }
    Pause-Script
}

# Fonction pour voir l'utilisation des ressources
function Show-Resources {
    Write-Host "`n📦 Utilisation des ressources Docker:" -ForegroundColor Blue
    Write-Host "════════════════════════════════════════════════════════"
    
    Write-Host "`n💾 Utilisation du disque:" -ForegroundColor Cyan
    docker system df
    
    Write-Host "`n🖥️ Ressources des containers:" -ForegroundColor Cyan
    docker stats --no-stream --format "table {{.Container}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}`t{{.BlockIO}}"
    
    Pause-Script
}

# Fonction pour ouvrir les URLs de l'application
function Open-URLs {
    Write-Host "`n🌐 URLs de l'application SUPCHAT:" -ForegroundColor Blue
    Write-Host "════════════════════════════════════════════════════════"
    Write-Host "Frontend (Web):     http://localhost:80" -ForegroundColor Green
    Write-Host "API (Backend):      http://localhost:3000" -ForegroundColor Green
    Write-Host "API Health:         http://localhost:3000/api/health" -ForegroundColor Green
    Write-Host "API Docs (Swagger): http://localhost:3000/api-docs" -ForegroundColor Green
    Write-Host "MongoDB:            localhost:27017" -ForegroundColor Green
    Write-Host "cAdvisor:           http://localhost:8080" -ForegroundColor Green
    Write-Host ""
    
    $openBrowser = Read-Host "Voulez-vous ouvrir une URL dans le navigateur ? (y/N)"
    if ($openBrowser -match '^[Yy]$') {
        Write-Host "Quelle URL voulez-vous ouvrir ?"
        Write-Host "  1) Frontend (Web)"
        Write-Host "  2) API Health Check"
        Write-Host "  3) API Documentation"
        Write-Host "  4) cAdvisor (Monitoring)"
        $urlChoice = Read-Host "Choix (1-4)"
        
        switch ($urlChoice) {
            "1" { Start-Process "http://localhost:80" }
            "2" { Start-Process "http://localhost:3000/api/health" }
            "3" { Start-Process "http://localhost:3000/api-docs" }
            "4" { Start-Process "http://localhost:8080" }
            default { Write-Host "❌ Choix invalide" -ForegroundColor Red }
        }
    }
    Pause-Script
}

# Fonction pour faire une pause
function Pause-Script {
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour continuer..."
}

# Fonction principale
function Main {
    while ($true) {
        Show-Header
        Show-Status
        Show-Menu
        
        $choice = Read-Host "Votre choix"
        
        switch ($choice) {
            "1" { Start-Development }
            "2" { Start-Production }
            "3" { Start-Service }
            "4" { Stop-Service }
            "5" { Restart-Service }
            "6" { Build-Service }
            "7" { Show-Status; Pause-Script }
            "8" { View-Logs }
            "9" { Follow-Logs }
            "10" { Open-Shell }
            "11" { Stop-All }
            "12" { Clean-All }
            "13" { Full-Restart }
            "14" { Backup-Database }
            "15" { Show-Resources }
            "16" { Open-URLs }
            "0" {
                Write-Host "`n👋 Au revoir !" -ForegroundColor Green
                exit 0
            }
            default {
                Write-Host "`n❌ Choix invalide. Veuillez réessayer." -ForegroundColor Red
                Pause-Script
            }
        }
    }
}

# Vérifications préliminaires
Write-Host "Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier que Docker est installé
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que Docker Compose est installé
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Docker Compose n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ Fichier docker-compose.yml non trouvé. Assurez-vous d'être dans le répertoire racine du projet." -ForegroundColor Red
    exit 1
}

# Lancer le script principal
Main
