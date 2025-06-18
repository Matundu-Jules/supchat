#!/bin/bash

# Module de gestion des environnements pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

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
    post_start_menu "développement"
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
    post_start_menu_prod "production"
}

# Fonction pour démarrage rapide développement (sans rebuild)
quick_start_development() {
    echo -e "\n${CYAN}⚡ DÉMARRAGE RAPIDE - Environnement de développement${NC}"
    echo -e "${YELLOW}Mode: Containers existants (aucun rebuild)${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${BLUE}🚀 Démarrage des containers...${NC}"
    if docker-compose up -d; then
        echo -e "${GREEN}✅ Environnement de développement démarré rapidement !${NC}"
        
        echo -e "\n${CYAN}📋 État des services:${NC}"
        docker-compose ps
        
        echo -e "\n${CYAN}🌐 Applications disponibles:${NC}"
        echo "   • Frontend Web: http://localhost:80"
        echo "   • API Backend: http://localhost:3000"
        echo "   • MongoDB: mongodb://localhost:27017"
        
        # Menu post-démarrage
        post_start_menu "développement"
    else
        echo -e "${RED}❌ Erreur lors du démarrage rapide${NC}"
        echo -e "${YELLOW}💡 Conseil: Utilisez l'option 1 (démarrage complet) si les images n'existent pas${NC}"
        pause
    fi
}

# Fonction pour démarrage rapide production (sans rebuild)
quick_start_production() {
    echo -e "\n${PURPLE}⚡ DÉMARRAGE RAPIDE - Environnement de production${NC}"
    echo -e "${YELLOW}Mode: Containers existants (aucun rebuild)${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${BLUE}🚀 Démarrage des containers de production...${NC}"
    if docker-compose -f docker-compose.prod.yml up -d; then
        echo -e "${GREEN}✅ Environnement de production démarré rapidement !${NC}"
        
        echo -e "\n${CYAN}📋 État des services:${NC}"
        docker-compose -f docker-compose.prod.yml ps
        
        echo -e "\n${CYAN}🌐 Applications disponibles:${NC}"
        echo "   • Frontend Web: http://localhost:80"
        echo "   • API Backend: http://localhost:3000"
        echo "   • MongoDB: mongodb://localhost:27017"
        
        # Menu post-démarrage
        post_start_menu_prod "production"
    else
        echo -e "${RED}❌ Erreur lors du démarrage rapide${NC}"
        echo -e "${YELLOW}💡 Conseil: Utilisez l'option 2 (démarrage complet) si les images n'existent pas${NC}"
        pause
    fi
}

# Fonction pour démarrage rapide tests (sans rebuild)
quick_start_tests() {
    echo -e "\n${GREEN}⚡ DÉMARRAGE RAPIDE - Environnement de tests${NC}"
    echo -e "${YELLOW}Mode: Containers existants (aucun rebuild)${NC}"
    echo "════════════════════════════════════════════════════════"
    
    echo -e "\n${BLUE}🚀 Démarrage des containers de test...${NC}"
    if docker-compose -f docker-compose.test.yml up -d; then
        echo -e "${GREEN}✅ Environnement de test démarré rapidement !${NC}"
        
        echo -e "\n${CYAN}📋 État des services:${NC}"
        docker-compose -f docker-compose.test.yml ps
        
        echo -e "\n${CYAN}💡 Prêt pour exécuter des tests:${NC}"
        echo "   • Tests API: Option 21 du menu principal"
        echo "   • Tests manuels: docker-compose -f docker-compose.test.yml exec api npm test"
        
        echo -e "\n${YELLOW}🛑 N'oubliez pas d'arrêter l'environnement après les tests !${NC}"
        echo "   Commande: docker-compose -f docker-compose.test.yml down"
        
        pause
    else
        echo -e "${RED}❌ Erreur lors du démarrage rapide${NC}"
        echo -e "${YELLOW}💡 Conseil: Utilisez l'option 21 (tests complets) si les images n'existent pas${NC}"
        pause
    fi
}
