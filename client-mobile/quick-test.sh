#!/bin/bash

echo "🚀 DÉMARRAGE DES SERVICES DE TEST"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 CHECKLIST RAPIDE:${NC}"

# Vérifier si le serveur est démarré
echo -e "${YELLOW}1. Vérification du serveur...${NC}"

# Récupérer l'URL API depuis le .env ou utiliser localhost par défaut
if [ -f ".env" ]; then
    API_URL=$(grep "EXPO_PUBLIC_API_URL" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -z "$API_URL" ]; then
        API_URL="http://localhost:3000/api"
    fi
else
    API_URL="http://localhost:3000/api"
fi

# Test de connexion au serveur
SERVER_TEST_URL="${API_URL%/api}/api/auth/me"
echo -e "${YELLOW}Test de connexion: ${SERVER_TEST_URL}${NC}"

if curl -s "$SERVER_TEST_URL" > /dev/null; then
    echo -e "${GREEN}✅ Serveur accessible${NC}"
else
    echo -e "${RED}❌ Serveur non accessible - Démarrez le serveur d'abord!${NC}"
    echo "URL testée: $SERVER_TEST_URL"
    echo "Commande: cd supchat-server && npm start"
    exit 1
fi

# Vérifier les dépendances mobile
echo -e "${YELLOW}2. Vérification des dépendances mobile...${NC}"
cd client-mobile

if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ Dépendances manquantes - Installation...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dépendances présentes${NC}"
fi

# Vérifier le fichier .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Fichier .env présent${NC}"
else
    echo -e "${RED}❌ Fichier .env manquant${NC}"
fi

# Vérifier les fichiers critiques
echo -e "${YELLOW}3. Vérification des fichiers critiques...${NC}"

critical_files=(
    "constants/api.ts"
    "services/authService.ts"
    "app.config.js"
    ".env"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file manquant${NC}"
    fi
done

echo -e "${YELLOW}🎯 Pour tester:${NC}"
echo "1. Assurez-vous que le serveur tourne: cd supchat-server && npm start"
echo "2. Démarrez l'app mobile: cd client-mobile && npx expo start"
echo "3. Testez le login avec un utilisateur existant"

echo -e "${GREEN}✨ Script terminé!${NC}"
