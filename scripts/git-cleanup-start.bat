@echo off
echo.
echo ========================================
echo 🚨 NETTOYAGE SECRETS EXPOSES - SUPCHAT
echo ========================================
echo.

REM Étape 1: Backup de sécurité
echo 📦 Création du backup de sécurité...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

git bundle create ../supchat-backup-%timestamp%.bundle --all
echo ✅ Backup créé: ../supchat-backup-%timestamp%.bundle
echo.

REM Étape 2: Identifier les commits problématiques
echo 🔍 Commits contenant des secrets:
echo Commit 6a9c8ab - feat: Implementation complete de la strategie de tests d integration
echo Commit ca66ab7 - chore: ignore removed secret file
echo.

REM Étape 3: Créer le fichier de remplacement des mots de passe
echo 🛠️  Création du fichier passwords.txt...
echo TestPassword123!> passwords.txt
echo TestPassword123!>> passwords.txt
echo TestPassword123!>> passwords.txt
echo ✅ Fichier passwords.txt créé
echo.

echo 📋 SOLUTIONS DISPONIBLES:
echo.
echo OPTION 1 - BFG Repo-Cleaner (RECOMMANDÉ):
echo ------------------------------------------
echo 1. Téléchargez: https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
echo 2. Placez le fichier bfg-1.14.0.jar dans ce dossier
echo 3. Exécutez: java -jar bfg-1.14.0.jar --replace-text passwords.txt
echo 4. Puis: git reflog expire --expire=now --all ^&^& git gc --prune=now --aggressive
echo 5. Enfin: git push --force
echo.

echo OPTION 2 - Nouvelle branche propre (MANUAL):
echo --------------------------------------------
echo 1. git checkout --orphan clean-main
echo 2. Éditez manuellement les fichiers de tests pour remplacer les mots de passe
echo 3. git add .
echo 4. git commit -m "Initial clean commit - secrets removed"
echo 5. git branch -M main
echo 6. git push -f origin main
echo.

echo OPTION 3 - git filter-repo (AVANCÉ):
echo ------------------------------------
echo 1. git filter-repo --replace-text passwords.txt --force
echo 2. git push --force --all
echo.

echo ⚠️  IMPORTANT APRÈS LE NETTOYAGE:
echo ================================
echo 1. 📢 Informer TOUTE L ÉQUIPE
echo 2. 🔄 Tous doivent faire git clone à nouveau
echo 3. 🔐 Régénérer TOUS les secrets/tokens
echo 4. 🚨 Vérifier GitHub Security dans 24h
echo.

echo 📊 Statut Git actuel:
git status --short
echo.
git log --oneline -5
echo.

echo 🎯 Backup sauvegardé: ../supchat-backup-%timestamp%.bundle
echo.

pause
