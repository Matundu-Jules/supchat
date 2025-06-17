#!/bin/bash

# Script de nettoyage complet des secrets dans l'historique Git
# ATTENTION: Ce script réécrit l'historique Git

echo "🔒 Nettoyage des secrets dans l'historique Git - SUPCHAT"
echo "⚠️  ATTENTION: L'historique Git va être réécrit !"
echo ""

# Sauvegarde du remote avant nettoyage
REMOTE_URL=$(git remote get-url origin)
echo "📝 Remote URL sauvegardée: $REMOTE_URL"

# Créer un fichier de remplacement pour les secrets
cat > secrets-replacement.txt << 'EOF'
TestPassword123!
nouvelle_valeur==>nouvelle_valeur

TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!
TestPassword123!==>TestPassword123!

***REMOVED***
JWT_SECRET=your_jwt_secret_here==>JWT_SECRET=your_jwt_secret_here
MONGO_INITDB_ROOT_PASSWORD=your_password_here==>MONGO_INITDB_ROOT_PASSWORD=your_password_here
GMAIL_PASS=your_gmail_app_password==>GMAIL_PASS=your_gmail_app_password

***REMOVED***
test@example.com==>test@example.com
test@example.com==>test@example.com
EOF

echo "📁 Fichier de remplacement créé: secrets-replacement.txt"

# Supprimer complètement les fichiers env.secrets-to-move de l'historique
echo "🗑️  Suppression des fichiers env.secrets-to-move..."
git filter-repo \
    --path web/.env.secrets-to-move --invert-paths \
    --path client-web/.env.secrets-to-move --invert-paths \
    --force

# Remplacer les secrets dans tous les fichiers
echo "🔄 Remplacement des secrets dans l'historique..."
git filter-repo --replace-text secrets-replacement.txt --force

# Re-ajouter le remote
echo "🔗 Restauration du remote origin..."
git remote add origin "$REMOTE_URL"

# Nettoyer le fichier temporaire
rm -f secrets-replacement.txt

echo ""
echo "✅ Nettoyage terminé !"
echo "📤 Pour pousser les changements: git push --force-with-lease origin master"
echo "⚠️  Prévenez votre équipe qu'ils doivent faire: git reset --hard origin/master"
