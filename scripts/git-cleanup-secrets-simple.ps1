# 🚨 SOLUTION IMMÉDIATE - NETTOYAGE DES SECRETS EXPOSÉS
# Script de nettoyage rapide et sûr pour supprimer les secrets de l'historique Git

Write-Host "🚨 NETTOYAGE DES SECRETS EXPOSÉS - SUPCHAT" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

# Étape 1: Backup de sécurité
Write-Host "📦 Étape 1: Création du backup de sécurité..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
git bundle create "../supchat-backup-$timestamp.bundle" --all
Write-Host "✅ Backup créé: ../supchat-backup-$timestamp.bundle" -ForegroundColor Green
Write-Host ""

# Étape 2: Identifier les commits problématiques
Write-Host "🔍 Étape 2: Identification des commits contenant des secrets..." -ForegroundColor Blue
Write-Host "Commits à nettoyer:" -ForegroundColor Yellow

# Les commits identifiés dans l'alerte GitHub
$problematicCommits = @(
    "6a9c8ab",  # feat: Implémentation complète de la stratégie de tests d'intégration
    "ca66ab7"   # chore: ignore removed secret file
)

foreach ($commit in $problematicCommits) {
    Write-Host "  - $commit" -ForegroundColor Gray
    git log --oneline -1 $commit
}
Write-Host ""

# Étape 3: Solution BFG (alternative plus simple que git filter-repo)
Write-Host "🛠️  Étape 3: Nettoyage avec BFG Repo-Cleaner..." -ForegroundColor Blue
Write-Host ""
Write-Host "📋 MÉTHODE RECOMMANDÉE - Utilisation de BFG:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Téléchargez BFG Repo-Cleaner:" -ForegroundColor White
Write-Host "   https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Créez un fichier 'passwords.txt' avec:" -ForegroundColor White
Write-Host "   TestPassword123!" -ForegroundColor Gray
Write-Host "   TestPassword123!" -ForegroundColor Gray
Write-Host "   TestPassword123!" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Exécutez:" -ForegroundColor White
Write-Host "   java -jar bfg-1.14.0.jar --replace-text passwords.txt" -ForegroundColor Gray
Write-Host ""

# Créer le fichier passwords.txt
$passwords = @"
TestPassword123!
TestPassword123!
TestPassword123!
"@

$passwords | Out-File -FilePath "passwords.txt" -Encoding UTF8
Write-Host "File passwords.txt created" -ForegroundColor Green

Write-Host ""
Write-Host "📋 ALTERNATIVE MANUELLE - Force push sur une nouvelle branche:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si BFG ne fonctionne pas, voici la solution manuelle:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Créer une nouvelle branche propre:" -ForegroundColor White
Write-Host "   git checkout --orphan clean-main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Nettoyer les fichiers problématiques:" -ForegroundColor White
Write-Host "   # Éditer manuellement les fichiers de tests pour remplacer les mots de passe" -ForegroundColor Gray
Write-Host "   # Supprimer le fichier client-web/.env.secrets-to-move s'il existe" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ajouter tous les fichiers:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host ""
Write-Host "4. Faire un commit initial:" -ForegroundColor White
Write-Host "   git commit -m 'Initial clean commit - secrets removed'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Forcer le push sur main:" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -f origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  IMPORTANT APRÈS LE NETTOYAGE:" -ForegroundColor Red
Write-Host ""
Write-Host "1. 📢 Informer TOUTE L'ÉQUIPE" -ForegroundColor Yellow
Write-Host "2. 🔄 Tous doivent faire 'git clone' à nouveau" -ForegroundColor Yellow
Write-Host "3. 🔐 Régénérer TOUS les secrets/tokens:" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET" -ForegroundColor Gray
Write-Host "   - Mots de passe DB" -ForegroundColor Gray
Write-Host "   - Clés API" -ForegroundColor Gray
Write-Host "4. 🚨 Vérifier GitHub Security dans 24h" -ForegroundColor Yellow
Write-Host ""

# Afficher le statut Git actuel
Write-Host "📊 Statut Git actuel:" -ForegroundColor Blue
git status --short
Write-Host ""
git log --oneline -5

Write-Host ""
Write-Host "🎯 Backup sauvegardé en sécurité !" -ForegroundColor Green
Write-Host "💾 Localisation: ../supchat-backup-$timestamp.bundle" -ForegroundColor Gray

Read-Host "Press Enter to continue..."
