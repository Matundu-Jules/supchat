#!/bin/bash

# Script pour lancer les tests avec Docker
# Ce script démarre une base de données MongoDB dédiée aux tests

echo "🧪 Démarrage des tests SupChat avec Docker..."

# Nettoyer les anciens conteneurs de test
echo "📋 Nettoyage des anciens conteneurs de test..."
docker-compose -f docker-compose.test.yml down --volumes

# Créer le réseau s'il n'existe pas
docker network create supchat-network 2>/dev/null || true

# Démarrer uniquement la base de données de test
echo "🗄️  Démarrage de la base de données de test..."
docker-compose -f docker-compose.test.yml up -d db-test

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Lancer les tests dans le conteneur API
echo "🚀 Lancement des tests..."
docker-compose -f docker-compose.test.yml run --rm api-test

# Nettoyer après les tests
echo "🧹 Nettoyage après les tests..."
docker-compose -f docker-compose.test.yml down --volumes

echo "✅ Tests terminés !"
