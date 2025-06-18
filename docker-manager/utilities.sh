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
