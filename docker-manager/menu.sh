#!/bin/bash

# Module du menu principal pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

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
                restart_service_in_env "" "développement"
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
                view_logs_prod
                ;;
            3)
                open_urls
                ;;
            4)
                show_resources
                ;;
            5)
                restart_service_in_env "-f docker-compose.prod.yml" "production"
                ;;
            6)
                backup_database_prod
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
