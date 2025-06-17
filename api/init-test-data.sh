#!/bin/bash

# Script d'initialisation des données de test
# Ce script attend que l'API soit prête puis exécute create-test-users.js

echo "🔄 En attente que l'API soit prête..."

# Attendre que l'API réponde (maximum 60 secondes)
max_attempts=12
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://api:3000/api/health > /dev/null 2>&1; then
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
else
    echo "❌ Erreur lors de la création des données de test"
    exit 1
fi
