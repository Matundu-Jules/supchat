@echo off
REM Script batch pour lancer l'ouverture des logs VS Code
REM SUPCHAT - Logs en temps réel

echo 🚀 SUPCHAT - Ouverture des logs VS Code
echo =====================================

if "%1"=="" (
    echo Usage: open-logs.bat [dev^|prod^|test]
    echo.
    echo Exemples:
    echo   open-logs.bat dev     - Logs développement
    echo   open-logs.bat prod    - Logs production  
    echo   open-logs.bat test    - Logs test
    echo.
    set /p choice="Quel environnement ? (dev/prod/test): "
    if "!choice!"=="" set choice=dev
) else (
    set choice=%1
)

echo.
echo 🖥️ Ouverture des terminaux pour l'environnement: %choice%

powershell -ExecutionPolicy Bypass -File "open-logs-vscode.ps1" -Environment %choice%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erreur lors de l'exécution du script PowerShell
    echo 💡 Assurez-vous que:
    echo    - PowerShell est disponible
    echo    - VS Code est installé et dans le PATH
    echo    - Les services Docker sont démarrés
    pause
)
