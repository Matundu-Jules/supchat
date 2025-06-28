#!/bin/bash

# Module des utilitaires de base pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
ORANGE='\033[0;33m'
MAGENTA='\033[1;35m'
NC='\033[0m' # No Color

# Variables globales
PROJECT_NAME="supchat"
SERVICES=("web" "api" "mobile" "db" "cadvisor")

# Fonction pause
pause() {
    read -p "Appuyez sur Entrée pour continuer..."
}

# Fonction pour nettoyer le buffer d'entrée
clear_input_buffer() {
    while read -r -t 0; do
        read -r
    done
}

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

# Fonction pour sélectionner un service
select_service() {
    local prompt="$1"
    echo -e "\n${CYAN}$prompt${NC}" >&2
    echo "" >&2
    echo -e "${WHITE}🐳 CHOISISSEZ UN SERVICE PARMI LES OPTIONS SUIVANTES:${NC}" >&2
    echo "════════════════════════════════════════════════════════════════════════════" >&2
    for i in "${!SERVICES[@]}"; do
        case "${SERVICES[$i]}" in
        "web")
            echo -e "  ${WHITE}[$((i + 1))] ${GREEN}${SERVICES[$i]}${NC} - 🌐 Frontend React (interface web utilisateur)" >&2
            echo -e "       ${GRAY}└─ Port 80 - Interface principale de SUPCHAT${NC}" >&2
            ;;
        "api")
            echo -e "  ${WHITE}[$((i + 1))] ${BLUE}${SERVICES[$i]}${NC} - 🚀 Backend Node.js (serveur API REST)" >&2
            echo -e "       ${GRAY}└─ Port 3000 - API backend avec authentification et WebSocket${NC}" >&2
            ;;
        "mobile")
            echo -e "  ${WHITE}[$((i + 1))] ${PURPLE}${SERVICES[$i]}${NC} - 📱 Application mobile React Native" >&2
            echo -e "       ${GRAY}└─ Port 8081 - App mobile via Expo${NC}" >&2
            ;;
        "db")
            echo -e "  ${WHITE}[$((i + 1))] ${YELLOW}${SERVICES[$i]}${NC} - 🗃️ Base de données MongoDB" >&2
            echo -e "       ${GRAY}└─ Port 27017 - Stockage des données SUPCHAT${NC}" >&2
            ;;
        "cadvisor")
            echo -e "  ${WHITE}[$((i + 1))] ${CYAN}${SERVICES[$i]}${NC} - 📊 Monitoring des containers Docker" >&2
            echo -e "       ${GRAY}└─ Port 8080 - Surveillance des ressources système${NC}" >&2
            ;;
        *)
            echo -e "  ${WHITE}[$((i + 1))] ${SERVICES[$i]}${NC}" >&2
            ;;
        esac
        echo "" >&2
    done
    echo "════════════════════════════════════════════════════════════════════════════" >&2
    echo -e "${YELLOW}💡 INSTRUCTIONS:${NC}" >&2
    echo -e "   • Tapez ${WHITE}1${NC} pour sélectionner ${GREEN}web${NC} (Frontend React)" >&2
    echo -e "   • Tapez ${WHITE}2${NC} pour sélectionner ${BLUE}api${NC} (Backend Node.js)" >&2
    echo -e "   • Tapez ${WHITE}3${NC} pour sélectionner ${PURPLE}mobile${NC} (App React Native)" >&2
    echo -e "   • Tapez ${WHITE}4${NC} pour sélectionner ${YELLOW}db${NC} (Base MongoDB)" >&2
    echo -e "   • Tapez ${WHITE}5${NC} pour sélectionner ${CYAN}cadvisor${NC} (Monitoring)" >&2
    echo "" >&2
    read -p "🎯 Votre choix (entrez un numéro entre 1 et ${#SERVICES[@]}): " service_choice

    # Vérifier si l'entrée est un nombre valide
    if [[ "$service_choice" =~ ^[0-9]+$ ]] && [[ $service_choice -ge 1 && $service_choice -le ${#SERVICES[@]} ]]; then
        local selected_service="${SERVICES[$((service_choice - 1))]}"
        echo -e "\n${GREEN}✅ Service sélectionné: ${WHITE}${selected_service}${NC}" >&2
        echo "$selected_service"
    else
        echo -e "\n${RED}❌ ERREUR: Choix invalide '${service_choice}' !${NC}" >&2
        echo -e "${YELLOW}💡 RAPPEL DES CHOIX VALIDES:${NC}" >&2
        echo -e "   ${WHITE}1${NC} = web    |  ${WHITE}2${NC} = api    |  ${WHITE}3${NC} = mobile  |  ${WHITE}4${NC} = db  |  ${WHITE}5${NC} = cadvisor" >&2
        echo -e "${RED}⚠️  Veuillez relancer la commande et entrer un numéro entre 1 et ${#SERVICES[@]}${NC}" >&2
        echo "" >&2
        return 1
    fi
}

# Fonction pour détecter les environnements actifs
detect_active_environments() {
    local -n env_status=$1

    env_status["dev"]=false
    env_status["prod"]=false
    env_status["test"]=false

    # Vérifier l'environnement de développement
    if docker-compose ps 2>/dev/null | grep -E "(Up|running)" >/dev/null; then
        env_status["dev"]=true
    fi

    # Vérifier l'environnement de production (doit avoir des containers avec des noms différents)
    if docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -E "(Up|running)" >/dev/null; then
        # Vérifier que ce sont vraiment des containers de production (pas les mêmes que dev)
        local prod_containers=$(docker-compose -f docker-compose.prod.yml ps -q 2>/dev/null)
        local dev_containers=$(docker-compose ps -q 2>/dev/null)

        if [[ -n "$prod_containers" ]] && [[ "$prod_containers" != "$dev_containers" ]]; then
            env_status["prod"]=true
        fi
    fi

    # Vérifier l'environnement de test - chercher spécifiquement les services de test
    if docker-compose -f docker-compose.test.yml ps api-test 2>/dev/null | grep -E "(Up|running)" >/dev/null; then
        env_status["test"]=true
    fi
}

# Fonction pour sélectionner un environnement
select_environment() {
    declare -A active_envs
    detect_active_environments active_envs

    local env_options=()
    local compose_options=()
    local env_names=()

    # Compter les environnements actifs
    local active_count=0
    for env in "${!active_envs[@]}"; do
        if [[ "${active_envs[$env]}" == true ]]; then
            ((active_count++))
        fi
    done

    if [[ $active_count -eq 0 ]]; then
        echo "NONE"
        return 1
    elif [[ $active_count -eq 1 ]]; then
        # Un seul environnement actif - sélection automatique
        for env in "${!active_envs[@]}"; do
            if [[ "${active_envs[$env]}" == true ]]; then
                case "$env" in
                "dev") echo "" ;;
                "prod") echo "-f docker-compose.prod.yml" ;;
                "test") echo "-f docker-compose.test.yml" ;;
                esac
                return 0
            fi
        done
    else
        # Plusieurs environnements actifs - demander à l'utilisateur
        echo -e "\n${YELLOW}⚠️ Plusieurs environnements Docker sont actuellement actifs:${NC}"
        echo ""

        if [[ "${active_envs[dev]}" == true ]]; then
            env_options+=("🔧 Développement (docker-compose.dev.yml)")
            compose_options+=("-f docker-compose.dev.yml")
        fi

        if [[ "${active_envs[prod]}" == true ]]; then
            env_options+=("🏭 Production (docker-compose.prod.yml)")
            compose_options+=("-f docker-compose.prod.yml")
        fi

        if [[ "${active_envs[test]}" == true ]]; then
            env_options+=("🧪 Test (docker-compose.test.yml)")
            compose_options+=("-f docker-compose.test.yml")
        fi

        echo -e "${CYAN}Sur quel environnement voulez-vous effectuer l'action ?${NC}"
        for i in "${!env_options[@]}"; do
            echo "  $((i + 1))) ${env_options[$i]}"
        done
        echo ""
        read -p "Choisissez l'environnement (1-${#env_options[@]}): " env_choice

        if [[ "$env_choice" =~ ^[0-9]+$ ]] && [[ $env_choice -ge 1 && $env_choice -le ${#env_options[@]} ]]; then
            echo "${compose_options[$((env_choice - 1))]}"
            return 0
        else
            echo "INVALID"
            return 1
        fi
    fi
}

# Fonction pour obtenir le nom de l'environnement à partir du fichier compose
get_env_name() {
    local compose_file="$1"
    case "$compose_file" in
    "") echo "développement" ;;
    "-f docker-compose.prod.yml") echo "production" ;;
    "-f docker-compose.test.yml") echo "test" ;;
    *) echo "inconnu" ;;
    esac
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    # Vérifier que Docker et Docker Compose sont installés
    if ! command -v docker &>/dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé ou n'est pas dans le PATH${NC}"
        return 1
    fi

    if ! command -v docker-compose &>/dev/null; then
        echo -e "${RED}❌ Docker Compose n'est pas installé ou n'est pas dans le PATH${NC}"
        return 1
    fi

    # Vérifier que nous sommes dans le bon répertoire
    if [[ ! -f "docker-compose.dev.yml" ]]; then
        echo -e "${RED}❌ Fichier docker-compose.dev.yml non trouvé. Assurez-vous d'être dans le répertoire racine du projet.${NC}"
        return 1
    fi

    return 0
}
