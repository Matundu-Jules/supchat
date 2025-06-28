#!/bin/bash

# Script pour exécuter les tests de messagerie WebSocket
# Usage: ./run-messaging-tests.sh [type]
# Types: unit, integration, load, all

set -e

echo "🧪 SUPCHAT - Tests de Messagerie WebSocket"
echo "=========================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "Ce script doit être exécuté depuis le répertoire api/"
    exit 1
fi

# Vérifier que Node.js et npm sont installés
if ! command -v node &>/dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

# Fonction pour vérifier que MongoDB est accessible
check_mongodb() {
    log_info "Vérification de la connexion MongoDB..."

    if command -v mongosh &>/dev/null; then
        MONGO_CMD="mongosh"
    elif command -v mongo &>/dev/null; then
        MONGO_CMD="mongo"
    else
        log_warning "Client MongoDB non trouvé, en supposant que la base est accessible"
        return 0
    fi

    # Test de connexion simple
    if timeout 5 $MONGO_CMD --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
        log_success "MongoDB accessible"
    else
        log_warning "MongoDB pourrait ne pas être accessible"
        log_info "Assurez-vous que MongoDB est démarré (docker-compose -f docker-compose.dev.yml up db)"
    fi
}

# Fonction pour exécuter les tests unitaires
run_unit_tests() {
    log_info "Exécution des tests unitaires..."

    npm test -- --testPathPattern="tests/unit" --verbose

    if [ $? -eq 0 ]; then
        log_success "Tests unitaires terminés avec succès"
    else
        log_error "Échec des tests unitaires"
        return 1
    fi
}

# Fonction pour exécuter les tests d'intégration
run_integration_tests() {
    log_info "Exécution des tests d'intégration WebSocket..."

    # Vérifier que MongoDB est accessible pour les tests d'intégration
    check_mongodb

    npm test -- --testPathPattern="tests/integration/websocket-messaging.test.js" --verbose --detectOpenHandles

    if [ $? -eq 0 ]; then
        log_success "Tests d'intégration WebSocket terminés avec succès"
    else
        log_error "Échec des tests d'intégration WebSocket"
        return 1
    fi
}

# Fonction pour exécuter les tests de charge
run_load_tests() {
    log_info "Exécution des tests de charge..."
    log_warning "Les tests de charge peuvent prendre plusieurs minutes..."

    check_mongodb

    npm test -- --testPathPattern="tests/load/websocket-load.test.js" --verbose --detectOpenHandles --maxWorkers=1

    if [ $? -eq 0 ]; then
        log_success "Tests de charge terminés avec succès"
    else
        log_error "Échec des tests de charge"
        return 1
    fi
}

# Fonction pour générer un rapport de couverture
generate_coverage() {
    log_info "Génération du rapport de couverture..."

    npm test -- --coverage --testPathPattern="tests/(unit|integration)/.*\.test\.js" --collectCoverageFrom="socket.js,models/**/*.js,services/**/*.js" --coverageDirectory="coverage/messaging"

    if [ $? -eq 0 ]; then
        log_success "Rapport de couverture généré dans coverage/messaging/"

        if command -v xdg-open &>/dev/null; then
            xdg-open coverage/messaging/lcov-report/index.html
        elif command -v open &>/dev/null; then
            open coverage/messaging/lcov-report/index.html
        else
            log_info "Ouvrez coverage/messaging/lcov-report/index.html dans votre navigateur"
        fi
    else
        log_error "Échec de la génération du rapport de couverture"
        return 1
    fi
}

# Fonction pour nettoyer les artefacts de test
cleanup() {
    log_info "Nettoyage des artefacts de test..."

    # Supprimer les fichiers temporaires
    rm -rf .nyc_output
    rm -rf node_modules/.cache

    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    local test_type=${1:-"all"}
    local failed_tests=()

    log_info "Type de test: $test_type"
    echo ""

    case $test_type in
    "unit")
        run_unit_tests || failed_tests+=("unit")
        ;;
    "integration")
        run_integration_tests || failed_tests+=("integration")
        ;;
    "load")
        run_load_tests || failed_tests+=("load")
        ;;
    "coverage")
        generate_coverage || failed_tests+=("coverage")
        ;;
    "all")
        log_info "🚀 Exécution de tous les tests de messagerie..."
        echo ""

        run_unit_tests || failed_tests+=("unit")
        echo ""

        run_integration_tests || failed_tests+=("integration")
        echo ""

        log_warning "Les tests de charge sont optionnels et peuvent être longs"
        read -p "Voulez-vous exécuter les tests de charge ? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_load_tests || failed_tests+=("load")
            echo ""
        fi

        generate_coverage || failed_tests+=("coverage")
        ;;
    *)
        log_error "Type de test non reconnu: $test_type"
        echo "Types disponibles: unit, integration, load, coverage, all"
        exit 1
        ;;
    esac

    echo ""
    echo "============================================"

    if [ ${#failed_tests[@]} -eq 0 ]; then
        log_success "🎉 Tous les tests ont réussi !"
    else
        log_error "❌ Tests échoués: ${failed_tests[*]}"
        exit 1
    fi

    cleanup
}

# Gestion des signaux pour le nettoyage
trap cleanup EXIT

# Vérifier les dépendances au démarrage
log_info "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances npm..."
    npm install
fi

# Exécuter la fonction principale
main "$@"
