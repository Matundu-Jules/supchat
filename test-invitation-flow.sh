#!/bin/bash

# Test script pour l'invitation d'utilisateurs
echo "=== Test du flow d'invitation ==="

# 1. Récupérer le token CSRF
echo "1. Récupération du token CSRF..."
curl -c cookies.txt -b cookies.txt -X GET "http://localhost:3000/api/csrf-token" -s | jq .

# 2. Test de l'endpoint de login (pour obtenir une session valide)
echo -e "\n2. Tentative de connexion..."
curl -c cookies.txt -b cookies.txt \
  -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $(cat cookies.txt | grep XSRF-TOKEN | cut -f7)" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}' \
  -s

# 3. Test de l'invitation (avec un email existant)
echo -e "\n3. Test d'invitation avec email existant..."
CSRF_TOKEN=$(cat cookies.txt | grep XSRF-TOKEN | cut -f7)
echo "Token CSRF: $CSRF_TOKEN"

# Récupérer les workspaces pour avoir un ID valide
echo -e "\n4. Récupération des workspaces..."
curl -c cookies.txt -b cookies.txt \
  -X GET "http://localhost:3000/api/workspaces" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -s | jq .

echo -e "\n=== Test terminé ==="
