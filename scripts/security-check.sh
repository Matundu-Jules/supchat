#!/bin/bash
# Script d'analyse de sécurité Docker pour SupChat

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🛡️ ANALYSE DE SÉCURITÉ DOCKER - SupChat${NC}"
echo "=================================================="

# Fonction pour vérifier la sécurité des conteneurs
check_container_security() {
    echo -e "\n${YELLOW}📊 Analyse des conteneurs en cours d'exécution:${NC}"
    
    for container in $(docker-compose ps -q); do
        if [ -n "$container" ]; then
            name=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
            echo -e "\n${BLUE}🔍 Conteneur: ${GREEN}$name${NC}"
            
            # Vérifier si le conteneur tourne en root
            user=$(docker inspect --format='{{.Config.User}}' $container)
            if [ -z "$user" ] || [ "$user" = "root" ] || [ "$user" = "0" ]; then
                echo -e "  ⚠️  ${YELLOW}Utilisateur: ROOT (risque de sécurité)${NC}"
            else
                echo -e "  ✅ ${GREEN}Utilisateur: $user${NC}"
            fi
            
            # Vérifier les privilèges
            privileged=$(docker inspect --format='{{.HostConfig.Privileged}}' $container)
            if [ "$privileged" = "true" ]; then
                echo -e "  ❌ ${RED}Mode privilégié activé (DANGEREUX)${NC}"
            else
                echo -e "  ✅ ${GREEN}Mode privilégié désactivé${NC}"
            fi
            
            # Vérifier les capacités
            caps=$(docker inspect --format='{{.HostConfig.CapAdd}}' $container)
            if [ "$caps" != "[]" ] && [ "$caps" != "<no value>" ]; then
                echo -e "  ⚠️  ${YELLOW}Capacités ajoutées: $caps${NC}"
            else
                echo -e "  ✅ ${GREEN}Aucune capacité supplémentaire${NC}"
            fi
            
            # Vérifier read-only
            readonly=$(docker inspect --format='{{.HostConfig.ReadonlyRootfs}}' $container)
            if [ "$readonly" = "true" ]; then
                echo -e "  ✅ ${GREEN}Système de fichiers en lecture seule${NC}"
            else
                echo -e "  ⚠️  ${YELLOW}Système de fichiers en écriture${NC}"
            fi
        fi
    done
}

# Fonction pour vérifier les volumes
check_volumes() {
    echo -e "\n${YELLOW}💾 Analyse des volumes:${NC}"
    
    docker volume ls --format "table {{.Name}}\t{{.Driver}}" | while read line; do
        if [[ $line == *"supchat"* ]]; then
            echo -e "  📁 ${GREEN}$line${NC}"
        fi
    done
}

# Fonction pour vérifier les réseaux
check_networks() {
    echo -e "\n${YELLOW}🌐 Analyse des réseaux:${NC}"
    
    docker network ls --filter name=supchat --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
}

# Fonction pour vérifier les ports exposés
check_exposed_ports() {
    echo -e "\n${YELLOW}🔌 Ports exposés:${NC}"
    
    docker-compose ps --format "table {{.Name}}\t{{.Ports}}" | while IFS=$'\t' read -r name ports; do
        if [ "$name" != "NAME" ] && [ -n "$name" ]; then
            echo -e "  🖥️  ${GREEN}$name${NC}: $ports"
            
            # Vérifier si des ports sont exposés publiquement
            if [[ $ports == *"0.0.0.0"* ]]; then
                echo -e "    ⚠️  ${YELLOW}Port exposé publiquement${NC}"
            elif [[ $ports == *"127.0.0.1"* ]]; then
                echo -e "    ✅ ${GREEN}Port limité à localhost${NC}"
            fi
        fi
    done
}

# Fonction pour scanner les vulnérabilités (optionnel)
scan_vulnerabilities() {
    echo -e "\n${YELLOW}🔍 Scan de vulnérabilités (optionnel):${NC}"
    
    if command -v trivy &> /dev/null; then
        echo -e "  🔎 Scanning des images Docker..."
        
        for image in $(docker-compose config --images); do
            echo -e "\n  📷 Image: ${GREEN}$image${NC}"
            trivy image --severity HIGH,CRITICAL --quiet $image
        done
    else
        echo -e "  ℹ️  ${BLUE}Trivy non installé. Pour installer:${NC}"
        echo -e "     ${GREEN}docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest${NC}"
    fi
}

# Fonction pour recommandations de sécurité
security_recommendations() {
    echo -e "\n${BLUE}📋 RECOMMANDATIONS DE SÉCURITÉ:${NC}"
    echo -e "${GREEN}✅ Bonnes pratiques déjà appliquées:${NC}"
    echo -e "   • MongoDB limité à localhost"
    echo -e "   • Utilisation d'images officielles"
    echo -e "   • Réseau Docker isolé"
    echo -e "   • Variables d'environnement externalisées"
    
    echo -e "\n${YELLOW}⚠️ Améliorations recommandées:${NC}"
    echo -e "   • Utiliser des utilisateurs non-root dans les conteneurs"
    echo -e "   • Activer le mode read-only quand possible"
    echo -e "   • Ajouter des health checks"
    echo -e "   • Limiter les ressources (CPU/RAM)"
    echo -e "   • Scanner régulièrement les vulnérabilités"
    echo -e "   • Utiliser des secrets Docker au lieu de variables d'env"
    
    echo -e "\n${BLUE}🚀 Pour appliquer la version sécurisée:${NC}"
    echo -e "   ${GREEN}cp docker-compose-secure.yml docker-compose.yml${NC}"
    echo -e "   ${GREEN}docker-compose down && docker-compose up -d${NC}"
}

# Exécution des vérifications
check_container_security
check_volumes
check_networks
check_exposed_ports
scan_vulnerabilities
security_recommendations

echo -e "\n${GREEN}🎯 Analyse terminée !${NC}"
