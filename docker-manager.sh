#!/bin/bash

# Script de gestion Docker pour SUPCHAT
# Auteur: SUPCHAT Team
# Version: 1.0

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Variables
PROJECT_NAME="supchat"
SERVICES=("web" "api" "mobile" "db" "cadvisor")

# Fonction pour afficher le header
show_header() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 SUPCHAT DOCKER MANAGER                ║"
    echo "║                                                              ║"
    echo "║              Gestion complète de l'environnement Docker     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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
    echo -e "${WHITE}ENVIRONNEMENTS:${NC}"
    echo -e "${GREEN}  1)${NC} 🚀 Lancer TOUT en DÉVELOPPEMENT (hot reload)"
    echo -e "${PURPLE}  2)${NC} 🏭 Lancer TOUT en PRODUCTION (optimisé)"
    echo ""
    echo -e "${WHITE}GESTION DES SERVICES:${NC}"
    echo -e "${CYAN}  3)${NC} 🔧 Démarrer un service spécifique"
    echo -e "${CYAN}  4)${NC} ⏹️  Arrêter un service spécifique"
    echo -e "${CYAN}  5)${NC} 🔄 Redémarrer un service spécifique"
    echo -e "${CYAN}  6)${NC} 🏗️  Builder/Rebuilder un service"
    echo ""
    echo -e "${WHITE}MONITORING & LOGS:${NC}"
    echo -e "${YELLOW}  7)${NC} 📊 Voir l'état des containers"
    echo -e "${YELLOW}  8)${NC} 📝 Voir les logs d'un service"
    echo -e "${YELLOW}  9)${NC} 📈 Suivre les logs en temps réel"
    echo -e "${YELLOW} 10)${NC} 🖥️  Ouvrir un shell dans un container"
    echo ""
    echo -e "${WHITE}MAINTENANCE:${NC}"
    echo -e "${RED} 11)${NC} 🛑 Arrêter TOUS les services"
    echo -e "${RED} 12)${NC} 🧹 Options de nettoyage (soft/complet)"
    echo -e "${RED} 13)${NC} 🔄 Restart complet (stop + build + start)"
    echo ""
    echo -e "${WHITE}UTILITAIRES:${NC}"
    echo -e "${BLUE} 14)${NC} 💾 Backup de la base de données"
    echo -e "${BLUE} 15)${NC} 📦 Voir l'utilisation des ressources"
    echo -e "${BLUE} 16)${NC} 🌐 Ouvrir les URLs de l'application"
    echo -e "${BLUE} 17)${NC} 🔍 Diagnostic des services (debug)"
    echo ""
    echo -e "${WHITE} 0)${NC} ❌ Quitter"
    echo ""
    echo -e "${WHITE}════════════════════════════════════════════════════════${NC}"
}

# Fonction pour sélectionner un service
select_service() {
    local prompt="$1"
    echo -e "\n${CYAN}$prompt${NC}" >&2
    echo "Services disponibles:" >&2
    for i in "${!SERVICES[@]}"; do
        echo "  $((i+1))) ${SERVICES[$i]}" >&2
    done
    echo "" >&2
    read -p "Sélectionnez un service (numéro): " service_choice
    
    # Vérifier si l'entrée est un nombre valide
    if [[ "$service_choice" =~ ^[0-9]+$ ]] && [[ $service_choice -ge 1 && $service_choice -le ${#SERVICES[@]} ]]; then
        echo "${SERVICES[$((service_choice-1))]}"
    else
        echo ""
    fi
}

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
    
    pause
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
    
    pause
}

# Fonction pour démarrer un service spécifique
start_service() {
    service=$(select_service "Quel service voulez-vous démarrer ?")
    if [[ -n "$service" ]]; then
        echo -e "\n${GREEN}🔧 Démarrage du service: $service${NC}"
        if docker-compose up -d "$service"; then
            echo -e "${GREEN}✅ Service $service démarré !${NC}"
        else
            echo -e "${RED}❌ Erreur lors du démarrage du service $service${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide. Veuillez choisir un numéro entre 1 et ${#SERVICES[@]}.${NC}"
    fi
    pause
}

# Fonction pour arrêter un service spécifique
stop_service() {
    service=$(select_service "Quel service voulez-vous arrêter ?")
    if [[ -n "$service" ]]; then
        echo -e "\n${RED}⏹️ Arrêt du service: $service${NC}"
        if docker-compose stop "$service"; then
            echo -e "${GREEN}✅ Service $service arrêté !${NC}"
        else
            echo -e "${RED}❌ Erreur lors de l'arrêt du service $service${NC}"
        fi
    else
        echo -e "${RED}❌ Service invalide. Veuillez choisir un numéro entre 1 et ${#SERVICES[@]}.${NC}"
    fi
    pause
}

# Fonction pour redémarrer un service spécifique
restart_service() {
    service=$(select_service "Quel service voulez-vous redémarrer ?")
    if [[ -n "$service" ]]; then
        echo -e "\n${YELLOW}🔄 Redémarrage du service: $service${NC}"
        if docker-compose restart "$service"; then
            echo -e "${GREEN}✅ Service $service redémarré !${NC}"
        else
            echo -e "${RED}❌ Erreur lors du redémarrage du service $service${NC}"
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
    service=$(select_service "De quel service voulez-vous voir les logs ?")
    if [[ -n "$service" ]]; then
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
    service=$(select_service "De quel service voulez-vous suivre les logs ?")
    if [[ -n "$service" ]]; then
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

# Fonction pour faire une pause
pause() {
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
}

# Fonction principale
main() {
    while true; do
        show_header
        show_status
        show_menu
        
        read -p "Votre choix: " choice
        
        case $choice in
            1) start_development ;;
            2) start_production ;;
            3) start_service ;;
            4) stop_service ;;
            5) restart_service ;;
            6) build_service ;;
            7) show_status; pause ;;
            8) view_logs ;;
            9) follow_logs ;;
            10) open_shell ;;
            11) stop_all ;;
            12) cleanup ;;
            13) full_restart ;;
            14) backup_database ;;
            15) show_resources ;;
            16) open_urls ;;
            17) diagnostic_services ;;
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
