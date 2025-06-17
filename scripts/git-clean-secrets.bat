@echo off
REM 🚨 SCRIPT DE NETTOYAGE DES SECRETS EXPOSÉS - SUPCHAT (Windows)
REM Ce script utilise git filter-repo pour supprimer définitivement les secrets de l'historique Git

echo 🚨 ATTENTION: Ce script va réécrire complètement l'historique Git !
echo 📋 Secrets détectés à supprimer:
echo   - Generic Password dans supchat-server/tests/integration/auth.complete.test.js
echo   - Generic Password dans supchat-server/tests/integration/security.complete.test.js  
echo   - Generic High Entropy Secrets dans client-web/.env.secrets-to-move
echo.
echo ⚠️  AVANT DE CONTINUER:
echo   1. Assurez-vous que tous les développeurs ont sauvegardé leur travail
echo   2. Informez l'équipe que l'historique Git va être réécrit
echo   3. Tous devront faire 'git clone' du repo après le nettoyage
echo.

set /p "answer=Voulez-vous continuer ? (y/N): "
if /i not "%answer%"=="y" (
    echo ❌ Annulé par l'utilisateur
    exit /b 1
)

REM Vérifier que git filter-repo est installé
git filter-repo --help >nul 2>&1
if errorlevel 1 (
    echo ❌ git-filter-repo n'est pas installé
    echo 📦 Installation: pip install git-filter-repo
    echo    ou téléchargez depuis: https://github.com/newren/git-filter-repo
    exit /b 1
)

echo 🔍 Création du backup de sécurité...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

git bundle create ../supchat-backup-%timestamp%.bundle --all
echo ✅ Backup créé dans le dossier parent

echo 🧹 Nettoyage des fichiers contenant des secrets...

REM Supprimer complètement les fichiers problématiques de l'historique
echo 🗑️  Suppression de client-web/.env.secrets-to-move de tout l'historique...
git filter-repo --path client-web/.env.secrets-to-move --invert-paths --force

echo 🔧 Création du fichier de remplacement des secrets...

REM Créer un fichier de remplacement pour les mots de passe
echo TestPassword123!=TestPassword123! > secrets-replacements.txt
echo TestPassword123!=TestPassword123! >> secrets-replacements.txt
echo TestPassword123!=TestPassword123! >> secrets-replacements.txt

echo 🔄 Application du nettoyage des secrets dans les fichiers...
git filter-repo --replace-text secrets-replacements.txt --force

echo 🧹 Nettoyage des références d'objets...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

REM Nettoyer le fichier temporaire
del secrets-replacements.txt

echo ✅ Nettoyage terminé !
echo.
echo 📋 ÉTAPES SUIVANTES OBLIGATOIRES:
echo.
echo 1. 🔄 Forcer le push sur le repository distant:
echo    git push origin --force --all
echo    git push origin --force --tags
echo.
echo 2. 📢 INFORMER L'ÉQUIPE que l'historique Git a été réécrit
echo    Tous les développeurs doivent:
echo    - Sauvegarder leur travail local non commité
echo    - Supprimer leur clone local
echo    - Faire un nouveau 'git clone' du repository
echo.
echo 3. 🔐 Régénérer tous les secrets/tokens/mots de passe qui étaient exposés
echo    - JWT_SECRET
echo    - Mots de passe de base de données
echo    - Clés API externes
echo.
echo 4. 🚨 Vérifier sur GitHub Security que les alertes ont disparu
echo.
echo ⚠️  BACKUP DISPONIBLE: ../supchat-backup-%timestamp%.bundle
echo    En cas de problème, vous pouvez restaurer depuis ce backup
echo.
echo 🎉 Le repository est maintenant propre de tous les secrets exposés !

pause
