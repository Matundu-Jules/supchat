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
