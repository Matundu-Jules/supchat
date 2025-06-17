# Script PowerShell pour nettoyer les secrets de l'historique Git - SUPCHAT
# ATTENTION: Ce script réécrit l'historique Git

Write-Host "🔒 Nettoyage des secrets dans l'historique Git - SUPCHAT" -ForegroundColor Cyan
Write-Host "⚠️  ATTENTION: L'historique Git va être réécrit !" -ForegroundColor Yellow
Write-Host ""

# Vérifier que git-filter-repo est installé
try {
    git filter-repo --version | Out-Null
} catch {
    Write-Host "❌ git-filter-repo n'est pas installé. Installez-le avec:" -ForegroundColor Red
    Write-Host "pip install git-filter-repo" -ForegroundColor White
    exit 1
}

# Sauvegarde du remote avant nettoyage
$remoteUrl = git remote get-url origin
Write-Host "📝 Remote URL sauvegardée: $remoteUrl" -ForegroundColor Green

# Créer un fichier de remplacement pour les secrets
$secretsReplacement = @"
TestPassword123!
nouvelle_valeur==>nouvelle_valeur

TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!

***REMOVED*** (exemples)
JWT_SECRET=your_jwt_secret_here==>JWT_SECRET=your_jwt_secret_here
MONGO_INITDB_ROOT_PASSWORD=your_password_here==>MONGO_INITDB_ROOT_PASSWORD=your_password_here
GMAIL_PASS=your_gmail_app_password==>GMAIL_PASS=your_gmail_app_password

***REMOVED***
test@example.com==>test@example.com
test@example.com==>test@example.com
"@

$secretsReplacement | Out-File -FilePath "secrets-replacement.txt" -Encoding UTF8
Write-Host "📁 Fichier de remplacement créé: secrets-replacement.txt" -ForegroundColor Green

# Supprimer complètement les fichiers env.secrets-to-move de l'historique
Write-Host "🗑️  Suppression des fichiers env.secrets-to-move..." -ForegroundColor Yellow
git filter-repo --path "web/.env.secrets-to-move" --invert-paths --force
git filter-repo --path "client-web/.env.secrets-to-move" --invert-paths --force

# Remplacer les secrets dans tous les fichiers
Write-Host "🔄 Remplacement des secrets dans l'historique..." -ForegroundColor Yellow
git filter-repo --replace-text secrets-replacement.txt --force

# Re-ajouter le remote
Write-Host "🔗 Restauration du remote origin..." -ForegroundColor Yellow
git remote add origin $remoteUrl

# Nettoyer le fichier temporaire
Remove-Item -Path "secrets-replacement.txt" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Nettoyage terminé !" -ForegroundColor Green
Write-Host "📤 Pour pousser les changements: git push --force-with-lease origin master" -ForegroundColor Cyan
Write-Host "⚠️  Prévenez votre équipe qu'ils doivent faire: git reset --hard origin/master" -ForegroundColor Yellow
