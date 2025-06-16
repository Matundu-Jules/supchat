# Script de démarrage rapide pour le projet SupChat
# Usage: .\sp.ps1 [option]

param(
    [string]$Action = "full"
)

# Fonction d'aide
function Show-Help {
    Write-Host "SupChat - Script de démarrage rapide" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\sp.ps1 [option]"
    Write-Host ""
    Write-Host "Options disponibles:" -ForegroundColor Yellow
    Write-Host "  full      Démarre tout le projet avec Docker Compose (par défaut)" -ForegroundColor Green
    Write-Host "  db        Démarre seulement la base de données MongoDB" -ForegroundColor Green
    Write-Host "  backend   Démarre le serveur backend en mode dev" -ForegroundColor Green
    Write-Host "  web       Démarre le client web en mode dev" -ForegroundColor Green
    Write-Host "  mobile    Démarre le client mobile en mode dev" -ForegroundColor Green
    Write-Host "  stop      Arrête tous les services Docker" -ForegroundColor Green
    Write-Host "  clean     Arrête et nettoie tous les conteneurs/volumes Docker" -ForegroundColor Green
    Write-Host "  logs      Affiche les logs de tous les services" -ForegroundColor Green
    Write-Host "  status    Affiche le statut des services" -ForegroundColor Green
    Write-Host "  help      Affiche cette aide" -ForegroundColor Green
    Write-Host ""
    Write-Host "Exemples:"
    Write-Host "  .\sp.ps1           # Démarre tout le projet"
    Write-Host "  .\sp.ps1 web       # Démarre seulement le client web"
    Write-Host "  .\sp.ps1 stop      # Arrête tous les services"
}

# Fonction pour vérifier si Docker est en cours d'exécution
function Test-Docker {
    try {
        docker info > $null 2>&1
        return $true
    }
    catch {
        Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
        exit 1
    }
}

# Fonction pour démarrer tout le projet
function Start-Full {
    Write-Host "🚀 Démarrage complet du projet SupChat..." -ForegroundColor Blue
    Test-Docker
    
    Write-Host "📦 Construction et démarrage de tous les services..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host ""
    Write-Host "✅ Projet démarré avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Services disponibles:" -ForegroundColor Blue
    Write-Host "  • Application web: " -NoNewline; Write-Host "http://localhost" -ForegroundColor Green
    Write-Host "  • API Backend: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Green
    Write-Host "  • Base de données: " -NoNewline; Write-Host "mongodb://localhost:27017" -ForegroundColor Green
    Write-Host "  • Monitoring: " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Utilisez '.\sp.ps1 logs' pour voir les logs en temps réel" -ForegroundColor Yellow
}

# Fonction pour démarrer seulement la DB
function Start-Database {
    Write-Host "🗄️  Démarrage de la base de données MongoDB..." -ForegroundColor Blue
    Test-Docker
    docker-compose up -d db
    Write-Host "✅ Base de données démarrée !" -ForegroundColor Green
    Write-Host "  • MongoDB: " -NoNewline; Write-Host "mongodb://localhost:27017" -ForegroundColor Green
}

# Fonction pour démarrer le backend en mode dev
function Start-Backend {
    Write-Host "⚙️  Démarrage du backend en mode développement..." -ForegroundColor Blue
    
    # Vérifier si la DB est en cours d'exécution
    $dbStatus = docker-compose ps db
    if ($dbStatus -notmatch "Up") {
        Write-Host "📦 Démarrage de la base de données..." -ForegroundColor Yellow
        docker-compose up -d db
        Write-Host "⏳ Attente du démarrage de MongoDB..." -ForegroundColor Yellow
        Start-Sleep 5
    }
    
    Write-Host "🔧 Démarrage du serveur backend..." -ForegroundColor Yellow
    Set-Location supchat-server
    npm start
}

# Fonction pour démarrer le client web en mode dev
function Start-Web {
    Write-Host "🌐 Démarrage du client web en mode développement..." -ForegroundColor Blue
    Set-Location client-web
    npm run dev
}

# Fonction pour démarrer le client mobile en mode dev
function Start-Mobile {
    Write-Host "📱 Démarrage du client mobile en mode développement..." -ForegroundColor Blue
    Set-Location client-mobile
    npm start
}

# Fonction pour arrêter tous les services
function Stop-Services {
    Write-Host "🛑 Arrêt de tous les services..." -ForegroundColor Yellow
    Test-Docker
    docker-compose stop
    Write-Host "✅ Tous les services ont été arrêtés" -ForegroundColor Green
}

# Fonction pour nettoyer complètement
function Clean-All {
    Write-Host "🧹 Nettoyage complet des conteneurs et volumes..." -ForegroundColor Yellow
    Test-Docker
    docker-compose down -v --remove-orphans
    docker system prune -f
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
}

# Fonction pour afficher les logs
function Show-Logs {
    Write-Host "📋 Affichage des logs en temps réel..." -ForegroundColor Blue
    Write-Host "Appuyez sur Ctrl+C pour arrêter l'affichage" -ForegroundColor Yellow
    Test-Docker
    docker-compose logs -f
}

# Fonction pour afficher le statut
function Show-Status {
    Write-Host "📊 Statut des services:" -ForegroundColor Blue
    Test-Docker
    docker-compose ps
    Write-Host ""
    Write-Host "💾 Utilisation des ressources:" -ForegroundColor Blue
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Script principal
switch ($Action.ToLower()) {
    "full" { Start-Full }
    "" { Start-Full }
    "db" { Start-Database }
    "backend" { Start-Backend }
    "api" { Start-Backend }
    "web" { Start-Web }
    "frontend" { Start-Web }
    "mobile" { Start-Mobile }
    "stop" { Stop-Services }
    "clean" { Clean-All }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "help" { Show-Help }
    "-h" { Show-Help }
    "--help" { Show-Help }
    default {
        Write-Host "❌ Option inconnue: $Action" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
