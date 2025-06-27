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
            3) start_test_environment ;;
            4) quick_start_development ;;
            5) quick_start_production ;;
            6) quick_start_tests ;;
            7) start_service ;;
            8) stop_service ;;
            9) restart_service ;;
            10) build_service ;;
            11) show_status; pause ;;
            12) view_logs ;;
            13) follow_logs ;;
            14) open_shell ;;
            15) stop_all ;;
            16) cleanup ;;
            17) full_restart ;;
            18) backup_database ;;
            19) show_resources ;;
            20) open_urls ;;
            21) diagnostic_services ;;
            22) run_tests ;;
            23) reset_test_data ;;
            24) nuclear_cleanup ;;
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
