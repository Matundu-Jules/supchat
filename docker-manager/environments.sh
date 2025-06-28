#!/bin/bash

# Modul    echo -e "\n${GREEN}✅ Environnement de développement démarré !${NC}"
echo -e "${GREEN}✅ Données de test créées automatiquement !${NC}"
echo ""
echo -e "${CYAN}📍 URLs disponibles:${NC}"
echo "   • Web (Frontend): http://localhost:80"
echo "   • API (Backend): http://localhost:3000"
echo "   • MongoDB: localhost:27017"
echo "   • cAdvisor (Monitoring): http://localhost:8080"
echo ""
echo -e "${CYAN}📋 Comptes de test disponibles:${NC}"
echo "   • admin@admin.fr / admin (administrateur)"
echo "   • john.doe@example.com / user"
echo "   • jane.smith@example.com / user"
echo "   • (+ 5 autres comptes utilisateurs)"
echo ""
echo -e "${GREEN}🎉 Tout est prêt ! Vous pouvez ouvrir http://localhost:80 dans votre navigateur.${NC}"
echo -e "${BLUE}💡 Utilisez Ctrl+C pour revenir au menu principal si nécessaire.${NC}"ironnements pour SUPCHAT Docker Manager
# Auteur: SUPCHAT Team

# Fonction pour lancer l'environnement de développement
start_development() {
    echo -e "\n${GREEN}🚀 Démarrage de l'environnement de DÉVELOPPEMENT...${NC}"
    echo -e "${YELLOW}Mode: Hot reload activé pour tous les services${NC}"
    echo "════════════════════════════════════════════════════════"

    echo -e "\n${BLUE}Building images de développement...${NC}"
    docker compose -f docker-compose.dev.yml --env-file .env.dev build --no-cache

    echo -e "\n${BLUE}Démarrage des services...${NC}"
    docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --build

    echo -e "\n${GREEN}✅ Environnement de développement démarré !${NC}"
    echo -e "${GREEN}✅ Données de test créées automatiquement !${NC}"
    echo ""
    echo -e "${CYAN}📍 URLs disponibles:${NC}"
    echo "   • Web (Frontend): http://localhost:80"
    echo "   • API (Backend): http://localhost:3000"
    echo "   • MongoDB: localhost:27017"
    echo "   • cAdvisor (Monitoring): http://localhost:8080"
    echo ""
    echo -e "${CYAN}� Comptes de test disponibles:${NC}"
    echo "   • admin@admin.fr / admin (administrateur)"
    echo "   • john.doe@example.com / user"
    echo "   • jane.smith@example.com / user"
    echo "   • (+ 5 autres comptes utilisateurs)"

    sleep 3
    post_start_menu "développement"
}

# Fonction pour lancer l'environnement de production
start_production() {
    # Stoppe si .env.prod n'existe pas
    if [ ! -f .env.prod ]; then
        echo -e "${RED}Erreur : .env.prod introuvable.${NC}"
        exit 1
    fi

    echo -e "\n${PURPLE}🏭 Démarrage de l'environnement de PRODUCTION...${NC}"
    echo -e "${YELLOW}Mode: Images optimisées + Health checks${NC}"
    echo "════════════════════════════════════════════════════════"

    echo -e "\n${BLUE}Building images de production...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

    echo -e "\n${BLUE}Démarrage des services...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

    echo -e "\n${GREEN}✅ Environnement de production démarré !${NC}"
    echo -e "${CYAN}📍 URLs disponibles:${NC}"
    echo "   • Web (Frontend): http://localhost:80"
    echo "   • API (Backend): http://localhost:3000"
    echo "   • MongoDB: localhost:27017"
    echo "   • cAdvisor (Monitoring): http://localhost:8080"

    post_start_menu_prod "production"
}

# Fonction pour démarrage rapide développement (sans rebuild)
quick_start_development() {
    echo -e "\n${CYAN}⚡ DÉMARRAGE RAPIDE - Environnement de développement${NC}"
    echo -e "${YELLOW}Mode: Containers existants (aucun rebuild)${NC}"
    echo "════════════════════════════════════════════════════════"

    echo -e "\n${BLUE}🚀 Démarrage des containers...${NC}"
    if docker-compose -f docker-compose.dev.yml up -d; then
        echo -e "${GREEN}✅ Environnement de développement démarré rapidement !${NC}"

        echo -e "\n${CYAN}📋 État des services:${NC}"
        docker-compose -f docker-compose.dev.yml ps

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

# Fonction pour lancer l'environnement de test complet avec build
start_tests() {
    echo -e "\n${ORANGE}🧪 Démarrage de l'environnement de TESTS...${NC}"
    echo -e "${YELLOW}Mode: Environnement isolé avec MongoDB de test${NC}"
    echo "════════════════════════════════════════════════════════"

    # Vérifier si docker-compose.test.yml existe
    if [[ ! -f "docker-compose.test.yml" ]]; then
        echo -e "${RED}❌ Erreur: docker-compose.test.yml non trouvé${NC}"
        echo "Ce fichier est nécessaire pour l'environnement de test isolé."
        pause
        return 1
    fi

    echo -e "\n${BLUE}🏗️  Building images de test...${NC}"
    docker-compose -f docker-compose.test.yml build --no-cache

    echo -e "\n${BLUE}🚀 Démarrage des services de test...${NC}"
    docker-compose -f docker-compose.test.yml up -d

    echo -e "\n${BLUE}⏳ Attente que les services soient prêts...${NC}"
    sleep 10

    echo -e "\n${GREEN}✅ Environnement de test démarré !${NC}"
    echo -e "${CYAN}📍 URLs disponibles (environnement de test):${NC}"
    echo "   • API Test: http://localhost:3001"
    echo "   • MongoDB Test: localhost:27018"
    echo "   • Web Test: http://localhost:3002"

    echo -e "\n${CYAN}📋 État des services de test:${NC}"
    docker-compose -f docker-compose.test.yml ps

    echo -e "\n${YELLOW}🔧 Actions disponibles:${NC}"
    echo -e "${WHITE}  1)${NC} 🧪 Lancer tous les tests automatisés"
    echo -e "${WHITE}  2)${NC} 📊 Lancer tests avec couverture de code"
    echo -e "${WHITE}  3)${NC} 🔍 Tests spécifiques (WebSocket, Messages, etc.)"
    echo -e "${WHITE}  4)${NC} 🖥️  Ouvrir shell dans le container de test"
    echo -e "${WHITE}  5)${NC} 📝 Voir les logs des tests en temps réel"
    echo -e "${WHITE}  6)${NC} 📋 Créer/Reset des données de test"
    echo -e "${WHITE}  7)${NC} 🛑 Arrêter l'environnement de test"
    echo -e "${WHITE}  0)${NC} ❌ Retour au menu principal"
    echo ""

    while true; do
        read -p "Votre choix pour les tests (0-7): " test_action

        case $test_action in
        1)
            echo -e "\n${GREEN}🧪 Exécution de tous les tests...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm test
            ;;
        2)
            echo -e "\n${GREEN}📊 Tests avec couverture de code...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm run test:coverage
            ;;
        3)
            echo -e "\n${BLUE}🔍 Tests spécifiques disponibles:${NC}"
            echo -e "${WHITE}  a)${NC} Tests WebSocket et temps réel"
            echo -e "${WHITE}  b)${NC} Tests des messages"
            echo -e "${WHITE}  c)${NC} Tests des channels"
            echo -e "${WHITE}  d)${NC} Tests d'authentification"
            echo ""
            read -p "Votre choix (a-d): " specific_test

            case $specific_test in
            a)
                echo -e "\n${GREEN}🔌 Tests WebSocket...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "WebSocket\\|Socket\\|realtime"
                ;;
            b)
                echo -e "\n${GREEN}� Tests des messages...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "message\\|Message"
                ;;
            c)
                echo -e "\n${GREEN}📢 Tests des channels...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "channel\\|Channel"
                ;;
            d)
                echo -e "\n${GREEN}� Tests d'authentification...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "auth\\|Auth\\|login\\|Login"
                ;;
            *)
                echo -e "${RED}❌ Choix invalide${NC}"
                ;;
            esac
            ;;
        4)
            echo -e "\n${GREEN}🖥️  Ouverture du shell dans le container API de test...${NC}"
            docker-compose -f docker-compose.test.yml exec api /bin/bash
            ;;
        5)
            echo -e "\n${GREEN}📝 Logs en temps réel (Ctrl+C pour arrêter)...${NC}"
            docker-compose -f docker-compose.test.yml logs -f
            ;;
        6)
            echo -e "\n${GREEN}📋 Création/Reset des données de test...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm run create-test-data
            ;;
        7)
            echo -e "\n${YELLOW}🛑 Arrêt de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml down
            echo -e "${GREEN}✅ Environnement de test arrêté${NC}"
            break
            ;;
        0)
            echo -e "\n${BLUE}💡 L'environnement de test reste actif${NC}"
            echo -e "${YELLOW}Pour l'arrêter plus tard: docker-compose -f docker-compose.test.yml down${NC}"
            break
            ;;
        *)
            echo -e "${RED}❌ Choix invalide${NC}"
            ;;
        esac

        echo ""
        echo -e "${CYAN}Actions disponibles:${NC}"
        echo -e "${WHITE}  1)${NC} 🧪 Tests automatisés  ${WHITE}2)${NC} 📊 Tests+couverture  ${WHITE}3)${NC} 🔍 Tests spécifiques"
        echo -e "${WHITE}  4)${NC} 🖥️  Shell  ${WHITE}5)${NC} 📝 Logs  ${WHITE}6)${NC} 📋 Données test  ${WHITE}7)${NC} 🛑 Arrêter  ${WHITE}0)${NC} ❌ Retour"
        echo ""
    done
}

# Fonction pour lancer l'environnement de test complet
start_test_environment() {
    echo -e "\n${ORANGE}🧪 Démarrage de l'environnement de TESTS...${NC}"
    echo -e "${YELLOW}Mode: Environnement isolé avec base de données test${NC}"
    echo "════════════════════════════════════════════════════════"

    echo -e "\n${BLUE}Building images de test...${NC}"
    docker-compose -f docker-compose.test.yml build --no-cache

    echo -e "\n${BLUE}Démarrage des services de test...${NC}"
    docker-compose -f docker-compose.test.yml up -d

    echo -e "\n${GREEN}✅ Environnement de test démarré !${NC}"
    echo -e "${CYAN}📍 URLs de test disponibles:${NC}"
    echo "   • API Test: http://localhost:3001"
    echo "   • MongoDB Test: localhost:27018"
    echo "   • Tests WebSocket disponibles"

    # Attendre que les services soient prêts
    echo -e "\n${YELLOW}⏳ Attente que les services soient prêts...${NC}"
    sleep 5

    # Vérifier que les services sont en cours d'exécution
    if docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services de test opérationnels${NC}"

        # Initialiser les données de test
        echo -e "\n${BLUE}📋 Initialisation des données de test...${NC}"
        docker-compose -f docker-compose.test.yml exec -T api npm run create-test-data 2>/dev/null || echo -e "${YELLOW}⚠️  Données de test non initialisées (optionnel)${NC}"

        # Menu post-démarrage pour les tests
        post_start_test_menu
    else
        echo -e "${RED}❌ Erreur lors du démarrage des services de test${NC}"
        echo -e "${YELLOW}Vérification des logs...${NC}"
        docker-compose -f docker-compose.test.yml logs --tail=20
    fi
}

# Menu post-démarrage pour l'environnement de test
post_start_test_menu() {
    echo -e "\n${WHITE}════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}🧪 ENVIRONNEMENT DE TEST ACTIF${NC}"
    echo -e "${WHITE}════════════════════════════════════════════════════════${NC}"

    while true; do
        echo ""
        echo -e "${CYAN}Actions disponibles:${NC}"
        echo -e "${WHITE}  1)${NC} 🧪 Lancer tous les tests"
        echo -e "${WHITE}  2)${NC} 📊 Tests avec couverture de code"
        echo -e "${WHITE}  3)${NC} 🔍 Tests spécifiques (WebSocket, Messages, etc.)"
        echo -e "${WHITE}  4)${NC} 🔌 Test manuel WebSocket en temps réel"
        echo -e "${WHITE}  5)${NC} 🖥️  Ouvrir shell dans container test"
        echo -e "${WHITE}  6)${NC} 📝 Voir logs en temps réel"
        echo -e "${WHITE}  7)${NC} 📋 Créer/Reset données de test"
        echo -e "${WHITE}  8)${NC} 🛑 Arrêter environnement de test"
        echo -e "${WHITE}  0)${NC} ❌ Retour au menu principal"
        echo ""
        echo -ne "${CYAN}Votre choix (0-8): ${NC}"

        read choice

        case $choice in
        1)
            echo -e "\n${GREEN}🧪 Lancement de tous les tests...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm test
            ;;
        2)
            echo -e "\n${GREEN}📊 Tests avec couverture de code...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm run test:coverage
            ;;
        3)
            echo -e "\n${GREEN}🔍 Sélectionnez le type de test:${NC}"
            echo -e "${WHITE}  a)${NC} 🔌 Tests WebSocket/Temps réel"
            echo -e "${WHITE}  b)${NC} 💬 Tests des messages"
            echo -e "${WHITE}  c)${NC} 📢 Tests des channels"
            echo -e "${WHITE}  d)${NC} 🔐 Tests d'authentification"
            echo -ne "${CYAN}Votre choix (a-d): ${NC}"
            read specific_test

            case $specific_test in
            a)
                echo -e "\n${GREEN}🔌 Tests WebSocket...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "WebSocket\\|Socket\\|realtime"
                ;;
            b)
                echo -e "\n${GREEN}� Tests des messages...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "message\\|Message"
                ;;
            c)
                echo -e "\n${GREEN} Tests des channels...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "channel\\|Channel"
                ;;
            d)
                echo -e "\n${GREEN}🔐 Tests d'authentification...${NC}"
                docker-compose -f docker-compose.test.yml exec api npm test -- --grep "auth\\|Auth\\|login\\|Login"
                ;;
            *)
                echo -e "${RED}❌ Choix invalide${NC}"
                ;;
            esac
            ;;
        4)
            echo -e "\n${GREEN}🔌 Test manuel WebSocket en temps réel...${NC}"
            echo -e "${YELLOW}Ce test va créer un client WebSocket et écouter les messages en temps réel${NC}"
            echo -e "${BLUE}Instructions:${NC}"
            echo "1. Le client se connecte automatiquement"
            echo "2. Envoyez des messages via l'interface web (localhost:80)"
            echo "3. Observez les messages reçus en temps réel"
            echo "4. Appuyez sur Ctrl+C pour arrêter le test"
            echo ""
            echo -e "${CYAN}Démarrage du client WebSocket...${NC}"
            docker-compose -f docker-compose.test.yml exec api node -e "
                const io = require('socket.io-client');
                const socket = io('http://localhost:3001', { autoConnect: true });
                
                socket.on('connect', () => {
                    console.log('✅ Client WebSocket connecté');
                    console.log('🔌 ID de connexion:', socket.id);
                    console.log('📡 En attente de messages...');
                });
                
                socket.on('new-message', (msg) => {
                    console.log('🚀 NOUVEAU MESSAGE:', JSON.stringify(msg, null, 2));
                });
                
                socket.on('disconnect', () => {
                    console.log('📴 Client déconnecté');
                });
                
                process.on('SIGINT', () => {
                    socket.disconnect();
                    process.exit(0);
                });
                "
            ;;
        5)
            echo -e "\n${GREEN}🖥️  Ouverture du shell dans le container de test...${NC}"
            docker-compose -f docker-compose.test.yml exec api /bin/bash
            ;;
        6)
            echo -e "\n${GREEN}📝 Logs en temps réel (Ctrl+C pour arrêter)...${NC}"
            docker-compose -f docker-compose.test.yml logs -f
            ;;
        7)
            echo -e "\n${GREEN}📋 Création/Reset des données de test...${NC}"
            docker-compose -f docker-compose.test.yml exec api npm run create-test-data
            ;;
        8)
            echo -e "\n${YELLOW}🛑 Arrêt de l'environnement de test...${NC}"
            docker-compose -f docker-compose.test.yml down
            echo -e "${GREEN}✅ Environnement de test arrêté${NC}"
            break
            ;;
        0)
            echo -e "\n${BLUE}💡 L'environnement de test reste actif${NC}"
            echo -e "${YELLOW}Pour l'arrêter plus tard: docker-compose -f docker-compose.test.yml down${NC}"
            break
            ;;
        *)
            echo -e "${RED}❌ Choix invalide${NC}"
            ;;
        esac

        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Fonction pour créer manuellement les données de test
create_manual_test_data() {
    echo -e "\n${BLUE}📝 Création manuelle des données de test...${NC}"

    # Vérifier si l'API est en cours d'exécution
    if ! docker-compose -f docker-compose.dev.yml ps api | grep -q "Up"; then
        echo -e "${RED}❌ Le container API n'est pas en cours d'exécution${NC}"
        echo -e "${YELLOW}💡 Démarrez d'abord l'environnement de développement${NC}"
        return 1
    fi

    echo -e "${YELLOW}⏳ Attente que l'API soit prête...${NC}"
    sleep 3

    echo -e "${BLUE}🚀 Exécution du script de création des données...${NC}"
    if docker-compose -f docker-compose.dev.yml exec api node create-test-users.js; then
        echo -e "\n${GREEN}✅ Données de test créées avec succès !${NC}"
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
        echo "└─────────────────────────┴──────────┴─────────┘"
    else
        echo -e "\n${RED}❌ Erreur lors de la création des données de test${NC}"
        echo -e "${YELLOW}💡 Vérifiez que la base de données est accessible${NC}"
    fi
}
