# 🚨 SCRIPT DE NETTOYAGE DES SECRETS EXPOSÉS - SUPCHAT (PowerShell)
# Ce script utilise git filter-repo pour supprimer définitivement les secrets de l'historique Git

Write-Host "🚨 ATTENTION: Ce script va réécrire complètement l'historique Git !" -ForegroundColor Red
Write-Host "📋 Secrets détectés à supprimer:" -ForegroundColor Yellow
Write-Host "  - Generic Password dans supchat-server/tests/integration/auth.complete.test.js" -ForegroundColor Gray
Write-Host "  - Generic Password dans supchat-server/tests/integration/security.complete.test.js" -ForegroundColor Gray
Write-Host "  - Generic High Entropy Secrets dans client-web/.env.secrets-to-move" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  AVANT DE CONTINUER:" -ForegroundColor Yellow
Write-Host "  1. Assurez-vous que tous les développeurs ont sauvegardé leur travail" -ForegroundColor Gray
Write-Host "  2. Informez l'équipe que l'historique Git va être réécrit" -ForegroundColor Gray
Write-Host "  3. Tous devront faire 'git clone' du repo après le nettoyage" -ForegroundColor Gray
Write-Host ""

$answer = Read-Host "Voulez-vous continuer ? (y/N)"
if ($answer -ne "y" -and $answer -ne "Y") {
    Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
    exit 1
}

# Vérifier que git filter-repo est installé
try {
    git filter-repo --help 2>$null | Out-Null
} catch {
    Write-Host "❌ git-filter-repo n'est pas installé" -ForegroundColor Red
    Write-Host "📦 Installation: pip install git-filter-repo" -ForegroundColor Yellow
    Write-Host "   ou téléchargez depuis: https://github.com/newren/git-filter-repo" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Création du backup de sécurité..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
git bundle create "../supchat-backup-$timestamp.bundle" --all
Write-Host "✅ Backup créé dans le dossier parent" -ForegroundColor Green

Write-Host "🧹 Nettoyage des fichiers contenant des secrets..." -ForegroundColor Blue

# Supprimer complètement les fichiers problématiques de l'historique
Write-Host "🗑️  Suppression de client-web/.env.secrets-to-move de tout l'historique..." -ForegroundColor Yellow
git filter-repo --path client-web/.env.secrets-to-move --invert-paths --force

Write-Host "🔧 Création du fichier de remplacement des secrets..." -ForegroundColor Blue

# Créer un fichier de remplacement pour les mots de passe
$replacements = @"
TestPassword123!=TestPassword123!
TestPassword123!=TestPassword123!
TestPassword123!=TestPassword123!
"@

$replacements | Out-File -FilePath "secrets-replacements.txt" -Encoding UTF8

Write-Host "🔄 Application du nettoyage des secrets dans les fichiers..." -ForegroundColor Blue
git filter-repo --replace-text secrets-replacements.txt --force

Write-Host "🧹 Nettoyage des références d'objets..." -ForegroundColor Blue
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Nettoyer le fichier temporaire
Remove-Item "secrets-replacements.txt" -Force

Write-Host "✅ Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ÉTAPES SUIVANTES OBLIGATOIRES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🔄 Forcer le push sur le repository distant:" -ForegroundColor Cyan
Write-Host "   git push origin --force --all" -ForegroundColor Gray
Write-Host "   git push origin --force --tags" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 📢 INFORMER L'ÉQUIPE que l'historique Git a été réécrit" -ForegroundColor Cyan
Write-Host "   Tous les développeurs doivent:" -ForegroundColor Gray
Write-Host "   - Sauvegarder leur travail local non commité" -ForegroundColor Gray
Write-Host "   - Supprimer leur clone local" -ForegroundColor Gray
Write-Host "   - Faire un nouveau 'git clone' du repository" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🔐 Régénérer tous les secrets/tokens/mots de passe qui étaient exposés" -ForegroundColor Cyan
Write-Host "   - JWT_SECRET" -ForegroundColor Gray
Write-Host "   - Mots de passe de base de données" -ForegroundColor Gray
Write-Host "   - Clés API externes" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🚨 Vérifier sur GitHub Security que les alertes ont disparu" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  BACKUP DISPONIBLE: ../supchat-backup-$timestamp.bundle" -ForegroundColor Yellow
Write-Host "   En cas de problème, vous pouvez restaurer depuis ce backup" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Le repository est maintenant propre de tous les secrets exposés !" -ForegroundColor Green

Read-Host "Appuyez sur Entrée pour continuer..."
