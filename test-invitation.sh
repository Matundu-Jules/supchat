#!/bin/bash

BASE_URL="http://localhost:5173/api"
COOKIE_JAR="test-cookies.txt"

echo "🔍 Test complet d'invitation via le frontend..."
echo

# Nettoyer les cookies
rm -f $COOKIE_JAR

# 1. Récupérer le token CSRF
echo "1. Récupération du token CSRF..."
CSRF_RESPONSE=$(curl -s -c $COOKIE_JAR "${BASE_URL}/csrf-token")
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token CSRF récupéré: ${CSRF_TOKEN:0:20}..."
echo

# 2. Créer un utilisateur de test
echo "2. Création d'un utilisateur de test..."
curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    -X POST "${BASE_URL}/auth/register" \
    -d '{
        "name": "Test User",
        "email": "test@test.com", 
        "password": "password123",
        "confirmPassword": "password123"
    }' > /dev/null
echo "✅ Tentative de création d'utilisateur effectuée"
echo

# 3. Se connecter
echo "3. Connexion avec l'utilisateur de test..."
LOGIN_RESPONSE=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    -X POST "${BASE_URL}/auth/login" \
    -d '{
        "email": "test@test.com",
        "password": "password123"
    }')
echo "✅ Réponse de connexion: $LOGIN_RESPONSE"
echo

# 4. Créer un utilisateur à inviter
echo "4. Création d'un utilisateur à inviter..."
curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    -X POST "${BASE_URL}/auth/register" \
    -d '{
        "name": "Invited User",
        "email": "invited@test.com",
        "password": "password123", 
        "confirmPassword": "password123"
    }' > /dev/null
echo "✅ Tentative de création d'utilisateur à inviter effectuée"
echo

# 5. Récupérer les workspaces
echo "5. Récupération des workspaces..."
WORKSPACES_RESPONSE=$(curl -s -b $COOKIE_JAR \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    "${BASE_URL}/workspaces")
echo "✅ Workspaces: $WORKSPACES_RESPONSE"
echo

# 6. Extraire l'ID du premier workspace (simplification)
WORKSPACE_ID=$(echo $WORKSPACES_RESPONSE | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$WORKSPACE_ID" ]; then
    echo "6. Création d'un workspace de test..."
    CREATE_RESPONSE=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
        -H "Content-Type: application/json" \
        -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
        -X POST "${BASE_URL}/workspaces" \
        -d '{
            "name": "Test Workspace",
            "description": "Workspace pour test",
            "isPublic": true
        }')
    WORKSPACE_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Workspace créé: $WORKSPACE_ID"
else
    echo "✅ Utilisation du workspace existant: $WORKSPACE_ID"
fi
echo

# 7. Tester l'invitation d'un utilisateur existant
echo "7. Test d'invitation d'un utilisateur existant..."
INVITE_RESPONSE=$(curl -s -b $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    -X POST "${BASE_URL}/workspaces/${WORKSPACE_ID}/invite" \
    -d '{"email": "invited@test.com"}')
echo "📧 Réponse invitation utilisateur existant: $INVITE_RESPONSE"
echo

# 8. Tester l'invitation d'un utilisateur inexistant
echo "8. Test d'invitation d'un utilisateur inexistant..."
INVITE_ERROR_RESPONSE=$(curl -s -b $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
    -X POST "${BASE_URL}/workspaces/${WORKSPACE_ID}/invite" \
    -d '{"email": "nonexistent@test.com"}')
echo "❌ Réponse invitation utilisateur inexistant: $INVITE_ERROR_RESPONSE"
echo

# Nettoyer
rm -f $COOKIE_JAR
echo "✅ Test terminé!"
