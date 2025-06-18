#!/bin/bash

# Module de gestion des services pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

# Fonction helper pour redémarrer un service dans un environnement spécifique
restart_service_in_env() {
    local compose_file="$1"
    local env_name="$2"
    
    service=$(select_service "🔄 REDÉMARRAGE DE SERVICE - Environnement: ${env_name}")
    if [[ -n "$service" ]]; then
        echo -e "\n${BLUE}🔍 Vérification de l'état du service ${WHITE}${service}${NC} dans l'environnement ${WHITE}${env_name}${NC}...${NC}"
        if eval "docker-compose $compose_file ps $service" | grep -q "Up"; then
            echo -e "${GREEN}✅ Service ${service} trouvé et en fonctionnement${NC}"
            echo -e "\n${YELLOW}🔄 Redémarrage du service: ${WHITE}${service}${NC} (${env_name})...${NC}"
            if eval "docker-compose $compose_file restart $service"; then
                echo -e "\n${GREEN}🎉 Service ${WHITE}${service}${NC} redémarré avec succès !${NC}"
                
                # Afficher l'état après redémarrage
                echo -e "\n${CYAN}📊 État du service après redémarrage:${NC}"
                eval "docker-compose $compose_file ps $service"
            else
            echo -e "\n${RED}❌ ERREUR: Échec du redémarrage du service ${service}${NC}"
            echo -e "${YELLOW}💡 Suggestions de résolution:${NC}"
            echo -e "   • Vérifiez les logs avec l'option 11 du menu principal"
            echo -e "   • Tentez un arrêt/démarrage manuel (options 7 puis 6)"
            echo -e "   • Vérifiez l'état du container avec l'option 10"
        fi
        else
            echo -e "${RED}❌ Le service ${WHITE}${service}${NC} n'est pas en cours d'exécution dans l'environnement ${env_name}${NC}"
            echo -e "${YELLOW}💡 Conseil: Démarrez d'abord le service avec l'option 6 du menu principal${NC}"
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '2' pour sélectionner le service API"
    fi
    pause
}

# Fonction pour redémarrer un service spécifique (version intelligente)
restart_service() {
    echo -e "\n${BLUE}🔍 Analyse des environnements Docker actifs...${NC}"
    
    # Sélectionner automatiquement l'environnement
    compose_file=$(select_environment)
    result=$?
    
    if [[ $result -eq 1 ]]; then
        if [[ "$compose_file" == "NONE" ]]; then
            echo -e "\n${RED}❌ Aucun environnement Docker n'est en cours d'exécution${NC}"
            echo -e "${YELLOW}💡 Conseil: Démarrez d'abord un environnement avec les options 1, 2, 3, 4 ou 5${NC}"
        elif [[ "$compose_file" == "INVALID" ]]; then
            echo -e "${RED}❌ Choix d'environnement invalide${NC}"
        fi
        pause
        return 1
    fi
    
    env_name=$(get_env_name "$compose_file")
    echo -e "\n${GREEN}✅ Environnement détecté et sélectionné: ${WHITE}${env_name}${NC}"
    
    # Appeler la fonction helper qui va afficher la liste ET demander le choix
    restart_service_in_env "$compose_file" "$env_name"
}

# Fonction pour démarrer un service spécifique
start_service() {
    compose_file=$(select_environment)
    result=$?
    
    if [[ $result -eq 1 ]]; then
        # Aucun environnement actif, demander lequel utiliser
        echo -e "\n${YELLOW}Aucun environnement n'est actif. Lequel voulez-vous utiliser ?${NC}"
        echo "  1) Développement"
        echo "  2) Production"
        echo "  3) Test"
        read -p "Environnement (1-3): " env_choice
        
        case "$env_choice" in
            1) compose_file="" ;;
            2) compose_file="-f docker-compose.prod.yml" ;;
            3) compose_file="-f docker-compose.test.yml" ;;
            *) 
                echo -e "${RED}❌ Choix invalide${NC}"
                pause
                return 1
                ;;
        esac
    fi
    
    env_name=$(get_env_name "$compose_file")
    service=$(select_service "🔧 DÉMARRAGE DE SERVICE - Sélectionnez le service à démarrer dans l'environnement ${env_name}")
    
    if [[ -n "$service" ]]; then
        echo -e "\n${GREEN}🔧 Démarrage du service: ${WHITE}$service${NC} dans l'environnement ${WHITE}${env_name}${NC}${NC}"
        if eval "docker-compose $compose_file up -d $service"; then
            echo -e "\n${GREEN}✅ Service ${WHITE}$service${NC} démarré avec succès !${NC}"
            echo -e "\n${CYAN}📊 État du service après démarrage:${NC}"
            eval "docker-compose $compose_file ps $service"
        else
            echo -e "\n${RED}❌ ERREUR: Échec du démarrage du service ${WHITE}$service${NC}${NC}"
            echo -e "${YELLOW}💡 Suggestions de résolution:${NC}"
            echo -e "   • Vérifiez si le service est déjà en cours d'exécution (option 10)"
            echo -e "   • Consultez les logs d'erreur (option 11)"
            echo -e "   • Tentez un rebuild du service (option 9)"
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '1' pour sélectionner le service Web"
    fi
    pause
}

# Fonction pour arrêter un service spécifique
stop_service() {
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
    service=$(select_service "⏹️ ARRÊT DE SERVICE - Sélectionnez le service à arrêter dans l'environnement ${env_name}")
    
    if [[ -n "$service" ]]; then
        echo -e "\n${RED}⏹️ Arrêt du service: ${WHITE}$service${NC} dans l'environnement ${WHITE}${env_name}${NC}${NC}"
        if eval "docker-compose $compose_file stop $service"; then
            echo -e "\n${GREEN}✅ Service ${WHITE}$service${NC} arrêté avec succès !${NC}"
            echo -e "\n${CYAN}📊 État du service après arrêt:${NC}"
            eval "docker-compose $compose_file ps $service"
        else
            echo -e "\n${RED}❌ ERREUR: Échec de l'arrêt du service ${WHITE}$service${NC}${NC}"
            echo -e "${YELLOW}💡 Suggestions de résolution:${NC}"
            echo -e "   • Vérifiez si le service était déjà arrêté (option 10)"
            echo -e "   • Forcez l'arrêt avec l'option 14 (arrêt complet)"
            echo -e "   • Consultez les logs pour comprendre le problème (option 11)"
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '4' pour sélectionner la base de données (db)"
    fi
    pause
}

# Fonction pour builder un service
build_service() {
    echo -e "\n${BLUE}Choisissez l'environnement pour le build:${NC}"
    echo "  1) Développement (Dockerfile.dev)"
    echo "  2) Production (Dockerfile)"
    read -p "Mode (1-2): " mode_choice
    
    local compose_file=""
    local env_name=""
    
    case "$mode_choice" in
        1)
            compose_file=""
            env_name="développement"
            ;;
        2)
            compose_file="-f docker-compose.prod.yml"
            env_name="production"
            ;;
        *)
            echo -e "${RED}❌ Mode invalide${NC}"
            pause
            return 1
            ;;
    esac
    
    service=$(select_service "🏗️ BUILD DE SERVICE - Sélectionnez le service à builder pour l'environnement ${env_name}")
    if [[ -n "$service" ]]; then
        echo -e "\n${BLUE}🏗️ Building du service: ${WHITE}$service${NC} en mode ${WHITE}${env_name}${NC}${NC}"
        echo -e "${YELLOW}⏳ Cette opération peut prendre plusieurs minutes...${NC}"
        if eval "docker-compose $compose_file build --no-cache $service"; then
            echo -e "\n${GREEN}✅ Service ${WHITE}$service${NC} buildé avec succès en mode ${WHITE}${env_name}${NC} !${NC}"
            echo -e "${CYAN}💡 Le service est maintenant prêt à être démarré${NC}"
        else
            echo -e "\n${RED}❌ ERREUR: Échec du build du service ${WHITE}$service${NC}${NC}"
            echo -e "${YELLOW}💡 Suggestions de résolution:${NC}"
            echo -e "   • Vérifiez votre connexion internet"
            echo -e "   • Assurez-vous d'avoir assez d'espace disque"
            echo -e "   • Consultez les logs d'erreur ci-dessus"
            echo -e "   • Tentez un nettoyage Docker avec l'option 15"
        fi
    else
        echo -e "\n${RED}❌ ERREUR: Aucun service sélectionné ou choix invalide${NC}"
        echo -e "${YELLOW}💡 AIDE - Comment bien choisir un service:${NC}"
        echo -e "   • Regardez la liste des services numérotés ci-dessus"
        echo -e "   • Entrez uniquement le NUMÉRO (1, 2, 3, 4 ou 5)"
        echo -e "   • Ne tapez pas le nom du service, juste son numéro"
        echo -e "   • Exemple: tapez '2' pour builder le service API"
    fi
    pause
}

# Fonction pour arrêter tous les services
stop_all() {
    echo -e "\n${RED}🛑 Arrêt de TOUS les services...${NC}"
    docker-compose down 2>/dev/null
    docker-compose -f docker-compose.prod.yml down 2>/dev/null
    docker-compose -f docker-compose.test.yml down 2>/dev/null
    echo -e "${GREEN}✅ Tous les services arrêtés !${NC}"
    pause
}

# Fonction de restart complet
full_restart() {
    echo -e "\n${YELLOW}🔄 Restart complet du projet...${NC}"
    echo "Choisissez l'environnement:"
    echo "  1) Développement"
    echo "  2) Production"
    read -p "Environnement (1-2): " env_choice
    
    echo "🛑 Arrêt des services..."
    stop_all
    
    if [[ "$env_choice" == "1" ]]; then
        start_development
    elif [[ "$env_choice" == "2" ]]; then
        start_production
    else
        echo -e "${RED}❌ Choix invalide${NC}"
        pause
    fi
}

# Fonction pour diagnostiquer la détection d'environnements (debug)
debug_environment_detection() {
    echo -e "\n${CYAN}🔍 DEBUG - Détection des environnements:${NC}"
    
    echo -e "\n${YELLOW}Test environnement DÉVELOPPEMENT:${NC}"
    echo "Commande: docker-compose ps"
    docker-compose ps 2>/dev/null || echo "Erreur"
    echo ""
    
    echo -e "${YELLOW}Test environnement PRODUCTION:${NC}"
    echo "Commande: docker-compose -f docker-compose.prod.yml ps"
    docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Erreur ou aucun container"
    echo ""
    
    echo -e "${YELLOW}Test environnement TEST:${NC}"
    echo "Commande: docker-compose -f docker-compose.test.yml ps api-test"
    docker-compose -f docker-compose.test.yml ps api-test 2>/dev/null || echo "Erreur ou aucun container de test"
    echo ""
    
    declare -A debug_envs
    detect_active_environments debug_envs
    
    echo -e "${CYAN}Résultat de la détection:${NC}"
    for env in "${!debug_envs[@]}"; do
        if [[ "${debug_envs[$env]}" == true ]]; then
            echo -e "  ✅ $env: ${GREEN}ACTIF${NC}"
        else
            echo -e "  ❌ $env: ${RED}INACTIF${NC}"
        fi
    done
    
    pause
}
