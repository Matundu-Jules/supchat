#!/bin/bash

# Module des utilitaires pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

# Fonction de backup de la base de données
backup_database() {
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
    echo -e "\n${BLUE}💾 Backup de la base de données MongoDB (${env_name})...${NC}"
    
    # Vérifier si le container db est en cours d'exécution
    if eval "docker-compose $compose_file ps db" | grep -q "Up"; then
        backup_dir="./backups"
        mkdir -p "$backup_dir"
        
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_file="$backup_dir/mongodb_backup_${env_name}_$timestamp"
        
        echo "📦 Création du backup..."
        eval "docker-compose $compose_file exec -T db mongodump --out /tmp/backup"
        eval "docker-compose $compose_file exec -T db tar -czf /tmp/backup_$timestamp.tar.gz -C /tmp backup"
        docker cp "$(eval "docker-compose $compose_file ps -q db"):/tmp/backup_$timestamp.tar.gz" "$backup_file.tar.gz"
        
        echo -e "${GREEN}✅ Backup créé: $backup_file.tar.gz${NC}"
    else
        echo -e "${RED}❌ Le container de base de données n'est pas en cours d'exécution dans l'environnement ${env_name}${NC}"
    fi
    pause
}

# Fonction de backup pour la production (menu post-démarrage)
backup_database_prod() {
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
            1) 
                if command -v start &> /dev/null; then
                    start "http://localhost:80"
                elif command -v xdg-open &> /dev/null; then
                    xdg-open "http://localhost:80"
                elif command -v open &> /dev/null; then
                    open "http://localhost:80"
                else
                    echo -e "${YELLOW}Impossible d'ouvrir automatiquement. URL: http://localhost:80${NC}"
                fi
                ;;
            2) 
                if command -v start &> /dev/null; then
                    start "http://localhost:3000/api/health"
                elif command -v xdg-open &> /dev/null; then
                    xdg-open "http://localhost:3000/api/health"
                elif command -v open &> /dev/null; then
                    open "http://localhost:3000/api/health"
                else
                    echo -e "${YELLOW}Impossible d'ouvrir automatiquement. URL: http://localhost:3000/api/health${NC}"
                fi
                ;;
            3) 
                if command -v start &> /dev/null; then
                    start "http://localhost:3000/api-docs"
                elif command -v xdg-open &> /dev/null; then
                    xdg-open "http://localhost:3000/api-docs"
                elif command -v open &> /dev/null; then
                    open "http://localhost:3000/api-docs"
                else
                    echo -e "${YELLOW}Impossible d'ouvrir automatiquement. URL: http://localhost:3000/api-docs${NC}"
                fi
                ;;
            4) 
                if command -v start &> /dev/null; then
                    start "http://localhost:8080"
                elif command -v xdg-open &> /dev/null; then
                    xdg-open "http://localhost:8080"
                elif command -v open &> /dev/null; then
                    open "http://localhost:8080"
                else
                    echo -e "${YELLOW}Impossible d'ouvrir automatiquement. URL: http://localhost:8080${NC}"
                fi
                ;;
            *) 
                echo -e "${RED}❌ Choix invalide${NC}" 
                ;;
        esac
    fi
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
                docker-compose down 2>/dev/null
                docker-compose -f docker-compose.prod.yml down 2>/dev/null
                docker-compose -f docker-compose.test.yml down 2>/dev/null
                
                echo "🗑️ Suppression des images..."
                docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null
                
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
            echo -e "${YELLOW}💡 Conseil: Utilisez l'option 17 (Backup) avant ce nettoyage${NC}"
            echo ""
            read -p "Êtes-vous VRAIMENT sûr ? Tapez 'DELETE' pour confirmer: " confirm
            
            if [[ "$confirm" == "DELETE" ]]; then
                echo "🛑 Arrêt des services..."
                docker-compose down -v 2>/dev/null
                docker-compose -f docker-compose.prod.yml down -v 2>/dev/null
                docker-compose -f docker-compose.test.yml down -v 2>/dev/null
                
                echo "🗑️ Suppression des images..."
                docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null
                
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
            echo "Développement:"
            docker-compose ps 2>/dev/null || echo "  Aucun"
            echo "Production:"
            docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "  Aucun"
            echo "Test:"
            docker-compose -f docker-compose.test.yml ps 2>/dev/null || echo "  Aucun"
            echo ""
            echo -e "${BLUE}🖼️ Images du projet:${NC}"
            docker images | grep "$PROJECT_NAME" || echo "Aucune image trouvée"
            echo ""
            echo -e "${BLUE}💾 Volumes du projet:${NC}"
            docker volume ls | grep "$PROJECT_NAME" || echo "Aucun volume nommé trouvé"
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

# Fonction pour créer des données de test
create_test_data() {
    echo -e "\n${BLUE}📝 Création des données de test...${NC}"
    echo "════════════════════════════════════════════════════════"
    echo -e "${YELLOW}Cette option va créer/mettre à jour des données de test dans la DB${NC}"
    echo -e "${WHITE}• 8 utilisateurs de test (admin@admin.fr, john.doe@example.com, etc.)${NC}"
    echo -e "${WHITE}• 4 workspaces de démonstration${NC}"
    echo -e "${WHITE}• Channels et messages d'exemple${NC}"
    echo ""
    echo -e "${GREEN}✅ Les données existantes ne seront PAS supprimées${NC}"
    echo ""
    
    # Vérifier si l'API est en cours d'exécution
    if ! docker-compose ps api | grep -q "Up"; then
        echo -e "${RED}❌ Le container API n'est pas en cours d'exécution${NC}"
        echo -e "${YELLOW}💡 Démarrez d'abord l'environnement avec l'option 1 ou 3${NC}"
        pause
        return 1
    fi
    
    read -p "Continuer avec la création des données de test ? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "\n${BLUE}🚀 Exécution du script de création...${NC}"
        
        # Exécuter le script dans le container API
        if docker-compose exec api node create-test-users.js; then
            echo -e "\n${GREEN}✅ Données de test créées avec succès !${NC}"
            echo ""
            echo -e "${CYAN}📋 Comptes de connexion disponibles :${NC}"
            echo "┌─────────────────────────┬──────────┬─────────┐"
            echo "│ Email                   │ Password │ Role    │"
            echo "├─────────────────────────┼──────────┼─────────┤"
            echo "│ admin@admin.fr          │ admin    │ admin   │"
            echo "│ john.doe@example.com    │ user     │ user    │"
            echo "│ jane.smith@example.com  │ user     │ user    │"
            echo "│ alice.martin@example.com│ user     │ user    │"
            echo "│ bob.wilson@example.com  │ user     │ user    │"
            echo "│ charlie.brown@example.com│ user    │ user    │"
            echo "│ david.taylor@example.com│ user     │ user    │"
            echo "│ emma.garcia@example.com │ user     │ user    │"
            echo "└─────────────────────────┴──────────┴─────────┘"
        else
            echo -e "\n${RED}❌ Erreur lors de la création des données de test${NC}"
            echo -e "${YELLOW}💡 Vérifiez que la base de données est accessible${NC}"
        fi
    else
        echo -e "${YELLOW}Création des données de test annulée${NC}"
    fi
    pause
}

# Fonction pour réinitialiser les données de test
reset_test_data() {
    echo -e "\n${BLUE}🔄 Reset des données de test...${NC}"
    echo "════════════════════════════════════════════════════════"
    echo -e "${WHITE}Options de reset :${NC}"
    echo -e "${YELLOW}  1)${NC} 🔄 Ajouter des données de test (sans suppression)"
    echo -e "${RED}  2)${NC} 💥 RESET COMPLET - Supprimer TOUTES les données et recréer"
    echo -e "${WHITE}  0)${NC} ❌ Annuler"
    echo ""
    read -p "Votre choix (0-2): " reset_choice
    
    case $reset_choice in
        1)
            echo -e "\n${YELLOW}🔄 Ajout de données de test (préservation des données existantes)...${NC}"
            echo -e "${GREEN}✅ Vos données actuelles seront PRÉSERVÉES${NC}"
            read -p "Continuer ? (y/N): " confirm
            
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                # Vérifier que l'API est en cours d'exécution
                if docker-compose ps api | grep -q "Up"; then
                    echo "🚀 Exécution du script d'ajout de données..."
                    docker-compose exec api node create-test-users.js
                    
                    if [[ $? -eq 0 ]]; then
                        echo -e "${GREEN}✅ Données de test ajoutées avec succès !${NC}"
                    else
                        echo -e "${RED}❌ Erreur lors de l'ajout des données de test${NC}"
                    fi
                else
                    echo -e "${RED}❌ Le container API n'est pas en cours d'exécution${NC}"
                    echo "💡 Démarrez d'abord l'environnement avec l'option 1 ou 3"
                fi
            else
                echo -e "${YELLOW}Ajout de données annulé${NC}"
            fi
            ;;
        2)
            echo -e "\n${RED}💥 RESET COMPLET des données...${NC}"
            echo -e "${RED}⚠️  ATTENTION: Cela va:${NC}"
            echo "   • SUPPRIMER tous les utilisateurs existants"
            echo "   • SUPPRIMER tous les workspaces existants"
            echo "   • SUPPRIMER tous les channels existants"
            echo -e "${RED}   • SUPPRIMER tous les messages existants${NC}"
            echo ""
            echo -e "${GREEN}✅ Puis recréer des données de test propres${NC}"
            echo ""
            read -p "Êtes-vous VRAIMENT sûr ? Tapez 'RESET' pour confirmer: " confirm
            
            if [[ "$confirm" == "RESET" ]]; then
                # Vérifier que l'API est en cours d'exécution
                if docker-compose ps api | grep -q "Up"; then
                    echo "🗑️ Reset complet des données en cours..."
                    docker-compose exec api node reset-test-data.js
                    
                    if [[ $? -eq 0 ]]; then
                        echo -e "${GREEN}✅ Reset complet terminé ! Nouvelles données de test créées.${NC}"
                        echo -e "${CYAN}💡 Connectez-vous avec: admin@admin.fr / admin${NC}"
                    else
                        echo -e "${RED}❌ Erreur lors du reset des données${NC}"
                    fi
                else
                    echo -e "${RED}❌ Le container API n'est pas en cours d'exécution${NC}"
                    echo "💡 Démarrez d'abord l'environnement avec l'option 1 ou 3"
                fi
            else
                echo -e "${YELLOW}Reset complet annulé (bonne décision !)${NC}"
            fi
            ;;
        0|*)
            echo -e "${YELLOW}Reset annulé${NC}"
            ;;
    esac
    pause
}
