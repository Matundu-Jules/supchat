#!/bin/bash

# Module de monitoring et logs pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

# Fonction pour voir les logs d'un service
view_logs() {
    compose_file=$(select_environment)
    result=$?
    
    if [[ $result -eq 1 ]]; then
        if [[ "$compose_file" == "NONE" ]]; then
            echo -e "\n${RED}❌ Aucun environnement Docker n'est en cours d'exécution${NC}"
        else
            echo -e "${RED}❌ Choix d'environnement invalide${NC}"
        fi
        pause
        return 1
    fi
    
    env_name=$(get_env_name "$compose_file")
    service=$(select_service "📝 CONSULTATION DES LOGS - Sélectionnez le service dont vous voulez voir les logs dans l'environnement ${env_name}")
    
    if [[ -n "$service" ]]; then
        echo -e "\n${YELLOW}📝 Logs du service: $service (${env_name})${NC}"
        echo "════════════════════════════════════════════════════════"
        echo -e "${CYAN}Affichage des 50 dernières lignes de logs...${NC}"
        if eval "docker-compose $compose_file logs --tail=50 $service"; then
            echo -e "\n${GREEN}✅ Logs affichés avec succès${NC}"
        else
            echo -e "\n${RED}❌ Erreur lors de l'affichage des logs pour le service $service${NC}"
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '2' pour voir les logs de l'API"
    fi
    pause
}

# Fonction pour voir les logs d'un service en production (pour les menus post-démarrage)
view_logs_prod() {
    service=$(select_service "📝 CONSULTATION DES LOGS PRODUCTION - Sélectionnez le service dont vous voulez voir les logs en production")
    if [[ -n "$service" ]]; then
        echo -e "\n${YELLOW}📝 Logs du service: $service (production)${NC}"
        echo "════════════════════════════════════════════════════════"
        echo -e "${CYAN}Affichage des 50 dernières lignes de logs...${NC}"
        if docker-compose -f docker-compose.prod.yml logs --tail=50 "$service"; then
            echo -e "\n${GREEN}✅ Logs affichés avec succès${NC}"
        else
            echo -e "\n${RED}❌ Erreur lors de l'affichage des logs pour le service $service${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide.${NC}"
    fi
    pause
}

# Fonction pour suivre les logs en temps réel
follow_logs() {
    compose_file=$(select_environment)
    result=$?
    
    if [[ $result -eq 1 ]]; then
        if [[ "$compose_file" == "NONE" ]]; then
            echo -e "\n${RED}❌ Aucun environnement Docker n'est en cours d'exécution${NC}"
        else
            echo -e "${RED}❌ Choix d'environnement invalide${NC}"
        fi
        pause
        return 1
    fi
    
    env_name=$(get_env_name "$compose_file")
    service=$(select_service "📈 SUIVI DES LOGS EN TEMPS RÉEL - Sélectionnez le service dont vous voulez suivre les logs dans l'environnement ${env_name}")
    
    if [[ -n "$service" ]]; then
        echo -e "\n${YELLOW}📈 Logs en temps réel du service: $service (${env_name})${NC}"
        echo -e "${CYAN}Appuyez sur Ctrl+C pour arrêter${NC}"
        echo "════════════════════════════════════════════════════════"
        if eval "docker-compose $compose_file logs -f $service"; then
            echo -e "\n${GREEN}✅ Suivi des logs terminé${NC}"
        else
            echo -e "\n${RED}❌ Erreur lors du suivi des logs pour le service $service${NC}"
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '1' pour suivre les logs du service Web"
    fi
    pause
}

# Fonction pour ouvrir un shell dans un container
open_shell() {
    compose_file=$(select_environment)
    result=$?
    
    if [[ $result -eq 1 ]]; then
        if [[ "$compose_file" == "NONE" ]]; then
            echo -e "\n${RED}❌ Aucun environnement Docker n'est en cours d'exécution${NC}"
        else
            echo -e "${RED}❌ Choix d'environnement invalide${NC}"
        fi
        pause
        return 1
    fi
    
    env_name=$(get_env_name "$compose_file")
    service=$(select_service "🖥️ ACCÈS SHELL CONTAINER - Sélectionnez le container dans lequel vous voulez ouvrir un shell dans l'environnement ${env_name}")
    
    if [[ -n "$service" ]]; then
        echo -e "\n${CYAN}🖥️ Ouverture d'un shell dans: $service (${env_name})${NC}"
        
        # Vérifier si le container est en cours d'exécution
        if eval "docker-compose $compose_file ps $service" | grep -q "Up"; then
            case "$service" in
                "web"|"api"|"mobile")
                    eval "docker-compose $compose_file exec $service /bin/sh"
                    ;;
                "db")
                    echo "Choix disponibles:"
                    echo "  1) Shell bash/sh"
                    echo "  2) MongoDB shell (mongosh)"
                    read -p "Votre choix (1-2): " shell_choice
                    if [[ "$shell_choice" == "1" ]]; then
                        eval "docker-compose $compose_file exec $service /bin/bash"
                    elif [[ "$shell_choice" == "2" ]]; then
                        eval "docker-compose $compose_file exec $service mongosh"
                    fi
                    ;;
                *)
                    eval "docker-compose $compose_file exec $service /bin/sh"
                    ;;
            esac
        else
            echo -e "${RED}❌ Le container $service n'est pas en cours d'exécution${NC}"
            pause
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '2' pour accéder au shell de l'API"
        pause
    fi
}

# Fonction pour voir l'utilisation des ressources
show_resources() {
    echo -e "\n${BLUE}📦 Utilisation des ressources Docker:${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${CYAN}💾 Utilisation du disque:${NC}"
    docker system df
    
    echo -e "\n${CYAN}🖥️ Ressources des containers:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    pause
}

# Fonction de diagnostic des services
diagnostic_services() {
    echo -e "\n${BLUE}🔍 Diagnostic des services Docker...${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${CYAN}📋 Services configurés dans le script:${NC}"
    for i in "${!SERVICES[@]}"; do
        echo "  $((i+1))) ${SERVICES[$i]}"
    done
    
    echo -e "\n${CYAN}🐳 État détaillé des containers (développement):${NC}"
    docker-compose ps -a 2>/dev/null || echo "Aucun container de développement"
    
    echo -e "\n${CYAN}🏭 État détaillé des containers (production):${NC}"
    docker-compose -f docker-compose.prod.yml ps -a 2>/dev/null || echo "Aucun container de production"
    
    echo -e "\n${CYAN}🧪 État détaillé des containers (test):${NC}"
    docker-compose -f docker-compose.test.yml ps -a 2>/dev/null || echo "Aucun container de test"
    
    echo -e "\n${CYAN}🔗 Services dans docker-compose.yml:${NC}"
    docker-compose config --services 2>/dev/null || echo "Erreur lors de la lecture de docker-compose.yml"
    
    echo -e "\n${CYAN}📊 Test de connectivité aux services:${NC}"
    for service in "${SERVICES[@]}"; do
        echo -n "  • $service: "
        if docker-compose ps "$service" 2>/dev/null | grep -q "Up"; then
            echo -e "${GREEN}✅ En fonctionnement (dev)${NC}"
        elif docker-compose -f docker-compose.prod.yml ps "$service" 2>/dev/null | grep -q "Up"; then
            echo -e "${GREEN}✅ En fonctionnement (prod)${NC}"
        elif docker-compose -f docker-compose.test.yml ps "$service" 2>/dev/null | grep -q "Up"; then
            echo -e "${GREEN}✅ En fonctionnement (test)${NC}"
        else
            echo -e "${RED}❌ Arrêté ou non trouvé${NC}"
        fi
    done
    
    echo -e "\n${CYAN}🔧 Informations de debugging:${NC}"
    echo "  • Docker version: $(docker --version 2>/dev/null || echo 'Non disponible')"
    echo "  • Docker Compose version: $(docker-compose --version 2>/dev/null || echo 'Non disponible')"
    echo "  • Répertoire courant: $(pwd)"
    echo "  • Fichiers docker-compose disponibles:"
    ls -la docker-compose*.yml 2>/dev/null | sed 's/^/    /' || echo "    Aucun fichier docker-compose trouvé"
    
    pause
}
