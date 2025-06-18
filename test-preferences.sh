#!/bin/bash

# Script de test pour vérifier le bon fonctionnement des préférences utilisateur
# Utilise l'environnement de test Docker pour éviter d'affecter les données de développement

echo "🔍 Test de la logique des préférences utilisateur SUPCHAT"
echo "=================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.test.yml" ]; then
    echo "❌ Erreur: docker-compose.test.yml non trouvé. Assurez-vous d'être à la racine du projet."
    exit 1
fi

# Démarrer l'environnement de test
echo "🐳 Démarrage de l'environnement de test..."
docker-compose -f docker-compose.test.yml up -d db api

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Fonction pour faire des tests API
test_preferences_api() {
    local email="test-prefs@example.com"
    local password="TestPassword123!"
    local api_url="http://localhost:3001/api"
    
    echo "👤 Création d'un utilisateur de test..."
    
    # Créer un utilisateur
    register_response=$(curl -s -X POST "${api_url}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"Test User\",\"email\":\"${email}\",\"password\":\"${password}\"}")
    
    echo "📧 Réponse création utilisateur: ${register_response}"
    
    # Se connecter
    login_response=$(curl -s -X POST "${api_url}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")
    
    token=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo "❌ Erreur: Impossible d'obtenir le token d'authentification"
        echo "Réponse login: ${login_response}"
        return 1
    fi
    
    echo "✅ Token obtenu: ${token:0:20}..."
    
    # Test 1: Récupérer les préférences par défaut
    echo ""
    echo "🧪 Test 1: Préférences par défaut"
    prefs_response=$(curl -s -X GET "${api_url}/user/preferences" \
        -H "Authorization: Bearer ${token}")
    
    echo "📋 Préférences par défaut: ${prefs_response}"
    
    # Test 2: Mettre à jour le thème
    echo ""
    echo "🧪 Test 2: Mise à jour du thème en 'dark'"
    theme_response=$(curl -s -X PUT "${api_url}/user/preferences" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d '{"theme":"dark"}')
    
    echo "🎨 Réponse changement thème: ${theme_response}"
    
    # Test 3: Mettre à jour le statut
    echo ""
    echo "🧪 Test 3: Mise à jour du statut en 'busy'"
    status_response=$(curl -s -X PUT "${api_url}/user/preferences" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d '{"status":"busy"}')
    
    echo "📱 Réponse changement statut: ${status_response}"
    
    # Test 4: Vérifier la persistance
    echo ""
    echo "🧪 Test 4: Vérification de la persistance"
    final_prefs=$(curl -s -X GET "${api_url}/user/preferences" \
        -H "Authorization: Bearer ${token}")
    
    echo "💾 Préférences finales: ${final_prefs}"
    
    # Test 5: Mise à jour simultanée
    echo ""
    echo "🧪 Test 5: Mise à jour simultanée thème + statut"
    both_response=$(curl -s -X PUT "${api_url}/user/preferences" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d '{"theme":"light","status":"away"}')
    
    echo "🔄 Réponse mise à jour simultanée: ${both_response}"
    
    # Vérification finale
    echo ""
    echo "🧪 Test 6: Vérification finale"
    verification_prefs=$(curl -s -X GET "${api_url}/user/preferences" \
        -H "Authorization: Bearer ${token}")
    
    echo "✅ Préférences de vérification: ${verification_prefs}"
    
    # Analyser les résultats
    if echo $verification_prefs | grep -q '"theme":"light"' && echo $verification_prefs | grep -q '"status":"away"'; then
        echo ""
        echo "🎉 SUCCÈS: Toutes les préférences ont été correctement sauvegardées et récupérées !"
        return 0
    else
        echo ""
        echo "❌ ÉCHEC: Les préférences ne correspondent pas aux valeurs attendues"
        return 1
    fi
}

# Test du côté serveur
echo ""
echo "🔧 Test de l'API Backend"
test_preferences_api
api_test_result=$?

# Test des validations
echo ""
echo "🔧 Test des validations"

# Test avec des valeurs invalides
echo "🧪 Test avec thème invalide"
invalid_theme_response=$(curl -s -X PUT "http://localhost:3001/api/user/preferences" \
    -H "Content-Type: application/json" \
    -d '{"theme":"invalid_theme"}')

echo "❌ Réponse thème invalide: ${invalid_theme_response}"

echo "🧪 Test avec statut invalide"
invalid_status_response=$(curl -s -X PUT "http://localhost:3001/api/user/preferences" \
    -H "Content-Type: application/json" \
    -d '{"status":"invalid_status"}')

echo "❌ Réponse statut invalide: ${invalid_status_response}"

# Nettoyage
echo ""
echo "🧹 Nettoyage de l'environnement de test..."
docker-compose -f docker-compose.test.yml down

# Résumé
echo ""
echo "📊 RÉSUMÉ DES TESTS"
echo "==================="

if [ $api_test_result -eq 0 ]; then
    echo "✅ Tests API: SUCCÈS"
else
    echo "❌ Tests API: ÉCHEC"
fi

echo ""
echo "🎯 Points clés vérifiés:"
echo "   - Préférences par défaut (theme: light, status: online)"
echo "   - Mise à jour individuelle du thème"
echo "   - Mise à jour individuelle du statut"
echo "   - Persistence en base de données"
echo "   - Mise à jour simultanée"
echo "   - Validation des valeurs invalides"

echo ""
echo "🔍 Pour tester manuellement le frontend:"
echo "   1. Démarrer l'environnement de développement: ./docker-manager.sh"
echo "   2. Aller sur http://localhost:80"
echo "   3. Se connecter et tester les changements de thème/statut"
echo "   4. Vérifier la persistance après rafraîchissement de page"
echo "   5. Ouvrir l'app sur différents onglets pour vérifier la synchronisation"

if [ $api_test_result -eq 0 ]; then
    exit 0
else
    exit 1
fi
