@echo off
REM Script de Nettoyage Intelligent des Tests (Windows)

echo 🧹 Nettoyage Intelligent des Tests SupChat
echo ==========================================
echo.

cd /d "%~dp0\.."

echo 📊 ANALYSE DES TESTS ACTUELS :
echo.

echo Tests EXISTANTS (basiques) :
if exist "tests\user.test.js" echo   ✅ tests\user.test.js (basique)
if exist "tests\workspace.test.js" echo   ✅ tests\workspace.test.js (basique)
if exist "tests\channel.test.js" echo   ✅ tests\channel.test.js (basique)
if exist "tests\message.test.js" echo   ✅ tests\message.test.js (basique)
if exist "tests\routes\auth.test.js" echo   ✅ tests\routes\auth.test.js (basique)

echo.
echo Tests SPÉCIALISÉS (à garder) :
if exist "tests\security" echo   ✅ tests\security\ (CORS, permissions, rate limit)
if exist "tests\sockets" echo   ✅ tests\sockets\ (WebSocket)
if exist "tests\channel.permissions.test.js" echo   ✅ tests\channel.permissions.test.js

echo.
echo Tests INTÉGRATION (nouveaux complets) :
if exist "tests\integration" echo   ✅ tests\integration\ (9 suites complètes)

echo.
echo 🎯 STRATÉGIES DE NETTOYAGE DISPONIBLES :
echo.
echo 1) 🧹 NETTOYAGE COMPLET (Recommandé)
echo    → Supprime les tests basiques redondants
echo    → Garde les tests spécialisés + intégration
echo    → Structure propre et optimisée
echo.
echo 2) 🤝 COEXISTENCE
echo    → Garde tout
echo    → Organise juste la structure
echo    → Plus de tests mais potentiels doublons
echo.
echo 3) 🔍 ANALYSE SEULEMENT
echo    → Montre ce qui sera fait
echo    → Aucune suppression
echo.
echo 4) ❌ ANNULER
echo    → Rien ne change
echo.

set /p choice="Choisissez votre stratégie (1-4) : "

if "%choice%"=="1" (
    echo.
    echo 🧹 NETTOYAGE COMPLET SÉLECTIONNÉ
    echo.
    echo Fichiers qui seront SUPPRIMÉS :
    
    if exist "tests\user.test.js" echo   ❌ tests\user.test.js
    if exist "tests\workspace.test.js" echo   ❌ tests\workspace.test.js
    if exist "tests\channel.test.js" echo   ❌ tests\channel.test.js
    if exist "tests\message.test.js" echo   ❌ tests\message.test.js
    if exist "tests\routes\auth.test.js" echo   ❌ tests\routes\auth.test.js
    
    echo.
    echo Fichiers qui seront GARDÉS :
    echo   ✅ tests\security\ (tous les fichiers)
    echo   ✅ tests\sockets\ (tous les fichiers)
    echo   ✅ tests\integration\ (tous les fichiers)
    echo   ✅ tests\channel.permissions.test.js
    
    echo.
    set /p confirm="Confirmer la suppression ? (y/N) : "
    
    if /i "%confirm%"=="y" (
        echo.
        echo 🗑️  Suppression en cours...
        
        if exist "tests\user.test.js" (
            del "tests\user.test.js"
            echo   🗑️  Supprimé: tests\user.test.js
        )
        if exist "tests\workspace.test.js" (
            del "tests\workspace.test.js" 
            echo   🗑️  Supprimé: tests\workspace.test.js
        )
        if exist "tests\channel.test.js" (
            del "tests\channel.test.js"
            echo   🗑️  Supprimé: tests\channel.test.js
        )
        if exist "tests\message.test.js" (
            del "tests\message.test.js"
            echo   🗑️  Supprimé: tests\message.test.js
        )
        if exist "tests\routes\auth.test.js" (
            del "tests\routes\auth.test.js"
            echo   🗑️  Supprimé: tests\routes\auth.test.js
        )
        
        echo.
        echo ✅ Nettoyage terminé !
        echo.
        echo 📊 STRUCTURE FINALE :
        echo tests/
        echo ├── integration/          ← Tests complets (9 suites)
        echo ├── security/            ← Tests sécurité spécialisés
        echo ├── sockets/             ← Tests WebSocket
        echo ├── channel.permissions.test.js
        echo └── routes/              ← Tests routes spécifiques
        
    ) else (
        echo ❌ Annulé
    )
    
) else if "%choice%"=="2" (
    echo.
    echo 🤝 COEXISTENCE SÉLECTIONNÉE
    echo.
    echo Aucun fichier ne sera supprimé.
    echo Tous vos tests coexisteront.
    echo.
    echo 📊 STRUCTURE ACTUELLE MAINTENUE :
    echo tests/
    echo ├── integration/          ← Tests complets (nouveaux)
    echo ├── routes/              ← Tests routes (existants)
    echo ├── security/            ← Tests sécurité (existants)
    echo ├── sockets/             ← Tests WebSocket (existants)
    echo ├── *.test.js            ← Tests unitaires (existants)
    echo └── ...
    echo.
    echo ⚠️  Note: Risque de doublons et de tests qui échouent
    
) else if "%choice%"=="3" (
    echo.
    echo 🔍 ANALYSE DÉTAILLÉE
    echo.
    echo TESTS REDONDANTS identifiés :
    echo.
    
    if exist "tests\user.test.js" if exist "tests\integration\auth.complete.test.js" (
        echo   ⚠️  tests\user.test.js VS tests\integration\auth.complete.test.js
    )
    
    if exist "tests\workspace.test.js" if exist "tests\integration\workspaces.complete.test.js" (
        echo   ⚠️  tests\workspace.test.js VS tests\integration\workspaces.complete.test.js
    )
    
    if exist "tests\routes\auth.test.js" if exist "tests\integration\auth.complete.test.js" (
        echo   ⚠️  tests\routes\auth.test.js VS tests\integration\auth.complete.test.js
    )
    
    echo.
    echo TESTS COMPLÉMENTAIRES (pas de conflit) :
    echo   ✅ tests\security\ + tests\integration\security.complete.test.js
    echo   ✅ tests\sockets\ + tests\integration\websockets.complete.test.js
    echo.
    echo RECOMMANDATION :
    echo   → Relancez le script avec l'option 1 pour nettoyer
    
) else if "%choice%"=="4" (
    echo.
    echo ❌ Annulé - Aucun changement
    
) else (
    echo.
    echo ❌ Option invalide
)

echo.
echo 📝 Pour plus d'informations, consultez :
echo    📄 TESTS-COMPARISON.md
echo    📄 CLEANUP-GUIDE.md

pause
