#!/bin/bash

echo "🔄 REDÉMARRAGE EXPO AVEC CACHE VIDÉ"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Arrêt d'Expo...${NC}"
# Tuer tous les processus Expo
pkill -f "expo"
pkill -f "Metro"

echo -e "${YELLOW}🗑️  Nettoyage du cache...${NC}"
# Nettoyer les caches
npx expo install --fix
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-* 2>/dev/null || true

echo -e "${YELLOW}📋 Vérification de la configuration .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
    echo "Contenu actuel:"
    grep "EXPO_PUBLIC" .env
else
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
fi

echo -e "${YELLOW}🚀 Redémarrage d'Expo avec cache vidé...${NC}"
npx expo start --clear

echo -e "${GREEN}✨ Processus terminé!${NC}"
echo -e "${YELLOW}📱 Scanne le nouveau QR code depuis ton iPhone${NC}"
