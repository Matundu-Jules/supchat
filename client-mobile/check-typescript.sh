#!/bin/bash

echo "🔍 VÉRIFICATION TYPESCRIPT"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📋 Vérification de la configuration TypeScript...${NC}"

# Vérifier si TypeScript est installé
if command -v npx &> /dev/null; then
    echo -e "${GREEN}✅ NPX disponible${NC}"
else
    echo -e "${RED}❌ NPX non trouvé${NC}"
    exit 1
fi

# Vérifier la configuration TypeScript
echo -e "${YELLOW}🔧 Vérification du tsconfig.json...${NC}"
if npx tsc --noEmit --project tsconfig.json; then
    echo -e "${GREEN}✅ Configuration TypeScript valide${NC}"
else
    echo -e "${RED}❌ Erreurs de configuration TypeScript${NC}"
fi

# Vérifier les fichiers de types
echo -e "${YELLOW}📁 Vérification des fichiers de types...${NC}"

if [ -f "expo-env.d.ts" ]; then
    echo -e "${GREEN}✅ expo-env.d.ts présent${NC}"
else
    echo -e "${RED}❌ expo-env.d.ts manquant${NC}"
fi

if [ -f "types/global.d.ts" ]; then
    echo -e "${GREEN}✅ types/global.d.ts présent${NC}"
else
    echo -e "${RED}❌ types/global.d.ts manquant${NC}"
fi

echo -e "${GREEN}🎉 Vérification terminée !${NC}"
