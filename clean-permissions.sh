#!/bin/bash

# Script pour nettoyer les permissions orphelines via Docker
# Usage: ./clean-permissions.sh [diagnose|clean]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Script de nettoyage des permissions orphelines${NC}"
echo -e "${BLUE}=================================================${NC}\n"

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas en cours d'exécution${NC}"
    exit 1
fi

# Vérifier si les conteneurs SUPCHAT sont en cours d'exécution
if ! docker-compose ps | grep -q "supchat.*Up"; then
    echo -e "${YELLOW}⚠️  Les conteneurs SUPCHAT ne semblent pas être en cours d'exécution${NC}"
    echo -e "${YELLOW}   Tentative de démarrage de la base de données...${NC}\n"
    
    # Démarrer seulement la base de données
    docker-compose up -d db
    sleep 5
fi

# Déterminer l'action (défaut: diagnose)
ACTION="${1:-diagnose}"

if [[ "$ACTION" != "diagnose" && "$ACTION" != "clean" ]]; then
    echo -e "${RED}❌ Action invalide. Utilisez 'diagnose' ou 'clean'${NC}"
    echo "Usage: $0 [diagnose|clean]"
    exit 1
fi

echo -e "${GREEN}🔍 Exécution de l'action: ${ACTION}${NC}\n"

# Exécuter le script de nettoyage dans le conteneur API
echo -e "${BLUE}📋 Exécution du script dans le conteneur API...${NC}"

if docker-compose ps api | grep -q "Up"; then
    # Le conteneur API est en cours d'exécution
    docker-compose exec api node scripts/clean-orphan-permissions.js "$ACTION"
else
    # Le conteneur API n'est pas en cours d'exécution, l'exécuter temporairement
    echo -e "${YELLOW}⚠️  Le conteneur API n'est pas en cours d'exécution${NC}"
    echo -e "${YELLOW}   Exécution temporaire pour le nettoyage...${NC}\n"
    
    docker-compose run --rm api node scripts/clean-orphan-permissions.js "$ACTION"
fi

echo -e "\n${GREEN}✅ Script de nettoyage terminé${NC}"

# Suggestions d'actions de suivi
if [[ "$ACTION" == "clean" ]]; then
    echo -e "\n${BLUE}💡 Actions de suivi recommandées:${NC}"
    echo "1. Redémarrer l'application web pour vider les caches"
    echo "2. Vérifier que la section Rôles fonctionne correctement"
    echo "3. Recréer les permissions manquantes si nécessaire"
fi
