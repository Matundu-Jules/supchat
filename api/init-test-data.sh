#!/bin/sh

# Script d'initialisation des données de test
# Ce script attend que l'API soit prête puis exécute create-test-users.js

echo "🔄 En attente que l'API soit prête..."

# Attendre que l'API réponde (maximum 60 secondes)
max_attempts=12
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if wget --quiet --tries=1 --timeout=3 --spider http://api:3000/api/health >/dev/null 2>&1; then
        echo "✅ L'API est prête ! Création des données de test..."
        break
    fi
    
    attempt=$((attempt + 1))
    echo "⏳ Tentative $attempt/$max_attempts - L'API n'est pas encore prête, nouvelle tentative dans 5 secondes..."
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Timeout : L'API n'a pas répondu après 60 secondes"
    exit 1
fi

# Exécuter le script de création des utilisateurs de test
cd /usr/src/app
echo "📝 Exécution du script de création des données..."
node create-test-users.js

if [ $? -eq 0 ]; then
    echo "🎉 Données de test créées avec succès !"
    echo "📋 Utilisateurs créés :"
    echo "   • admin@admin.fr / admin (role: admin)"
    echo "   • john.doe@example.com / user"
    echo "   • jane.smith@example.com / user"
    echo "   • alice.martin@example.com / user"
    echo "   • bob.wilson@example.com / user" 
    echo "   • charlie.brown@example.com / user"
else
    echo "❌ Erreur lors de la création des données de test"
    exit 1
fi