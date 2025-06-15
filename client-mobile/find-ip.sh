#!/bin/bash

echo "🔍 DÉTECTION DE L'IP DE TON PC"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📡 Recherche de l'adresse IP...${NC}"

# Détecter l'OS
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    echo -e "${BLUE}🖥️  Système: Windows${NC}"
    IP=$(ipconfig | grep -A 4 "Wireless LAN adapter Wi-Fi" | grep "IPv4" | awk '{print $NF}' | head -1)
    if [ -z "$IP" ]; then
        IP=$(ipconfig | grep "IPv4" | awk '{print $NF}' | head -1)
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo -e "${BLUE}🍎 Système: macOS${NC}"
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    # Linux
    echo -e "${BLUE}🐧 Système: Linux${NC}"
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -n "$IP" ]; then
    echo -e "${GREEN}✅ IP trouvée: $IP${NC}"
    
    echo -e "${YELLOW}📝 Configuration suggérée pour .env:${NC}"
    echo "EXPO_PUBLIC_HOST=$IP"
    echo "EXPO_PUBLIC_API_URL=http://$IP:3000/api"
    echo "EXPO_PUBLIC_WS_URL=ws://$IP:3000"
    
    echo -e "${YELLOW}📱 Pour tester sur iPhone:${NC}"
    echo "1. Assure-toi que ton iPhone et PC sont sur le même WiFi"
    echo "2. Modifie le .env avec l'IP ci-dessus"
    echo "3. Redémarre Expo avec: npx expo start -c"
    echo "4. Scanne le QR code depuis ton iPhone"
    
    echo -e "${YELLOW}🔧 Commande rapide pour mettre à jour .env:${NC}"
    echo "sed -i 's/EXPO_PUBLIC_HOST=.*/EXPO_PUBLIC_HOST=$IP/' .env"
    echo "sed -i 's|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://$IP:3000/api|' .env"
    echo "sed -i 's|EXPO_PUBLIC_WS_URL=.*|EXPO_PUBLIC_WS_URL=ws://$IP:3000|' .env"
    
else
    echo -e "${RED}❌ Impossible de détecter l'IP automatiquement${NC}"
    echo -e "${YELLOW}🔍 Méthodes manuelles:${NC}"
    echo "Windows: ipconfig"
    echo "macOS/Linux: ifconfig"
    echo "Ou dans les paramètres réseau de ton système"
fi

echo -e "${GREEN}✨ Script terminé!${NC}"
