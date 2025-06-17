@echo off
REM Script de Tests d'Intégration Complet SupChat (Windows)
REM Version: 2.0 - Avec corrections appliquées

echo 🚀 SupChat - Suite de Tests d'Intégration Complète
echo ==================================================
echo.

REM Configuration
cd /d "%~dp0\.."
set NODE_ENV=test
set MONGODB_URI_TEST=mongodb://localhost:27017/supchat_test_complete

REM Variables pour le rapport
set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0

REM Vérifications préliminaires
echo 🔧 Vérifications préliminaires...

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm non trouvé
    exit /b 1
)

if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
)

echo ✅ Environnement prêt
echo.

REM Fonction pour exécuter un test
:run_test
set test_file=%1
set test_name=%2

echo 🧪 %test_name%...

if exist "%test_file%" (
    npm test -- "%test_file%" --silent >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set /a PASSED_TESTS+=1
        echo ✅ %test_name% - RÉUSSI
    ) else (
        set /a FAILED_TESTS+=1
        echo ❌ %test_name% - ÉCHOUÉ
        
        echo 🔍 Détails des erreurs:
        npm test -- "%test_file%" --verbose | tail -20
        echo.
    )
    
    set /a TOTAL_TESTS+=1
) else (
    echo ⚠️  %test_name% - Fichier non trouvé: %test_file%
)
goto :eof

echo 🧪 PHASE 1: Tests d'Authentification (Corrigés)
echo ----------------------------------------------
call :run_test "tests/integration/auth.fixed.v2.test.js" "Authentification v2"

echo.
echo 🧪 PHASE 2: Tests de Workspaces
echo -------------------------------
call :run_test "tests/integration/workspaces.fixed.test.js" "Workspaces (Corrigés)"

echo.
echo 🧪 PHASE 3: Tests de Channels
echo -----------------------------
call :run_test "tests/integration/channels.complete.test.js" "Channels"

echo.
echo 🧪 PHASE 4: Tests de Messagerie
echo -------------------------------
call :run_test "tests/integration/messaging.complete.test.js" "Messages"

echo.
echo 🧪 PHASE 5: Tests de Notifications
echo ----------------------------------
call :run_test "tests/integration/notifications.complete.test.js" "Notifications"

echo.
echo 🧪 PHASE 6: Tests de Permissions
echo --------------------------------
call :run_test "tests/integration/permissions.complete.test.js" "Permissions"

echo.
echo 🧪 PHASE 7: Tests d'Intégrations
echo --------------------------------
call :run_test "tests/integration/integrations-search.complete.test.js" "Intégrations & Recherche"

echo.
echo 🧪 PHASE 8: Tests de Sécurité
echo -----------------------------
call :run_test "tests/integration/security.complete.test.js" "Sécurité"

echo.
echo 🧪 PHASE 9: Tests WebSocket
echo ---------------------------
call :run_test "tests/integration/websockets.complete.test.js" "WebSockets"

echo.
echo 📊 RAPPORT FINAL
echo ================
echo Total des tests: %TOTAL_TESTS%
echo Tests réussis: %PASSED_TESTS%
echo Tests échoués: %FAILED_TESTS%

if %TOTAL_TESTS% GTR 0 (
    set /a SUCCESS_RATE=%PASSED_TESTS% * 100 / %TOTAL_TESTS%
    echo Taux de réussite: %SUCCESS_RATE%%%
) else (
    echo Aucun test exécuté
    set SUCCESS_RATE=0
)

echo.
echo 📋 RECOMMANDATIONS
echo ==================

if %SUCCESS_RATE% GEQ 90 (
    echo 🎉 Excellent! Votre API est très robuste.
    echo ✅ Prêt pour la production
    echo ✅ Qualité de code élevée
) else if %SUCCESS_RATE% GEQ 70 (
    echo ⚠️  Bon niveau, mais amélioration possible.
    echo 🔧 Corriger les tests échoués
    echo 📖 Revoir la documentation des erreurs
) else if %SUCCESS_RATE% GEQ 50 (
    echo 🚨 Niveau moyen - Corrections nécessaires.
    echo 🛠️  Revoir l'architecture
    echo 🧪 Améliorer la couverture de tests
) else (
    echo 💥 Niveau critique - Refactoring recommandé.
    echo 🔄 Revoir complètement l'implémentation
    echo 📚 Former l'équipe aux bonnes pratiques
)

echo.
echo 📝 FICHIERS DE RAPPORTS GÉNÉRÉS
echo ===============================
echo 📄 tests/reports/auth-final-report.md
echo 📄 tests/reports/auth-test-analysis.md

echo.
echo 🎯 PROCHAINES ÉTAPES
echo ===================
echo 1. Corriger les tests échoués identifiés
echo 2. Implémenter les routes manquantes
echo 3. Améliorer la validation des données
echo 4. Optimiser les performances WebSocket
echo 5. Renforcer la sécurité globale

echo.
if %FAILED_TESTS% EQU 0 (
    echo 🏆 BRAVO! Tous les tests passent!
    exit /b 0
) else (
    echo 🔧 Des corrections sont nécessaires.
    exit /b 1
)

pause
