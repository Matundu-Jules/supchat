#!/bin/bash

echo "🧪 Test de création de canal et vérification des droits d'admin"
echo "============================================================"

# Variables
API_URL="http://localhost:3000/api"
COOKIE_FILE="cookies.txt"

# Email et mot de passe (remplacez par vos vraies credentials)
EMAIL="admin@example.com"
PASSWORD="motdepasse"

# 1. Connexion
echo "📝 1. Connexion..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Réponse de connexion: $LOGIN_RESPONSE"

# Extraire le token de la réponse (si dans le body)
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Impossible de récupérer le token de connexion"
  exit 1
fi

echo "✅ Connexion réussie, token: ${TOKEN:0:50}..."

# 2. Récupérer la liste des workspaces
echo -e "\n📁 2. Récupération des workspaces..."
WORKSPACES_RESPONSE=$(curl -s -b "$COOKIE_FILE" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/workspaces")

echo "Workspaces: $WORKSPACES_RESPONSE"

# Extraire le premier workspace ID
WORKSPACE_ID=$(echo "$WORKSPACES_RESPONSE" | jq -r '.[0]._id // empty')

if [ -z "$WORKSPACE_ID" ]; then
  echo "❌ Aucun workspace trouvé"
  exit 1
fi

echo "✅ Workspace trouvé: $WORKSPACE_ID"

# 3. Créer un canal de test
echo -e "\n🔧 3. Création d'un canal de test..."
CHANNEL_NAME="test-channel-$(date +%s)"
CREATE_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/channels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"$CHANNEL_NAME\",\"workspaceId\":\"$WORKSPACE_ID\",\"type\":\"private\",\"description\":\"Canal de test\"}")

echo "Réponse de création: $CREATE_RESPONSE"

# Extraire l'ID du canal créé
CHANNEL_ID=$(echo "$CREATE_RESPONSE" | jq -r '.channel._id // .channel.id // empty')

if [ -z "$CHANNEL_ID" ]; then
  echo "❌ Impossible de créer le canal"
  exit 1
fi

echo "✅ Canal créé avec succès: $CHANNEL_ID"

# 4. Vérifier les permissions du créateur
echo -e "\n🔍 4. Vérification des permissions du créateur..."
PERMISSIONS_RESPONSE=$(curl -s -b "$COOKIE_FILE" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/permissions?workspaceId=$WORKSPACE_ID")

echo "Permissions dans le workspace: $PERMISSIONS_RESPONSE"

# Chercher les permissions de l'utilisateur actuel
USER_PERMS=$(echo "$PERMISSIONS_RESPONSE" | jq -r ".[] | select(.userId.email == \"$EMAIL\")")

if [ -z "$USER_PERMS" ]; then
  echo "❌ Permissions utilisateur non trouvées"
  exit 1
fi

echo "✅ Permissions utilisateur trouvées"

# Vérifier s'il y a un rôle admin pour ce canal
CHANNEL_ADMIN_ROLE=$(echo "$USER_PERMS" | jq -r ".channelRoles[] | select(.channelId == \"$CHANNEL_ID\" and .role == \"admin\") | .role")

if [ "$CHANNEL_ADMIN_ROLE" = "admin" ]; then
  echo "✅ SUCCESS: Le créateur du canal a bien le rôle admin sur le canal!"
else
  echo "❌ ÉCHEC: Le créateur du canal n'a PAS le rôle admin sur le canal"
  echo "Rôles de canal trouvés:"
  echo "$USER_PERMS" | jq '.channelRoles'
fi

# 5. Nettoyer : supprimer le canal de test
echo -e "\n🧹 5. Nettoyage - Suppression du canal de test..."
DELETE_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X DELETE "$API_URL/channels/$CHANNEL_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Réponse de suppression: $DELETE_RESPONSE"

echo -e "\n🏁 Test terminé!"
