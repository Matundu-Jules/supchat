# Script PowerShell pour ouvrir les terminaux de logs dans VS Code
# SUPCHAT - Ouverture automatique des logs en temps réel

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod", "test")]
    [string]$Environment = "dev"
)

Write-Host "🚀 SUPCHAT - Ouverture des terminaux de logs VS Code" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan

function Open-VSCodeTerminal {
    param(
        [string]$ServiceName,
        [string]$Command,
        [string]$Title
    )
    
    Write-Host "🖥️ Ouverture terminal pour: $Title" -ForegroundColor Yellow
    
    # Créer un script temporaire
    $tempPath = "$env:TEMP\supchat_logs_$ServiceName.ps1"
    
    $scriptContent = @"
Write-Host "🚀 SUPCHAT - $Title" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Blue
Write-Host "Logs en temps réel - Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""
Set-Location "$(Get-Location)"
Invoke-Expression "$Command"
"@
    
    Set-Content -Path $tempPath -Value $scriptContent
    
    # Lancer VS Code avec un nouveau terminal
    try {
        & code --new-window $tempPath
        Start-Sleep 1
        & code --command "workbench.action.terminal.new"
        Start-Sleep 1
        & code --command "workbench.action.terminal.sendSequence" --args "powershell -ExecutionPolicy Bypass -File `"$tempPath`"`r"
    }
    catch {
        Write-Host "❌ Impossible d'ouvrir VS Code automatiquement" -ForegroundColor Red
        Write-Host "💡 Commande à exécuter manuellement: $Command" -ForegroundColor Cyan
        Write-Host "   Ou ouvrez VS Code et exécutez: powershell -File `"$tempPath`"" -ForegroundColor White
    }
}

function Open-LogsTerminals {
    param([string]$Env)
    
    Write-Host "🖥️ Configuration des terminaux pour l'environnement: $Env" -ForegroundColor Green
    Write-Host "⏳ Attente du démarrage complet des services..." -ForegroundColor Blue
    Start-Sleep 3
    
    switch ($Env) {
        "dev" {
            Open-VSCodeTerminal "api" "docker-compose logs -f api" "API Backend (développement)"
            Start-Sleep 1
            Open-VSCodeTerminal "web" "docker-compose logs -f web" "Web Frontend (développement)"
            Start-Sleep 1
            Open-VSCodeTerminal "db" "docker-compose logs -f db" "MongoDB Database (développement)"
            Start-Sleep 1
            Open-VSCodeTerminal "cadvisor" "docker-compose logs -f cadvisor" "cAdvisor Monitoring (développement)"
            
            # Vérifier si mobile existe
            $mobileRunning = docker-compose ps mobile 2>$null | Select-String "Up"
            if ($mobileRunning) {
                Start-Sleep 1
                Open-VSCodeTerminal "mobile" "docker-compose logs -f mobile" "Mobile App (développement)"
            }
        }
        "prod" {
            Open-VSCodeTerminal "api" "docker-compose -f docker-compose.prod.yml logs -f api" "API Backend (production)"
            Start-Sleep 1
            Open-VSCodeTerminal "web" "docker-compose -f docker-compose.prod.yml logs -f web" "Web Frontend (production)"
            Start-Sleep 1
            Open-VSCodeTerminal "db" "docker-compose -f docker-compose.prod.yml logs -f db" "MongoDB Database (production)"
            Start-Sleep 1
            Open-VSCodeTerminal "cadvisor" "docker-compose -f docker-compose.prod.yml logs -f cadvisor" "cAdvisor Monitoring (production)"
        }
        "test" {
            Open-VSCodeTerminal "api-test" "docker-compose -f docker-compose.test.yml logs -f api" "API Backend (test)"
            Start-Sleep 1
            Open-VSCodeTerminal "db-test" "docker-compose -f docker-compose.test.yml logs -f db-test" "MongoDB Test Database"
        }
    }
    
    Write-Host ""
    Write-Host "✅ Terminaux de logs configurés !" -ForegroundColor Green
    Write-Host "💡 Si les terminaux ne s'ouvrent pas automatiquement, utilisez ces commandes:" -ForegroundColor Cyan
    
    switch ($Env) {
        "dev" {
            Write-Host "   docker-compose logs -f api     (Backend)" -ForegroundColor White
            Write-Host "   docker-compose logs -f web     (Frontend)" -ForegroundColor White
            Write-Host "   docker-compose logs -f db      (Database)" -ForegroundColor White
            Write-Host "   docker-compose logs -f cadvisor (Monitoring)" -ForegroundColor White
        }
        "prod" {
            Write-Host "   docker-compose -f docker-compose.prod.yml logs -f api     (Backend)" -ForegroundColor White
            Write-Host "   docker-compose -f docker-compose.prod.yml logs -f web     (Frontend)" -ForegroundColor White
            Write-Host "   docker-compose -f docker-compose.prod.yml logs -f db      (Database)" -ForegroundColor White
            Write-Host "   docker-compose -f docker-compose.prod.yml logs -f cadvisor (Monitoring)" -ForegroundColor White
        }
        "test" {
            Write-Host "   docker-compose -f docker-compose.test.yml logs -f api     (Backend Test)" -ForegroundColor White
            Write-Host "   docker-compose -f docker-compose.test.yml logs -f db-test (Database Test)" -ForegroundColor White
        }
    }
}

# Vérifier que VS Code est disponible
if (!(Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "❌ VS Code (code) n'est pas disponible dans le PATH" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que VS Code est installé et ajouté au PATH" -ForegroundColor Yellow
    exit 1
}

# Vérifier que Docker Compose est disponible
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas disponible" -ForegroundColor Red
    exit 1
}

# Vérifier l'environnement
switch ($Environment) {
    "dev" {
        $running = docker-compose ps 2>$null | Select-String "Up"
        if (!$running) {
            Write-Host "❌ Aucun service de développement en cours d'exécution" -ForegroundColor Red
            Write-Host "💡 Lancez d'abord: docker-compose up -d" -ForegroundColor Yellow
            exit 1
        }
    }
    "prod" {
        $running = docker-compose -f docker-compose.prod.yml ps 2>$null | Select-String "Up"
        if (!$running) {
            Write-Host "❌ Aucun service de production en cours d'exécution" -ForegroundColor Red
            Write-Host "💡 Lancez d'abord: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Yellow
            exit 1
        }
    }
    "test" {
        $running = docker-compose -f docker-compose.test.yml ps 2>$null | Select-String "Up"
        if (!$running) {
            Write-Host "❌ Aucun service de test en cours d'exécution" -ForegroundColor Red
            Write-Host "💡 Lancez d'abord l'environnement de test" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Lancer l'ouverture des terminaux
Open-LogsTerminals $Environment

Write-Host ""
Write-Host "🎉 Script terminé ! Vérifiez vos terminaux VS Code." -ForegroundColor Green
