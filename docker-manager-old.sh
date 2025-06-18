#!/bin/bash

# SUPCHAT Docker Manager - Script principal
# Auteur: SUPCHAT Team
# Version: 2.0 - Modularisé

# Obtenir le répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULES_DIR="$SCRIPT_DIR/docker-manager"

# Vérifier que le répertoire des modules existe
if [[ ! -d "$MODULES_DIR" ]]; then
    echo "❌ Erreur: Le répertoire des modules '$MODULES_DIR' n'existe pas."
    echo "Assurez-vous que tous les fichiers de modules sont présents."
    exit 1
fi

# Importer tous les modules
source "$MODULES_DIR/utils.sh"
source "$MODULES_DIR/menu.sh"
source "$MODULES_DIR/environments.sh"
source "$MODULES_DIR/services.sh"
source "$MODULES_DIR/monitoring.sh"
source "$MODULES_DIR/utilities.sh"
source "$MODULES_DIR/tests.sh"

# Fonction principale
main() {
    # Vérifier les prérequis avant de commencer
    if ! check_prerequisites; then
        exit 1
    fi
    
    while true; do
        show_header
        show_status
        show_menu
        
        # Nettoyer le buffer d'entrée avant de lire
        clear_input_buffer
        read -p "Votre choix: " choice
        
        case $choice in
            1) start_development ;;
            2) start_production ;;
            3) quick_start_development ;;
            4) quick_start_production ;;
            5) quick_start_tests ;;
            6) start_service ;;
            7) stop_service ;;
            8) restart_service ;;
            9) build_service ;;
            10) show_status; pause ;;
            11) view_logs ;;
            12) follow_logs ;;
            13) open_shell ;;
            14) stop_all ;;
            15) cleanup ;;
            16) full_restart ;;
            17) backup_database ;;
            18) show_resources ;;
            19) open_urls ;;
            20) diagnostic_services ;;
            21) run_tests ;;
            0) 
                echo -e "\n${GREEN}👋 Au revoir !${NC}"
                exit 0
                ;;
            *)
                echo -e "\n${RED}❌ Choix invalide. Veuillez réessayer.${NC}"
                pause
                ;;
        esac
    done
}

# Afficher les informations de version et de structure
echo -e "${CYAN}🚀 SUPCHAT Docker Manager v2.0 - Modularisé${NC}"
echo -e "${YELLOW}📁 Structure modulaire chargée depuis: $MODULES_DIR${NC}"
echo ""

# Lancer le script principal
main

# Fonction pour afficher l'état des containers
show_status() {
    echo -e "\n${BLUE}📊 État actuel des containers:${NC}"
    echo "════════════════════════════════════════════════════════"
    if docker-compose ps 2>/dev/null | grep -q "supchat"; then
        docker-compose ps
    else
        echo -e "${YELLOW}Aucun container en cours d'exécution${NC}"
    fi
    echo ""
}

# Fonction pour afficher le menu principal
show_menu() {
    echo -e "${WHITE}ENVIRONNEMENTS COMPLETS (avec build):${NC}"
    echo -e "${GREEN}  1)${NC} 🚀 Lancer TOUT en DÉVELOPPEMENT (hot reload + build)"
    echo -e "${PURPLE}  2)${NC} 🏭 Lancer TOUT en PRODUCTION (optimisé + build)"
    echo ""
    echo -e "${WHITE}DÉMARRAGE RAPIDE (containers existants):${NC}"
    echo -e "${CYAN}  3)${NC} ⚡ Démarrage RAPIDE Développement (sans rebuild)"
    echo -e "${CYAN}  4)${NC} ⚡ Démarrage RAPIDE Production (sans rebuild)"
    echo -e "${CYAN}  5)${NC} ⚡ Démarrage RAPIDE Tests (sans rebuild)"
    echo ""
    echo -e "${WHITE}GESTION DES SERVICES:${NC}"
    echo -e "${CYAN}  6)${NC} 🔧 Démarrer un service spécifique"
    echo -e "${CYAN}  7)${NC} ⏹️  Arrêter un service spécifique"
    echo -e "${CYAN}  8)${NC} 🔄 Redémarrer un service spécifique"
    echo -e "${CYAN}  9)${NC} 🏗️  Builder/Rebuilder un service"
    echo ""
    echo -e "${WHITE}MONITORING & LOGS:${NC}"
    echo -e "${YELLOW} 10)${NC} 📊 Voir l'état des containers"
    echo -e "${YELLOW} 11)${NC} 📝 Voir les logs d'un service"
    echo -e "${YELLOW} 12)${NC} 📈 Suivre les logs en temps réel"
    echo -e "${YELLOW} 13)${NC} 🖥️  Ouvrir un shell dans un container"
    echo ""
    echo -e "${WHITE}MAINTENANCE:${NC}"
    echo -e "${RED} 14)${NC} 🛑 Arrêter TOUS les services"
    echo -e "${RED} 15)${NC} 🧹 Options de nettoyage (soft/complet)"
    echo -e "${RED} 16)${NC} 🔄 Restart complet (stop + build + start)"
    echo ""
    echo -e "${WHITE}UTILITAIRES:${NC}"
    echo -e "${BLUE} 17)${NC} 💾 Backup de la base de données"
    echo -e "${BLUE} 18)${NC} 📦 Voir l'utilisation des ressources"
    echo -e "${BLUE} 19)${NC} 🌐 Ouvrir les URLs de l'application"
    echo -e "${BLUE} 20)${NC} 🔍 Diagnostic des services (debug)"
    echo -e "${GREEN} 21)${NC} 🧪 Lancer les tests automatisés"
    echo ""
    echo -e "${WHITE}  0)${NC} ❌ Quitter"
    echo ""
    echo -e "${WHITE}════════════════════════════════════════════════════════${NC}"
}

# Fonction pour sélectionner un service
select_service() {
    local prompt="$1"
    echo -e "\n${CYAN}$prompt${NC}"
    echo "Services disponibles:"
    for i in "${!SERVICES[@]}"; do
        echo "  $((i+1))) ${SERVICES[$i]}"
    done
    echo ""
    read -p "Sélectionnez un service (numéro): " service_choice
    
    # Vérifier si l'entrée est un nombre valide
    if [[ "$service_choice" =~ ^[0-9]+$ ]] && [[ $service_choice -ge 1 && $service_choice -le ${#SERVICES[@]} ]]; then
        echo "${SERVICES[$((service_choice-1))]}"
    else
        echo ""
    fi
}





# Fonction pour afficher les instructions pour consulter les logs

# Fonction pour lancer l'environnement de développement
start_development() {
    echo -e "\n${GREEN}🚀 Démarrage de l'environnement de DÉVELOPPEMENT...${NC}"
    echo -e "${YELLOW}Mode: Hot reload activé pour tous les services${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${BLUE}Building images de développement...${NC}"
    docker-compose build --no-cache
    
    echo -e "\n${BLUE}Démarrage des services...${NC}"
    docker-compose up -d
    
    echo -e "\n${GREEN}✅ Environnement de développement démarré !${NC}"
    echo -e "${CYAN}📍 URLs disponibles:${NC}"
    echo "   • Web (Frontend): http://localhost:80"
    echo "   • API (Backend): http://localhost:3000"
    echo "   • MongoDB: localhost:27017"
    echo "   • cAdvisor (Monitoring): http://localhost:8080"
    
    # Petite pause pour que l'utilisateur puisse lire les URLs
    sleep 2
    
    # Menu post-démarrage
    while true; do
        echo ""
        echo -e "${WHITE}🎯 Services de développement démarrés - Que voulez-vous faire ?${NC}"
        echo -e "${GREEN}  1)${NC} 📊 Voir l'état des services"
        echo -e "${GREEN}  2)${NC} 📝 Voir les logs d'un service"
        echo -e "${GREEN}  3)${NC} 🌐 Ouvrir les URLs de l'application"
        echo -e "${YELLOW}  4)${NC} 🔄 Redémarrer un service"
        echo -e "${RED}  5)${NC} 🛑 Arrêter TOUS les services de développement"
        echo -e "${BLUE}  0)${NC} ⬅️  Retour au menu principal"
        echo ""
        
        # Nettoyer le buffer d'entrée avant de lire
        clear_input_buffer
        echo -n "Votre choix: "
        read post_choice
        
        # Validation de l'entrée
        case $post_choice in
            1)
                echo -e "\n${BLUE}📊 État des services de développement:${NC}"
                docker-compose ps
                pause
                ;;
            2)
                view_logs
                ;;
            3)
                open_urls
                ;;
            4)
                restart_service
                ;;
            5)
                echo -e "\n${RED}🛑 Arrêt des services de développement...${NC}"
                docker-compose down
                echo -e "${GREEN}✅ Services de développement arrêtés !${NC}"
                pause
                return
                ;;
            0)
                echo -e "${BLUE}Retour au menu principal...${NC}"
                return
                ;;
            *)
                echo -e "${RED}❌ Choix invalide. Veuillez réessayer.${NC}"
                ;;
        esac
    done
}

# Fonction pour lancer l'environnement de production
start_production() {
    echo -e "\n${PURPLE}🏭 Démarrage de l'environnement de PRODUCTION...${NC}"
    echo -e "${YELLOW}Mode: Images optimisées + Health checks${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${BLUE}Building images de production...${NC}"
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    echo -e "\n${BLUE}Démarrage des services...${NC}"
    docker-compose -f docker-compose.prod.yml up -d
    
    echo -e "\n${GREEN}✅ Environnement de production démarré !${NC}"
    echo -e "${CYAN}📍 URLs disponibles:${NC}"
    echo "   • Web (Frontend): http://localhost:80"
    echo "   • API (Backend): http://localhost:3000"
    echo "   • MongoDB: localhost:27017"
    echo "   • cAdvisor (Monitoring): http://localhost:8080"
    
    # Menu post-démarrage
    while true; do
        echo ""
        echo -e "${WHITE}🎯 Services de production démarrés - Que voulez-vous faire ?${NC}"
        echo -e "${GREEN}  1)${NC} 📊 Voir l'état des services"
        echo -e "${GREEN}  2)${NC} 📝 Voir les logs d'un service"
        echo -e "${GREEN}  3)${NC} 🌐 Ouvrir les URLs de l'application"
        echo -e "${GREEN}  4)${NC} 📦 Voir l'utilisation des ressources"
        echo -e "${YELLOW}  5)${NC} 🔄 Redémarrer un service"
        echo -e "${YELLOW}  6)${NC} 💾 Backup de la base de données"
        echo -e "${RED}  7)${NC} 🛑 Arrêter TOUS les services de production"
        echo -e "${BLUE}  0)${NC} ⬅️  Retour au menu principal"
        echo ""
        
        # Nettoyer le buffer d'entrée avant de lire
        clear_input_buffer
        read -p "Votre choix: " post_choice
        
        case $post_choice in
            1)
                echo -e "\n${BLUE}📊 État des services de production:${NC}"
                docker-compose -f docker-compose.prod.yml ps
                pause
                ;;
            2)
                # Adapter view_logs pour la production
                service=$(select_service "De quel service voulez-vous voir les logs (production) ?")
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
                ;;
            3)
                open_urls
                ;;
            4)
                show_resources
                ;;
            5)
                # Adapter restart_service pour la production
                service=$(select_service "Quel service voulez-vous redémarrer (production) ?")
                if [[ -n "$service" ]]; then
                    echo -e "\n${YELLOW}🔄 Redémarrage du service: $service (production)${NC}"
                    if docker-compose -f docker-compose.prod.yml restart "$service"; then
                        echo -e "${GREEN}✅ Service $service redémarré !${NC}"
                    else
                        echo -e "${RED}❌ Erreur lors du redémarrage du service $service${NC}"
                    fi
                else
                    echo -e "${RED}❌ Service invalide.${NC}"
                fi
                pause
                ;;
            6)
                # Adapter backup pour la production
                echo -e "\n${BLUE}💾 Backup de la base de données MongoDB (production)...${NC}"
                if docker-compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
                    backup_dir="./backups"
                    mkdir -p "$backup_dir"
                    
                    timestamp=$(date +"%Y%m%d_%H%M%S")
                    backup_file="$backup_dir/mongodb_backup_prod_$timestamp"
                    
                    echo "📦 Création du backup..."
                    docker-compose -f docker-compose.prod.yml exec -T db mongodump --out /tmp/backup
                    docker-compose -f docker-compose.prod.yml exec -T db tar -czf "/tmp/backup_$timestamp.tar.gz" -C /tmp backup
                    docker cp "$(docker-compose -f docker-compose.prod.yml ps -q db):/tmp/backup_$timestamp.tar.gz" "$backup_file.tar.gz"
                    
                    echo -e "${GREEN}✅ Backup créé: $backup_file.tar.gz${NC}"
                else
                    echo -e "${RED}❌ Le container de base de données n'est pas en cours d'exécution${NC}"
                fi
                pause
                ;;
            7)
                echo -e "\n${RED}🛑 Arrêt des services de production...${NC}"
                docker-compose -f docker-compose.prod.yml down
                echo -e "${GREEN}✅ Services de production arrêtés !${NC}"
                pause
                return
                ;;
            0)
                echo -e "${BLUE}Retour au menu principal...${NC}"
                return
                ;;
            *)
                echo -e "${RED}❌ Choix invalide. Veuillez réessayer.${NC}"
                ;;
        esac
    done
}

# Menu post-démarrage pour l'environnement de développement
post_start_menu() {
    local env_name="$1"
    
    while true; do
        echo ""
        echo -e "${WHITE}🎯 Services de ${env_name} démarrés - Que voulez-vous faire ?${NC}"
        echo -e "${GREEN}  1)${NC} 📊 Voir l'état des services"
        echo -e "${GREEN}  2)${NC} 📝 Voir les logs d'un service"
        echo -e "${GREEN}  3)${NC} 🌐 Ouvrir les URLs de l'application"
        echo -e "${YELLOW}  4)${NC} 🔄 Redémarrer un service"
        echo -e "${RED}  5)${NC} 🛑 Arrêter TOUS les services de ${env_name}"
        echo -e "${BLUE}  0)${NC} ⬅️  Retour au menu principal"
        echo ""
        
        # Nettoyer le buffer d'entrée avant de lire
        clear_input_buffer
        read -p "Votre choix: " post_choice
        
        case $post_choice in
            1)
                echo -e "\n${BLUE}📊 État des services de ${env_name}:${NC}"
                docker-compose ps
                pause
                ;;
            2)
                view_logs
                ;;
            3)
                open_urls
                ;;
            4)
                restart_service
                ;;
            5)
                echo -e "\n${RED}🛑 Arrêt des services de ${env_name}...${NC}"
                docker-compose down
                echo -e "${GREEN}✅ Services de ${env_name} arrêtés !${NC}"
                pause
                return
                ;;
            0)
                echo -e "${BLUE}Retour au menu principal...${NC}"
                return
                ;;
            *)
                echo -e "${RED}❌ Choix invalide. Veuillez réessayer.${NC}"
                ;;
        esac
    done
}

# Menu post-démarrage pour l'environnement de production
post_start_menu_prod() {
    local env_name="$1"
    
    while true; do
        echo ""
        echo -e "${WHITE}🏭 Services de ${env_name} démarrés - Que voulez-vous faire ?${NC}"
        echo -e "${GREEN}  1)${NC} 📊 Voir l'état des services"
        echo -e "${GREEN}  2)${NC} 📝 Voir les logs d'un service"
        echo -e "${GREEN}  3)${NC} 🌐 Ouvrir les URLs de l'application"
        echo -e "${GREEN}  4)${NC} 📊 Monitorer les ressources"
        echo -e "${YELLOW}  5)${NC} 🔄 Redémarrer un service"
        echo -e "${YELLOW}  6)${NC} 💾 Backup base de données"
        echo -e "${RED}  7)${NC} 🛑 Arrêter TOUS les services de ${env_name}"
        echo -e "${BLUE}  0)${NC} ⬅️  Retour au menu principal"
        echo ""
        
        # Nettoyer le buffer d'entrée avant de lire
        clear_input_buffer
        read -p "Votre choix: " post_choice
        
        case $post_choice in
            1)
                echo -e "\n${BLUE}📊 État des services de ${env_name}:${NC}"
                docker-compose -f docker-compose.prod.yml ps
                pause
                ;;
            2)
                # Adapter view_logs pour la production
                service=$(select_service "Pour quel service voulez-vous voir les logs (production) ?")
                if [[ -n "$service" ]]; then
                    echo -e "\n${CYAN}📋 Logs du service: $service (production)${NC}"
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
                ;;
            3)
                open_urls
                ;;
            4)
                show_resources
                ;;
            5)
                # Adapter restart_service pour la production
                service=$(select_service "Quel service voulez-vous redémarrer (production) ?")
                if [[ -n "$service" ]]; then
                    echo -e "\n${YELLOW}🔄 Redémarrage du service: $service (production)${NC}"
                    if docker-compose -f docker-compose.prod.yml restart "$service"; then
                        echo -e "${GREEN}✅ Service $service redémarré !${NC}"
                    else
                        echo -e "${RED}❌ Erreur lors du redémarrage du service $service${NC}"
                    fi
                else
                    echo -e "${RED}❌ Service invalide.${NC}"
                fi
                pause
                ;;
            6)
                # Adapter backup pour la production
                echo -e "\n${BLUE}💾 Backup de la base de données MongoDB (production)...${NC}"
                if docker-compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
                    backup_dir="./backups"
                    mkdir -p "$backup_dir"
                    
                    timestamp=$(date +"%Y%m%d_%H%M%S")
                    backup_file="$backup_dir/mongodb_backup_prod_$timestamp"
                    
                    echo "📦 Création du backup..."
                    docker-compose -f docker-compose.prod.yml exec -T db mongodump --out /tmp/backup
                    docker-compose -f docker-compose.prod.yml exec -T db tar -czf "/tmp/backup_$timestamp.tar.gz" -C /tmp backup
                    docker cp "$(docker-compose -f docker-compose.prod.yml ps -q db):/tmp/backup_$timestamp.tar.gz" "$backup_file.tar.gz"
                    
                    echo -e "${GREEN}✅ Backup créé: $backup_file.tar.gz${NC}"
                else
                    echo -e "${RED}❌ Le container de base de données n'est pas en cours d'exécution${NC}"
                fi
                pause
                ;;
            7)
                echo -e "\n${RED}🛑 Arrêt des services de ${env_name}...${NC}"
                docker-compose -f docker-compose.prod.yml down
                echo -e "${GREEN}✅ Services de ${env_name} arrêtés !${NC}"
                pause
                return
                ;;
            0)
                echo -e "${BLUE}Retour au menu principal...${NC}"
                return
                ;;
            *)
                echo -e "${RED}❌ Choix invalide. Veuillez réessayer.${NC}"
                ;;
        esac
    done
}

# Fonction helper pour redémarrer un service dans un environnement spécifique
restart_service_in_env() {
    local compose_file="$1"
    local env_name="$2"
    
    service=$(select_service "Quel service voulez-vous redémarrer (${env_name}) ?")
    if [[ -n "$service" ]]; then
        echo -e "\n${BLUE}🔍 Vérification de l'état du service...${NC}"
        if eval "docker-compose $compose_file ps $service" | grep -q "Up"; then
            echo -e "\n${YELLOW}🔄 Redémarrage du service: $service (${env_name})${NC}"
            if eval "docker-compose $compose_file restart $service"; then
                echo -e "${GREEN}✅ Service $service redémarré avec succès !${NC}"
                
                # Afficher l'état après redémarrage
                echo -e "\n${CYAN}📊 État du service après redémarrage:${NC}"
                eval "docker-compose $compose_file ps $service"
            else
                echo -e "${RED}❌ Erreur lors du redémarrage du service $service${NC}"
            fi
        else
            echo -e "${RED}❌ Le service $service n'est pas en cours d'exécution dans l'environnement ${env_name}${NC}"
            echo -e "${YELLOW}💡 Conseil: Vérifiez l'état des services avec l'option d'état${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide.${NC}"
    fi
    pause
}

# Fonction pour redémarrer un service spécifique
restart_service() {
    # Détection automatique des environnements actifs
    dev_active=false
    prod_active=false
    test_active=false
    
    # Vérifier quels environnements sont actifs
    if docker-compose ps 2>/dev/null | grep -q "Up"; then
        dev_active=true
    fi
    
    if docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "Up"; then
        prod_active=true
    fi
    
    if docker-compose -f docker-compose.test.yml ps 2>/dev/null | grep -q "Up"; then
        test_active=true
    fi
    
    # Déterminer l'environnement à utiliser
    compose_file=""
    env_name=""
    
    # Si plusieurs environnements sont actifs, demander à l'utilisateur
    active_count=$((dev_active + prod_active + test_active))
    
    if [[ $active_count -eq 0 ]]; then
        echo -e "\n${RED}❌ Aucun environnement Docker n'est en cours d'exécution${NC}"
        echo -e "${YELLOW}💡 Conseil: Démarrez d'abord un environnement avec les options 1, 2, 3, 4 ou 5${NC}"
        pause
        return 1
    elif [[ $active_count -eq 1 ]]; then
        # Un seul environnement actif - sélection automatique
        if [[ "$dev_active" == true ]]; then
            compose_file=""
            env_name="développement"
        elif [[ "$prod_active" == true ]]; then
            compose_file="-f docker-compose.prod.yml"
            env_name="production"
        elif [[ "$test_active" == true ]]; then
            compose_file="-f docker-compose.test.yml"
            env_name="test"
        fi
        echo -e "\n${CYAN}🎯 Environnement détecté: ${env_name}${NC}"
    else
        # Plusieurs environnements actifs - demander à l'utilisateur
        echo -e "\n${YELLOW}⚠️ Plusieurs environnements sont actifs:${NC}"
        local env_options=()
        local compose_options=()
        local env_names=()
        
        if [[ "$dev_active" == true ]]; then
            env_options+=("Développement")
            compose_options+=("")
            env_names+=("développement")
        fi
        
        if [[ "$prod_active" == true ]]; then
            env_options+=("Production")
            compose_options+=("-f docker-compose.prod.yml")
            env_names+=("production")
        fi
        
        if [[ "$test_active" == true ]]; then
            env_options+=("Test")
            compose_options+=("-f docker-compose.test.yml")
            env_names+=("test")
        fi
        
        echo "Dans quel environnement voulez-vous redémarrer le service ?"
        for i in "${!env_options[@]}"; do
            echo "  $((i+1))) ${env_options[$i]}"
        done
        echo ""
        read -p "Environnement (1-${#env_options[@]}): " env_choice
        
        if [[ "$env_choice" =~ ^[0-9]+$ ]] && [[ $env_choice -ge 1 && $env_choice -le ${#env_options[@]} ]]; then
            compose_file="${compose_options[$((env_choice-1))]}"
            env_name="${env_names[$((env_choice-1))]}"
        else
            echo -e "${RED}❌ Choix d'environnement invalide${NC}"
            pause
            return 1
        fi
    fi
    
    # Sélection du service
    service=$(select_service "Quel service voulez-vous redémarrer dans l'environnement ${env_name} ?")
    if [[ -n "$service" ]]; then
        # Vérifier que le service existe et est en cours d'exécution
        echo -e "\n${BLUE}🔍 Vérification de l'état du service...${NC}"
        if eval "docker-compose $compose_file ps $service" | grep -q "Up"; then
            echo -e "\n${YELLOW}🔄 Redémarrage du service: $service (${env_name})${NC}"
            if eval "docker-compose $compose_file restart $service"; then
                echo -e "${GREEN}✅ Service $service redémarré avec succès dans l'environnement ${env_name} !${NC}"
                
                # Afficher l'état après redémarrage
                echo -e "\n${CYAN}📊 État du service après redémarrage:${NC}"
                eval "docker-compose $compose_file ps $service"
            else
                echo -e "${RED}❌ Erreur lors du redémarrage du service $service${NC}"
            fi
        else
            echo -e "${RED}❌ Le service $service n'est pas en cours d'exécution dans l'environnement ${env_name}${NC}"
            echo -e "${YELLOW}💡 Conseil: Démarrez d'abord le service avec l'option 6 du menu${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide. Veuillez choisir un numéro entre 1 et ${#SERVICES[@]}.${NC}"
    fi
    pause
}

# Fonction pour builder un service
build_service() {
    service=$(select_service "Quel service voulez-vous builder ?")
    if [[ -n "$service" ]]; then
        echo -e "\n${BLUE}🏗️ Building du service: $service${NC}"
        echo "Choisissez le mode:"
        echo "  1) Développement (Dockerfile.dev)"
        echo "  2) Production (Dockerfile)"
        read -p "Mode (1-2): " mode_choice
        
        if [[ "$mode_choice" == "1" ]]; then
            docker-compose build --no-cache "$service"
            echo -e "${GREEN}✅ Service $service buildé en mode développement !${NC}"
        elif [[ "$mode_choice" == "2" ]]; then
            docker-compose -f docker-compose.prod.yml build --no-cache "$service"
            echo -e "${GREEN}✅ Service $service buildé en mode production !${NC}"
        else
            echo -e "${RED}❌ Mode invalide${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide${NC}"
    fi
    pause
}

# Fonction pour voir les logs d'un service
view_logs() {
    echo -e "\n${CYAN}De quel service voulez-vous voir les logs ?${NC}"
    echo "Services disponibles:"
    for i in "${!SERVICES[@]}"; do
        echo "  $((i+1))) ${SERVICES[$i]}"
    done
    echo ""
    read -p "Sélectionnez un service (numéro): " service_choice
    
    # Vérifier si l'entrée est un nombre valide
    if [[ "$service_choice" =~ ^[0-9]+$ ]] && [[ $service_choice -ge 1 && $service_choice -le ${#SERVICES[@]} ]]; then
        service="${SERVICES[$((service_choice-1))]}"
        echo -e "\n${YELLOW}📝 Logs du service: $service${NC}"
        echo "════════════════════════════════════════════════════════"
        echo -e "${CYAN}Affichage des 50 dernières lignes de logs...${NC}"
        if docker-compose logs --tail=50 "$service"; then
            echo -e "\n${GREEN}✅ Logs affichés avec succès${NC}"
        else
            echo -e "\n${RED}❌ Erreur lors de l'affichage des logs pour le service $service${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide. Veuillez choisir un numéro entre 1 et ${#SERVICES[@]}.${NC}"
    fi
    pause
}

# Fonction pour suivre les logs en temps réel
follow_logs() {
    echo -e "\n${CYAN}De quel service voulez-vous suivre les logs ?${NC}"
    echo "Services disponibles:"
    for i in "${!SERVICES[@]}"; do
        echo "  $((i+1))) ${SERVICES[$i]}"
    done
    echo ""
    read -p "Sélectionnez un service (numéro): " service_choice
    
    # Vérifier si l'entrée est un nombre valide
    if [[ "$service_choice" =~ ^[0-9]+$ ]] && [[ $service_choice -ge 1 && $service_choice -le ${#SERVICES[@]} ]]; then
        service="${SERVICES[$((service_choice-1))]}"
        echo -e "\n${YELLOW}📈 Logs en temps réel du service: $service${NC}"
        echo -e "${CYAN}Appuyez sur Ctrl+C pour arrêter${NC}"
        echo "════════════════════════════════════════════════════════"
        if docker-compose logs -f "$service"; then
            echo -e "\n${GREEN}✅ Suivi des logs terminé${NC}"
        else
            echo -e "\n${RED}❌ Erreur lors du suivi des logs pour le service $service${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide. Veuillez choisir un numéro entre 1 et ${#SERVICES[@]}.${NC}"
    fi
    pause
}

# Fonction pour ouvrir les terminaux de logs depuis le menu

# Fonction pour ouvrir un shell dans un container
open_shell() {
    service=$(select_service "Dans quel container voulez-vous ouvrir un shell ?")
    if [[ -n "$service" ]]; then
        echo -e "\n${CYAN}🖥️ Ouverture d'un shell dans: $service${NC}"
        
        # Vérifier si le container est en cours d'exécution
        if docker-compose ps "$service" | grep -q "Up"; then
            case "$service" in
                "web"|"api"|"mobile")
                    docker-compose exec "$service" /bin/sh
                    ;;
                "db")
                    echo "Choix disponibles:"
                    echo "  1) Shell bash/sh"
                    echo "  2) MongoDB shell (mongosh)"
                    read -p "Votre choix (1-2): " shell_choice
                    if [[ "$shell_choice" == "1" ]]; then
                        docker-compose exec "$service" /bin/bash
                    elif [[ "$shell_choice" == "2" ]]; then
                        docker-compose exec "$service" mongosh
                    fi
                    ;;
                *)
                    docker-compose exec "$service" /bin/sh
                    ;;
            esac
        else
            echo -e "${RED}❌ Le container $service n'est pas en cours d'exécution${NC}"
            pause
        fi
    else
        echo -e "${RED}❌ Service invalide${NC}"
        pause
    fi
}

# Fonction pour arrêter tous les services
stop_all() {
    echo -e "\n${RED}🛑 Arrêt de TOUS les services...${NC}"
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✅ Tous les services arrêtés !${NC}"
    pause
}

# Fonction de nettoyage complet
cleanup() {
    echo -e "\n${RED}🧹 Options de nettoyage du projet...${NC}"
    echo "════════════════════════════════════════════════════════"
    echo -e "${WHITE}Choisissez le type de nettoyage :${NC}"
    echo -e "${YELLOW}  1)${NC} 🔄 Nettoyage SOFT (containers + images, GARDE les volumes)"
    echo -e "${RED}  2)${NC} 💥 Nettoyage COMPLET (containers + images + volumes - PERTE DE DONNÉES)"
    echo -e "${CYAN}  3)${NC} 📊 Voir ce qui sera supprimé"
    echo -e "${WHITE}  0)${NC} ❌ Annuler"
    echo ""
    read -p "Votre choix (0-3): " cleanup_choice
    
    case $cleanup_choice in
        1)
            echo -e "\n${YELLOW}🔄 Nettoyage SOFT (préservation des données)...${NC}"
            echo -e "${GREEN}✅ Les volumes (base de données) seront PRÉSERVÉS${NC}"
            read -p "Continuer ? (y/N): " confirm
            
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                echo "🛑 Arrêt des services..."
                docker-compose down
                docker-compose -f docker-compose.prod.yml down
                
                echo "🗑️ Suppression des images..."
                docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f
                
                echo "🧽 Nettoyage des ressources non utilisées..."
                docker system prune -f
                
                echo -e "${GREEN}✅ Nettoyage SOFT terminé ! Données préservées.${NC}"
            else
                echo -e "${YELLOW}Nettoyage annulé${NC}"
            fi
            ;;
        2)
            echo -e "\n${RED}💥 Nettoyage COMPLET (DESTRUCTEUR)...${NC}"
            echo -e "${RED}⚠️  ATTENTION: Cela va supprimer:${NC}"
            echo "   • Tous les containers"
            echo "   • Toutes les images du projet"
            echo -e "${RED}   • TOUS LES VOLUMES (base de données MongoDB)${NC}"
            echo -e "${RED}   • TOUS LES FICHIERS STOCKÉS${NC}"
            echo ""
            echo -e "${YELLOW}💡 Conseil: Utilisez l'option 14 (Backup) avant ce nettoyage${NC}"
            echo ""
            read -p "Êtes-vous VRAIMENT sûr ? Tapez 'DELETE' pour confirmer: " confirm
            
            if [[ "$confirm" == "DELETE" ]]; then
                echo "🛑 Arrêt des services..."
                docker-compose down -v
                docker-compose -f docker-compose.prod.yml down -v
                
                echo "🗑️ Suppression des images..."
                docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f
                
                echo "🧽 Nettoyage des ressources non utilisées..."
                docker system prune -f
                
                echo -e "${GREEN}✅ Nettoyage COMPLET terminé ! Toutes les données supprimées.${NC}"
            else
                echo -e "${YELLOW}Nettoyage COMPLET annulé (bonne décision !)${NC}"
            fi
            ;;
        3)
            echo -e "\n${CYAN}📊 Analyse de ce qui serait supprimé...${NC}"
            echo ""
            echo -e "${BLUE}🐳 Containers en cours:${NC}"
            docker-compose ps
            echo ""
            echo -e "${BLUE}🖼️ Images du projet:${NC}"
            docker images | grep "$PROJECT_NAME" || echo "Aucune image trouvée"
            echo ""
            echo -e "${BLUE}💾 Volumes du projet:${NC}"
            docker volume ls | grep "$PROJECT_NAME" || echo "Aucun volume nommé trouvé"
            docker-compose config --volumes 2>/dev/null || echo "Utilisation des volumes définis dans docker-compose.yml"
            echo ""
            echo -e "${YELLOW}💡 Volumes principaux:${NC}"
            echo "   • mongo-data (base de données MongoDB)"
            echo "   • Volumes de développement (code mappé)"
            ;;
        0|*)
            echo -e "${YELLOW}Nettoyage annulé${NC}"
            ;;
    esac
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

# Fonction de backup de la base de données
backup_database() {
    echo -e "\n${BLUE}💾 Backup de la base de données MongoDB...${NC}"
    
    # Vérifier si le container db est en cours d'exécution
    if docker-compose ps db | grep -q "Up"; then
        backup_dir="./backups"
        mkdir -p "$backup_dir"
        
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_file="$backup_dir/mongodb_backup_$timestamp"
        
        echo "📦 Création du backup..."
        docker-compose exec -T db mongodump --out /tmp/backup
        docker-compose exec -T db tar -czf "/tmp/backup_$timestamp.tar.gz" -C /tmp backup
        docker cp "$(docker-compose ps -q db):/tmp/backup_$timestamp.tar.gz" "$backup_file.tar.gz"
        
        echo -e "${GREEN}✅ Backup créé: $backup_file.tar.gz${NC}"
    else
        echo -e "${RED}❌ Le container de base de données n'est pas en cours d'exécution${NC}"
    fi
    pause
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

# Fonction pour ouvrir les URLs de l'application
open_urls() {
    echo -e "\n${BLUE}🌐 URLs de l'application SUPCHAT:${NC}"
    echo "════════════════════════════════════════════════════════"
    echo -e "${GREEN}Frontend (Web):${NC}     http://localhost:80"
    echo -e "${GREEN}API (Backend):${NC}      http://localhost:3000"
    echo -e "${GREEN}API Health:${NC}         http://localhost:3000/api/health"
    echo -e "${GREEN}API Docs (Swagger):${NC} http://localhost:3000/api-docs"
    echo -e "${GREEN}MongoDB:${NC}            localhost:27017"
    echo -e "${GREEN}cAdvisor:${NC}           http://localhost:8080"
    echo ""
    
    read -p "Voulez-vous ouvrir une URL dans le navigateur ? (y/N): " open_browser
    if [[ "$open_browser" =~ ^[Yy]$ ]]; then
        echo "Quelle URL voulez-vous ouvrir ?"
        echo "  1) Frontend (Web)"
        echo "  2) API Health Check"
        echo "  3) API Documentation"
        echo "  4) cAdvisor (Monitoring)"
        read -p "Choix (1-4): " url_choice
        
        case "$url_choice" in
            1) xdg-open "http://localhost:80" 2>/dev/null || open "http://localhost:80" 2>/dev/null || start "http://localhost:80" 2>/dev/null ;;
            2) xdg-open "http://localhost:3000/api/health" 2>/dev/null || open "http://localhost:3000/api/health" 2>/dev/null || start "http://localhost:3000/api/health" 2>/dev/null ;;
            3) xdg-open "http://localhost:3000/api-docs" 2>/dev/null || open "http://localhost:3000/api-docs" 2>/dev/null || start "http://localhost:3000/api-docs" 2>/dev/null ;;
            4) xdg-open "http://localhost:8080" 2>/dev/null || open "http://localhost:8080" 2>/dev/null || start "http://localhost:8080" 2>/dev/null ;;
            *) echo -e "${RED}❌ Choix invalide${NC}" ;;
        esac
    fi
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
    
    echo -e "\n${CYAN}🐳 État détaillé des containers:${NC}"
    docker-compose ps -a
    
    echo -e "\n${CYAN}🔗 Services dans docker-compose.yml:${NC}"
    docker-compose config --services 2>/dev/null || echo "Erreur lors de la lecture de docker-compose.yml"
    
    echo -e "\n${CYAN}📊 Test de connectivité aux services:${NC}"
    for service in "${SERVICES[@]}"; do
        echo -n "  • $service: "
        if docker-compose ps "$service" | grep -q "Up"; then
            echo -e "${GREEN}✅ En fonctionnement${NC}"
            echo "    Logs récents:"
            docker-compose logs --tail=3 "$service" 2>/dev/null | sed 's/^/      /' || echo "      Erreur lors de la lecture des logs"
        else
            echo -e "${RED}❌ Arrêté ou non trouvé${NC}"
        fi
        echo ""
    done
    
    echo -e "${CYAN}🔧 Informations de debugging:${NC}"
    echo "  • Docker version: $(docker --version 2>/dev/null || echo 'Non disponible')"
    echo "  • Docker Compose version: $(docker-compose --version 2>/dev/null || echo 'Non disponible')"
    echo "  • Répertoire courant: $(pwd)"
    echo "  • Fichiers docker-compose disponibles:"
    ls -la docker-compose*.yml 2>/dev/null | sed 's/^/    /' || echo "    Aucun fichier docker-compose trouvé"
    
    pause
}

# Fonction pour lancer les tests automatisés
run_tests() {
    echo -e "\n${GREEN}🧪 Lancement des tests automatisés...${NC}"
    echo "════════════════════════════════════════════════════════"
    
    # Vérifier si docker-compose.test.yml existe
    if [[ ! -f "docker-compose.test.yml" ]]; then
        echo -e "${RED}❌ Erreur: docker-compose.test.yml non trouvé${NC}"
        echo "Ce fichier est nécessaire pour l'environnement de test isolé."
        pause
        return 1
    fi
    
    echo -e "\n${CYAN}🚀 Options de test disponibles:${NC}"
    echo -e "${WHITE}  1)${NC} 🏃 Lancer tous les tests"
    echo -e "${WHITE}  2)${NC} 📊 Lancer les tests avec couverture"
    echo -e "${WHITE}  3)${NC} 🔍 Tests spécifiques (routes utilisateur)"
    echo -e "${WHITE}  4)${NC} 🔧 Mode debug (logs détaillés)"
    echo -e "${WHITE}  5)${NC} 🧹 Nettoyer l'environnement de test"
    echo -e "${WHITE}  0)${NC} ❌ Retour au menu principal"
    echo ""
    read -p "Votre choix (0-5): " test_choice
    
    case $test_choice in
        1)
            echo -e "\n${BLUE}🚀 Démarrage de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml up -d
            
            echo -e "\n${BLUE}⏳ Attente que les services soient prêts...${NC}"
            sleep 5
            
            echo -e "\n${GREEN}🧪 Exécution de tous les tests...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm test
            
            echo -e "\n${YELLOW}🛑 Arrêt de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml down
            ;;
        2)
            echo -e "\n${BLUE}🚀 Démarrage de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml up -d
            
            echo -e "\n${BLUE}⏳ Attente que les services soient prêts...${NC}"
            sleep 5
            
            echo -e "\n${GREEN}📊 Exécution des tests avec couverture...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm run test:coverage
            
            echo -e "\n${YELLOW}🛑 Arrêt de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml down
            ;;
        3)
            echo -e "\n${BLUE}🚀 Démarrage de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml up -d
            
            echo -e "\n${BLUE}⏳ Attente que les services soient prêts...${NC}"
            sleep 5
            
            echo -e "\n${GREEN}🔍 Tests des routes utilisateur...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm test -- --testNamePattern="user"
            
            echo -e "\n${YELLOW}🛑 Arrêt de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml down
            ;;
        4)
            echo -e "\n${BLUE}🚀 Démarrage de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml up -d
            
            echo -e "\n${BLUE}⏳ Attente que les services soient prêts...${NC}"
            sleep 5
            
            echo -e "\n${GREEN}🔧 Tests en mode debug...${NC}"
            echo -e "${CYAN}Logs détaillés activés${NC}"
            docker-compose -f docker-compose.test.yml exec api sh -c "DEBUG=* npm test"
            
            echo -e "\n${YELLOW}🛑 Arrêt de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml down
            ;;
        5)
            echo -e "\n${YELLOW}🧹 Nettoyage de l'environnement de test...${NC}"
            echo -e "${RED}⚠️  Cela va supprimer:${NC}"
            echo "   • Les containers de test"
            echo "   • Les volumes de test (base de données de test)"
            echo ""
            read -p "Confirmer le nettoyage ? (y/N): " confirm
            
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                echo "🛑 Arrêt et suppression des containers de test..."
                docker-compose -f docker-compose.test.yml down -v
                
                echo "🗑️ Suppression des images de test..."
                docker images | grep "test" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null
                
                echo -e "${GREEN}✅ Environnement de test nettoyé !${NC}"
            else
                echo -e "${YELLOW}Nettoyage annulé${NC}"
            fi
            ;;
        0)
            echo -e "${YELLOW}Retour au menu principal...${NC}"
            return 0
            ;;
        *)
            echo -e "\n${RED}❌ Choix invalide.${NC}"
            ;;
    esac
    
    echo -e "\n${CYAN}💡 Conseils pour les tests:${NC}"
    echo "   • Consultez docs/guides/GUIDE-TESTS-DOCKER.md pour plus d'informations"
    echo "   • Les tests utilisent une base de données isolée (db-test)"
    echo "   • Aucune donnée de développement n'est affectée"
    
    pause
}


# Fonction principale
main() {
    while true; do
        show_header
        show_status
        show_menu
        
        # Nettoyer le buffer d'entrée avant de lire
        clear_input_buffer
        read -p "Votre choix: " choice
        
        case $choice in
            1) start_development ;;
            2) start_production ;;
            3) quick_start_development ;;
            4) quick_start_production ;;
            5) quick_start_tests ;;
            6) start_service ;;
            7) stop_service ;;
            8) restart_service ;;
            9) build_service ;;
            10) show_status; pause ;;
            11) view_logs ;;
            12) follow_logs ;;
            13) open_shell ;;
            14) stop_all ;;
            15) cleanup ;;
            16) full_restart ;;
            17) backup_database ;;
            18) show_resources ;;
            19) open_urls ;;
            20) diagnostic_services ;;
            21) run_tests ;;
            0) 
                echo -e "\n${GREEN}👋 Au revoir !${NC}"
                exit 0
                ;;
            *)
                echo -e "\n${RED}❌ Choix invalide. Veuillez réessayer.${NC}"
                pause
                ;;
        esac
    done
}

# Vérifier que Docker et Docker Compose sont installés
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé ou n'est pas dans le PATH${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé ou n'est pas dans le PATH${NC}"
    exit 1
fi

# Vérifier que nous sommes dans le bon répertoire
if [[ ! -f "docker-compose.yml" ]]; then
    echo -e "${RED}❌ Fichier docker-compose.yml non trouvé. Assurez-vous d'être dans le répertoire racine du projet.${NC}"
    exit 1
fi

# Lancer le script principal
main
