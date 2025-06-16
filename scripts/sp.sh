#!/bin/bash
# Script de démarrage rapide pour le projet SupChat
# Usage: ./sp.sh [option]

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo -e "${BLUE}SupChat - Script de démarrage rapide${NC}"
    echo ""
    echo "Usage: ./sp.sh [option]"
    echo ""
    echo "Options disponibles:"
    echo -e "  ${GREEN}full${NC}      Démarre tout le projet avec Docker Compose (par défaut)"
    echo -e "  ${GREEN}db${NC}        Démarre seulement la base de données MongoDB"
    echo -e "  ${GREEN}backend${NC}   Démarre le serveur backend en mode dev"
    echo -e "  ${GREEN}web${NC}       Démarre le client web en mode dev"
    echo -e "  ${GREEN}mobile${NC}    Démarre le client mobile en mode dev"
    echo -e "  ${GREEN}stop${NC}      Arrête tous les services Docker"
    echo -e "  ${GREEN}clean${NC}     Arrête et nettoie tous les conteneurs/volumes Docker"
    echo -e "  ${GREEN}logs${NC}      Affiche les logs de tous les services"
    echo -e "  ${GREEN}status${NC}    Affiche le statut des services"
    echo -e "  ${GREEN}urls${NC}      Affiche toutes les URLs des services"
    echo -e "  ${GREEN}security${NC}  Lance une analyse de sécurité Docker"
    echo -e "  ${GREEN}help${NC}      Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  ./sp.sh           # Démarre tout le projet"
    echo "  ./sp.sh web       # Démarre seulement le client web"
    echo "  ./sp.sh stop      # Arrête tous les services"
}

# Fonction pour vérifier si Docker est en cours d'exécution
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop.${NC}"
        exit 1
    fi
}

# Fonction pour démarrer tout le projet
start_full() {
    echo -e "${BLUE}🚀 Démarrage complet du projet SupChat...${NC}"
    check_docker
    
    echo -e "${YELLOW}📦 Construction et démarrage de tous les services...${NC}"
    docker-compose up -d
    
    echo ""
    echo -e "${GREEN}✅ Projet démarré avec succès !${NC}"
    echo ""
    echo -e "${BLUE}🌐 Services disponibles:${NC}"
    echo -e "  • Application web: ${GREEN}http://localhost${NC}"
    echo -e "  • API Backend: ${GREEN}http://localhost:3000${NC}"
    echo -e "  • Base de données: ${GREEN}mongodb://localhost:27017${NC}"
    echo -e "  • Monitoring: ${GREEN}http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}💡 Utilisez './sp.sh logs' pour voir les logs en temps réel${NC}"
}

# Fonction pour démarrer seulement la DB
start_db() {
    echo -e "${BLUE}🗄️  Démarrage de la base de données MongoDB...${NC}"
    check_docker
    docker-compose up -d db
    echo -e "${GREEN}✅ Base de données démarrée !${NC}"
    echo -e "  • MongoDB: ${GREEN}mongodb://localhost:27017${NC}"
}

# Fonction pour démarrer le backend en mode dev
start_backend() {
    echo -e "${BLUE}⚙️  Démarrage du backend en mode développement...${NC}"
    
    # Vérifier si la DB est en cours d'exécution
    if ! docker-compose ps db | grep -q "Up"; then
        echo -e "${YELLOW}📦 Démarrage de la base de données...${NC}"
        docker-compose up -d db
        echo -e "${YELLOW}⏳ Attente du démarrage de MongoDB...${NC}"
        sleep 5
    fi
    
    echo -e "${YELLOW}🔧 Démarrage du serveur backend...${NC}"
    cd supchat-server && npm start
}

# Fonction pour démarrer le client web en mode dev
start_web() {
    echo -e "${BLUE}🌐 Démarrage du client web en mode développement...${NC}"
    cd client-web && npm run dev
}

# Fonction pour démarrer le client mobile en mode dev
start_mobile() {
    echo -e "${BLUE}📱 Démarrage du client mobile en mode développement...${NC}"
    cd client-mobile && npm start
}

# Fonction pour arrêter tous les services
stop_services() {
    echo -e "${YELLOW}🛑 Arrêt de tous les services...${NC}"
    check_docker
    docker-compose stop
    echo -e "${GREEN}✅ Tous les services ont été arrêtés${NC}"
}

# Fonction pour nettoyer complètement
clean_all() {
    echo -e "${YELLOW}🧹 Nettoyage complet des conteneurs et volumes...${NC}"
    check_docker
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Fonction pour afficher les logs
show_logs() {
    echo -e "${BLUE}📋 Affichage des logs en temps réel...${NC}"
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter l'affichage${NC}"
    check_docker
    docker-compose logs -f
}

# Fonction pour afficher le statut
show_status() {
    echo -e "${BLUE}📊 Statut des services:${NC}"
    check_docker
    docker-compose ps
    echo ""
    echo -e "${BLUE}💾 Utilisation des ressources:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Fonction pour afficher toutes les URLs des services
show_urls() {
    echo -e "${BLUE}🌐 URLs des services SupChat:${NC}"
    echo ""
    
    # Vérifier si Docker est en cours d'exécution
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker n'est pas en cours d'exécution${NC}"
        return 1
    fi
    
    # Obtenir l'IP locale (compatible Windows/Linux)
    if command -v ipconfig > /dev/null 2>&1; then
        # Windows
        LOCAL_IP=$(ipconfig | grep "IPv4" | head -1 | awk '{print $NF}' | tr -d '\r')
    elif command -v hostname > /dev/null 2>&1; then
        # Linux/Mac
        LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
    else
        LOCAL_IP="localhost"
    fi
    
    # Fallback si pas d'IP trouvée
    if [ -z "$LOCAL_IP" ] || [ "$LOCAL_IP" = "" ]; then
        LOCAL_IP="localhost"
    fi
    
    # Vérifier quels services sont en cours d'exécution
    echo -e "${YELLOW}📱 Services publics (accessibles depuis n'importe quel appareil):${NC}"
    
    # Client Web (port 80, accessible publiquement)
    if docker-compose ps web | grep -q "Up"; then
        echo -e "  🌐 ${GREEN}Application Web${NC}:"
        echo -e "    • http://localhost"
        echo -e "    • http://$LOCAL_IP"
        echo -e "    • http://127.0.0.1"
    else
        echo -e "  🌐 ${RED}Application Web: ❌ Non démarrée${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}� Services mixtes:${NC}"
    
    # API Backend (port 3000, maintenant accessible publiquement pour mobile)
    if docker-compose ps api | grep -q "Up"; then
        echo -e "  ⚙️  ${GREEN}API Backend${NC}:"
        echo -e "    • http://localhost:3000"
        echo -e "    • http://127.0.0.1:3000"
        echo -e "    • http://$LOCAL_IP:3000 (pour mobile)"
        echo -e "    • Documentation: http://localhost:3000/docs"
    else
        echo -e "  ⚙️  ${RED}API Backend: ❌ Non démarrée${NC}"
    fi
    
    # Base de données MongoDB (port 27017, localhost seulement)
    if docker-compose ps db | grep -q "Up"; then
        echo -e "  🗄️  ${GREEN}MongoDB${NC}:"
        echo -e "    • mongodb://localhost:27017"
        echo -e "    • mongodb://127.0.0.1:27017"
        echo -e "    • DB: supchat"
    else
        echo -e "  🗄️  ${RED}MongoDB: ❌ Non démarrée${NC}"
    fi
    
    # Monitoring cAdvisor (port 8080, localhost seulement)
    if docker-compose ps cadvisor | grep -q "Up"; then
        echo -e "  📊 ${GREEN}Monitoring (cAdvisor)${NC}:"
        echo -e "    • http://localhost:8080"
        echo -e "    • http://127.0.0.1:8080"
    else
        echo -e "  📊 ${RED}Monitoring: ❌ Non démarré${NC}"
    fi
    
    # Client Mobile (port interne 8081, pas exposé)
    if docker-compose ps mobile | grep -q "Up"; then
        echo -e "  📱 ${GREEN}Client Mobile${NC}:"
        echo -e "    • Conteneur en cours d'exécution (port interne 8081)"
        echo -e "    • Utilisez Expo Go pour vous connecter"
    else
        echo -e "  📱 ${RED}Client Mobile: ❌ Non démarré${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 Conseils:${NC}"
    echo -e "  • Pour accéder depuis un téléphone/tablette, utilisez: ${GREEN}http://$LOCAL_IP${NC}"
    echo -e "  • L'API est accessible sur port 3000 depuis l'extérieur pour les apps mobiles"
    echo -e "  • MongoDB reste sécurisé sur localhost uniquement"
    echo -e "  • Utilisez ${GREEN}'./sp.sh logs'${NC} pour voir les logs en temps réel"
    echo -e "  • Utilisez ${GREEN}'./sp.sh status'${NC} pour voir l'état détaillé"
}

# Script principal
case "${1:-full}" in
    "full"|"")
        start_full
        ;;
    "db")
        start_db
        ;;
    "backend"|"api")
        start_backend
        ;;
    "web"|"frontend")
        start_web
        ;;
    "mobile")
        start_mobile
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        clean_all
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "urls")
        show_urls
        ;;
    "security")
        ./security-check.sh
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Option inconnue: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac