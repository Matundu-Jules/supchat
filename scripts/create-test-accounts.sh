#!/bin/bash

# Script simple pour créer des comptes via l'API REST
API_URL="http://localhost:3000/api"

echo "🔄 Création des comptes utilisateurs via l'API REST..."

# Fonction pour créer un utilisateur
create_user() {
    local name="$1"
    local email="$2"
    local password="$3"
    
    echo "📝 Création de l'utilisateur: $email"
    
    response=$(curl -X POST "$API_URL/auth/register" \
         -H "Content-Type: application/json" \
         -d "{
           \"name\": \"$name\",
           \"email\": \"$email\",
           \"password\": \"$password\"
         }" \
         -s -w "%{http_code}")
    
    # Extraire le code de statut
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [[ "$http_code" -eq 200 || "$http_code" -eq 201 ]]; then
        echo "✅ Utilisateur $email créé avec succès"
    else
        echo "⚠️  Utilisateur $email : $response_body"
    fi
    
    echo ""
}

# Vérifier que l'API est accessible
echo "🔍 Vérification de l'API..."
if curl -s "$API_URL/health" > /dev/null; then
    echo "✅ API accessible"
else
    echo "❌ API non accessible sur $API_URL"
    exit 1
fi

echo ""

# Création des utilisateurs
create_user "Admin" "admin@admin.fr" "admin"
create_user "John Doe" "john.doe@example.com" "user"
create_user "Jane Smith" "jane.smith@example.com" "user"
create_user "Alice Martin" "alice.martin@example.com" "user"
create_user "Bob Wilson" "bob.wilson@example.com" "user"
create_user "Charlie Brown" "charlie.brown@example.com" "user"
create_user "David Taylor" "david.taylor@example.com" "user"
create_user "Emma Garcia" "emma.garcia@example.com" "user"

echo "🎉 Création des comptes terminée !"
echo ""
echo "📋 Comptes de connexion créés :"
echo "┌─────────────────────────┬──────────┐"
echo "│ Email                   │ Password │"
echo "├─────────────────────────┼──────────┤"
echo "│ admin@admin.fr          │ admin    │"
echo "│ john.doe@example.com    │ user     │"
echo "│ jane.smith@example.com  │ user     │"
echo "│ alice.martin@example.com│ user     │"
echo "│ bob.wilson@example.com  │ user     │"
echo "│ charlie.brown@example.com│ user    │"
echo "│ david.taylor@example.com│ user     │"
echo "│ emma.garcia@example.com │ user     │"
echo "└─────────────────────────┴──────────┘"
