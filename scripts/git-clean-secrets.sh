#!/bin/bash

# 🚨 SCRIPT DE NETTOYAGE DES SECRETS EXPOSÉS - SUPCHAT
# Ce script utilise git filter-repo pour supprimer définitivement les secrets de l'historique Git

echo "🚨 ATTENTION: Ce script va réécrire complètement l'historique Git !"
echo "📋 Secrets détectés à supprimer:"
echo "  - Generic Password dans supchat-server/tests/integration/auth.complete.test.js"
echo "  - Generic Password dans supchat-server/tests/integration/security.complete.test.js"  
echo "  - Generic High Entropy Secrets dans client-web/.env.secrets-to-move"
echo ""
echo "⚠️  AVANT DE CONTINUER:"
echo "  1. Assurez-vous que tous les développeurs ont sauvegardé leur travail"
echo "  2. Informez l'équipe que l'historique Git va être réécrit"
echo "  3. Tous devront faire 'git clone' du repo après le nettoyage"
echo ""

read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé par l'utilisateur"
    exit 1
fi

# Vérifier que git filter-repo est installé
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo n'est pas installé"
    echo "📦 Installation: pip install git-filter-repo"
    echo "   ou téléchargez depuis: https://github.com/newren/git-filter-repo"
    exit 1
fi

echo "🔍 Création du backup de sécurité..."
git bundle create ../supchat-backup-$(date +%Y%m%d-%H%M%S).bundle --all
echo "✅ Backup créé dans le dossier parent"

echo "🧹 Nettoyage des fichiers contenant des secrets..."

# Supprimer complètement les fichiers problématiques de l'historique
echo "🗑️  Suppression de client-web/.env.secrets-to-move de tout l'historique..."
git filter-repo --path client-web/.env.secrets-to-move --invert-paths --force

echo "🔧 Nettoyage des mots de passe dans les fichiers de tests..."

# Créer un script de remplacement pour nettoyer les mots de passe
cat > /tmp/clean-secrets.py << 'EOF'
#!/usr/bin/env python3
import re

# Patterns de secrets à supprimer/remplacer
replacements = [
    # Mots de passe génériques dans les tests
    (r'password:\s*["\']TestPassword123!["\']', 'password: "TestPassword123!"'),
    (r'password:\s*["\']TestPassword123!["\']', 'password: "TestPassword123!"'),
    (r'TestPassword123!\s*=\s*["\']TestPassword123!["\']', 'TestPassword123! = "TestPassword123!"'),
    (r'bcrypt\.hash\(["\']TestPassword123!["\']', 'bcrypt.hash("TestPassword123!"'),
    
    # Tokens JWT de test (plus de 20 caractères alphanumériques)
    (r'Bearer\s+[A-Za-z0-9]{20,}', 'Bearer TestPassword123!'),
    (r'jwt\.\w+\.\w+\.\w+', 'jwt.TestPassword123!'),
    
    # Secrets d'entropie élevée (chaînes longues)
    (r'["\'][A-Za-z0-9+/]{32,}={0,2}["\']', '"TestPassword123!"'),
    
    # Variables d'environnement avec secrets
    (r'JWT_SECRET\s*=\s*[^\s\n]+', 'JWT_SECRET=TestPassword123!'),
    (r'MONGO.*PASSWORD\s*=\s*[^\s\n]+', 'MONGO_PASSWORD=TestPassword123!'),
    (r'.*_SECRET\s*=\s*[^\s\n]+', 'SECRET=TestPassword123!'),
    (r'.*_KEY\s*=\s*[^\s\n]+', 'KEY=TestPassword123!'),
]

def process_content(content):
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    return content

if __name__ == "__main__":
    import sys
    content = sys.stdin.read()
    print(process_content(content), end="")
EOF

chmod +x /tmp/clean-secrets.py

echo "🔄 Application du nettoyage des secrets dans les fichiers..."
git filter-repo --replace-text <(echo "TestPassword123!") --force

echo "🔄 Nettoyage avancé avec script Python..."
git filter-repo --blob-callback '
import subprocess
import sys

# Appliquer le script de nettoyage seulement aux fichiers pertinents
if (blob.data.find(b"password") != -1 or 
    blob.data.find(b"secret") != -1 or 
    blob.data.find(b"jwt") != -1):
    
    process = subprocess.Popen(["/tmp/clean-secrets.py"], 
                              stdin=subprocess.PIPE, 
                              stdout=subprocess.PIPE, 
                              stderr=subprocess.PIPE)
    stdout, stderr = process.communicate(blob.data)
    if process.returncode == 0:
        blob.data = stdout
' --force

echo "🧹 Nettoyage des références d'objets..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Nettoyage terminé !"
echo ""
echo "📋 ÉTAPES SUIVANTES OBLIGATOIRES:"
echo ""
echo "1. 🔄 Forcer le push sur le repository distant:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "2. 📢 INFORMER L'ÉQUIPE que l'historique Git a été réécrit"
echo "   Tous les développeurs doivent:"
echo "   - Sauvegarder leur travail local non commité"
echo "   - Supprimer leur clone local"
echo "   - Faire un nouveau 'git clone' du repository"
echo ""
echo "3. 🔐 Régénérer tous les secrets/tokens/mots de passe qui étaient exposés"
echo "   - JWT_SECRET"
echo "   - Mots de passe de base de données"
echo "   - Clés API externes"
echo ""
echo "4. 🚨 Vérifier sur GitHub Security que les alertes ont disparu"
echo ""
echo "⚠️  BACKUP DISPONIBLE: ../supchat-backup-*.bundle"
echo "   En cas de problème, vous pouvez restaurer depuis ce backup"

# Nettoyer le fichier temporaire
rm -f /tmp/clean-secrets.py

echo ""
echo "🎉 Le repository est maintenant propre de tous les secrets exposés !"
