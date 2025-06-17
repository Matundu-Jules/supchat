@echo off
REM Script de lancement pour SUPCHAT Docker Manager
REM Ce script contourne les restrictions PowerShell

echo ========================================
echo    SUPCHAT Docker Manager Launcher
echo ========================================
echo.

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Docker Desktop et redemarrer
    pause
    exit /b 1
)

REM Vérifier si Docker Compose est installé
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker Compose n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Docker Compose et redemarrer
    pause
    exit /b 1
)

REM Vérifier si le fichier docker-compose.yml existe
if not exist "docker-compose.yml" (
    echo ERREUR: Fichier docker-compose.yml non trouve
    echo Assurez-vous d'etre dans le repertoire racine du projet SUPCHAT
    pause
    exit /b 1
)

echo Docker et Docker Compose detectes avec succes !
echo.
echo Choisissez votre methode de lancement :
echo   1) PowerShell (recommande)
echo   2) Menu simple DOS
echo.
set /p choice="Votre choix (1-2): "

if "%choice%"=="1" goto powershell
if "%choice%"=="2" goto dos
echo Choix invalide
pause
exit /b 1

:powershell
echo.
echo Lancement du gestionnaire PowerShell...
powershell -ExecutionPolicy Bypass -File "docker-manager.ps1"
goto end

:dos
echo.
echo ========================================
echo     SUPCHAT Docker Manager - DOS
echo ========================================
echo.
echo ENVIRONNEMENTS PRINCIPAUX:
echo   1) Lancer TOUT en DEVELOPPEMENT
echo   2) Lancer TOUT en PRODUCTION
echo   3) Arreter TOUS les services
echo   4) Voir l'etat des containers
echo   5) Voir les logs de l'API
echo   6) Voir les logs du Web
echo   7) Ouvrir http://localhost:80
echo   8) Nettoyage (ATTENTION: supprime volumes/données)
echo   0) Quitter
echo.
set /p dos_choice="Votre choix: "

if "%dos_choice%"=="1" goto dev
if "%dos_choice%"=="2" goto prod
if "%dos_choice%"=="3" goto stop
if "%dos_choice%"=="4" goto status
if "%dos_choice%"=="5" goto logs_api
if "%dos_choice%"=="6" goto logs_web
if "%dos_choice%"=="7" goto open_url
if "%dos_choice%"=="8" goto cleanup
if "%dos_choice%"=="0" goto end
echo Choix invalide
pause
goto dos

:dev
echo.
echo Demarrage en mode DEVELOPPEMENT...
docker-compose build --no-cache
docker-compose up -d
echo.
echo Environnement de developpement demarre !
echo URLs disponibles:
echo   - Web: http://localhost:80
echo   - API: http://localhost:3000
echo   - API Health: http://localhost:3000/api/health
echo   - cAdvisor: http://localhost:8080
pause
goto dos

:prod
echo.
echo Demarrage en mode PRODUCTION...
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
echo.
echo Environnement de production demarre !
echo URLs disponibles:
echo   - Web: http://localhost:80
echo   - API: http://localhost:3000
echo   - API Health: http://localhost:3000/api/health
echo   - cAdvisor: http://localhost:8080
pause
goto dos

:stop
echo.
echo Arret de tous les services...
docker-compose down
docker-compose -f docker-compose.prod.yml down
echo Tous les services arretes !
pause
goto dos

:status
echo.
echo Etat des containers:
docker-compose ps
pause
goto dos

:logs_api
echo.
echo Logs de l'API (dernières 50 lignes):
docker-compose logs --tail=50 api
pause
goto dos

:logs_web
echo.
echo Logs du Web (dernières 50 lignes):
docker-compose logs --tail=50 web
pause
goto dos

:open_url
echo.
echo Ouverture de http://localhost:80...
start http://localhost:80
goto dos

:cleanup
echo.
echo ATTENTION: Cela va supprimer tous les containers, images ET VOLUMES !
echo Cela inclut la base de données MongoDB et tous les fichiers stockés !
echo.
echo Choisissez le type de nettoyage:
echo   1) SOFT - Garde les volumes (préserve les données)
echo   2) COMPLET - Supprime TOUT (perte de données)
set /p cleanup_type="Votre choix (1-2): "

if "%cleanup_type%"=="1" (
    echo.
    echo Nettoyage SOFT - Les données seront préservées
    set /p confirm="Confirmer ? (y/N): "
    if /i "%confirm%"=="y" (
        echo Nettoyage SOFT en cours...
        docker-compose down
        docker-compose -f docker-compose.prod.yml down
        docker system prune -f
        echo Nettoyage SOFT terminé ! Données préservées.
    ) else (
        echo Nettoyage annulé
    )
) else if "%cleanup_type%"=="2" (
    echo.
    echo NETTOYAGE COMPLET - TOUTES LES DONNÉES SERONT PERDUES !
    echo Conseil: Faites un backup avant (option 14 du menu PowerShell)
    set /p confirm="Tapez DELETE pour confirmer: "
    if "%confirm%"=="DELETE" (
        echo Nettoyage COMPLET en cours...
        docker-compose down -v
        docker-compose -f docker-compose.prod.yml down -v
        docker system prune -f
        echo Nettoyage COMPLET terminé ! Toutes les données supprimées.
    ) else (
        echo Nettoyage COMPLET annulé (bonne décision !)
    )
) else (
    echo Choix invalide
)
pause
goto dos

:end
echo.
echo Au revoir !
pause
