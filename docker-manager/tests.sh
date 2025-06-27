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

# Fonction pour tester spécifiquement les WebSockets et messages temps réel
run_websocket_tests() {
    echo -e "\n${GREEN}🔌 Tests WebSocket et messages temps réel...${NC}"
    echo "════════════════════════════════════════════════════════"
    
    # Vérifier que l'environnement de test est actif
    if ! docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
        echo -e "${YELLOW}⚠️  L'environnement de test n'est pas actif${NC}"
        echo "Lancement de l'environnement de test..."
        docker-compose -f docker-compose.test.yml up -d
        
        echo -e "\n${BLUE}⏳ Attente que les services soient prêts...${NC}"
        sleep 10
    fi
    
    echo -e "\n${CYAN}🔧 Tests WebSocket disponibles:${NC}"
    echo -e "${WHITE}  1)${NC} 🧪 Tests unitaires WebSocket (Jest)"
    echo -e "${WHITE}  2)${NC} 🚀 Test de connexion WebSocket en temps réel"
    echo -e "${WHITE}  3)${NC} 💬 Test d'envoi de messages en temps réel"
    echo -e "${WHITE}  4)${NC} 👥 Test multi-clients (simulation de 2 utilisateurs)"
    echo -e "${WHITE}  5)${NC} 📊 Stress test WebSocket (performance)"
    echo -e "${WHITE}  6)${NC} 🔍 Debug complet WebSocket (logs détaillés)"
    echo -e "${WHITE}  0)${NC} ❌ Retour"
    echo ""
    
    read -p "Votre choix pour les tests WebSocket (0-6): " ws_choice
    
    case $ws_choice in
        1)
            echo -e "\n${GREEN}🧪 Exécution des tests unitaires WebSocket...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm test -- --grep "Socket\\|WebSocket\\|socket"
            ;;
        2)
            echo -e "\n${GREEN}🚀 Test de connexion WebSocket...${NC}"
            echo "Création d'un client de test..."
            
            # Créer un script de test de connexion simple
            cat > test-ws-connection.js << 'EOF'
const io = require('socket.io-client');

console.log('🔄 Test de connexion WebSocket...');

const socket = io('http://localhost:3001', {
    auth: {
        token: 'test-token' // Token de test
    },
    withCredentials: true,
});

socket.on('connect', () => {
    console.log('✅ WebSocket connecté avec l\'ID:', socket.id);
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('❌ Timeout de connexion');
    process.exit(1);
}, 5000);
EOF
            
            echo "Exécution du test de connexion..."
            docker-compose -f docker-compose.test.yml exec api node /tmp/test-ws-connection.js
            ;;
        3)
            echo -e "\n${GREEN}💬 Test d'envoi de messages...${NC}"
            echo "Test d'envoi et réception de messages en temps réel..."
            
            # Exécuter un test spécifique pour les messages
            docker-compose -f docker-compose.test.yml exec api npm test -- --grep "message.*real.*time\\|realtime.*message"
            ;;
        4)
            echo -e "\n${GREEN}👥 Test multi-clients...${NC}"
            echo "Simulation de 2 utilisateurs connectés simultanément..."
            
            # Lancer un test de multi-clients
            docker-compose -f docker-compose.test.yml exec api node -e "
                console.log('🔄 Simulation de 2 clients WebSocket...');
                const io = require('socket.io-client');
                
                const client1 = io('http://localhost:3001');
                const client2 = io('http://localhost:3001');
                
                client1.on('connect', () => console.log('✅ Client 1 connecté'));
                client2.on('connect', () => console.log('✅ Client 2 connecté'));
                
                setTimeout(() => {
                    console.log('🏁 Test terminé');
                    process.exit(0);
                }, 3000);
            "
            ;;
        5)
            echo -e "\n${GREEN}📊 Stress test WebSocket...${NC}"
            echo "Test de performance avec connexions multiples..."
            
            # Stress test
            docker-compose -f docker-compose.test.yml exec api npm run test:stress 2>/dev/null || echo "Script de stress test non configuré - utilisez les tests manuels"
            ;;
        6)
            echo -e "\n${GREEN}🔍 Debug complet WebSocket...${NC}"
            echo "Logs détaillés de toutes les connexions WebSocket..."
            
            echo -e "\n${CYAN}📝 Logs du serveur API (WebSocket):${NC}"
            docker-compose -f docker-compose.test.yml logs --tail=50 api | grep -i "socket\\|websocket\\|connect"
            
            echo -e "\n${CYAN}📝 État des containers:${NC}"
            docker-compose -f docker-compose.test.yml ps
            
            echo -e "\n${CYAN}🔌 Test de connexion simple:${NC}"
            timeout 10 docker-compose -f docker-compose.test.yml exec api node -e "
                const io = require('socket.io-client');
                const socket = io('http://localhost:3001');
                socket.on('connect', () => console.log('✅ Connexion WebSocket OK'));
                socket.on('connect_error', (err) => console.log('❌ Erreur:', err.message));
            " || echo "Test de connexion terminé"
            ;;
        0)
            return 0
            ;;
        *)
            echo -e "${RED}❌ Choix invalide${NC}"
            ;;
    esac
    
    pause
}
