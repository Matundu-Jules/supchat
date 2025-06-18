#!/bin/bash

# Module de tests pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

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
