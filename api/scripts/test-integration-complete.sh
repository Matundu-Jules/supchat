#!/bin/bash

# Script de Tests d'Intégration Complet SupChat
# Version: 2.0 - Avec corrections appliquées

echo "🚀 SupChat - Suite de Tests d'Intégration Complète"
echo "=================================================="
echo ""

# Configuration
cd "$(dirname "$0")/.."
export NODE_ENV=test
export MONGODB_URI_TEST="mongodb://localhost:27017/supchat_test_complete"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    local test_name="$1"
    local exit_code="$2"
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ $test_name - RÉUSSI${NC}"
    else
        echo -e "${RED}❌ $test_name - ÉCHOUÉ${NC}"
    fi
}

# Vérifications préliminaires
echo "🔧 Vérifications préliminaires..."

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm non trouvé${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo -e "${GREEN}✅ Environnement prêt${NC}"
echo ""

# Variables pour le rapport
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour exécuter un test
run_test() {
    local test_file="$1"
    local test_name="$2"
    
    echo "🧪 $test_name..."
    
    if [ -f "$test_file" ]; then
        npm test -- "$test_file" --silent > /dev/null 2>&1
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
            print_result "$test_name" 0
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
            print_result "$test_name" 1
            
            # Exécuter en mode verbose pour voir les erreurs
            echo -e "${YELLOW}🔍 Détails des erreurs:${NC}"
            npm test -- "$test_file" --verbose | tail -20
            echo ""
        fi
        
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️  $test_name - Fichier non trouvé: $test_file${NC}"
    fi
}

echo "🧪 PHASE 1: Tests d'Authentification (Corrigés)"
echo "----------------------------------------------"
run_test "tests/integration/auth.fixed.v2.test.js" "Authentification v2"

echo ""
echo "🧪 PHASE 2: Tests de Workspaces"
echo "-------------------------------"
run_test "tests/integration/workspaces.fixed.test.js" "Workspaces (Corrigés)"
run_test "tests/integration/workspaces.complete.test.js" "Workspaces (Originaux)"

echo ""
echo "🧪 PHASE 3: Tests de Channels"
echo "-----------------------------"
run_test "tests/integration/channels.complete.test.js" "Channels"

echo ""
echo "🧪 PHASE 4: Tests de Messagerie"
echo "-------------------------------"
run_test "tests/integration/messaging.complete.test.js" "Messages"

echo ""
echo "🧪 PHASE 5: Tests de Notifications"
echo "----------------------------------"
run_test "tests/integration/notifications.complete.test.js" "Notifications"

echo ""
echo "🧪 PHASE 6: Tests de Permissions"
echo "--------------------------------"
run_test "tests/integration/permissions.complete.test.js" "Permissions"

echo ""
echo "🧪 PHASE 7: Tests d'Intégrations"
echo "--------------------------------"
run_test "tests/integration/integrations-search.complete.test.js" "Intégrations & Recherche"

echo ""
echo "🧪 PHASE 8: Tests de Sécurité"
echo "-----------------------------"
run_test "tests/integration/security.complete.test.js" "Sécurité"

echo ""
echo "🧪 PHASE 9: Tests WebSocket"
echo "---------------------------"
run_test "tests/integration/websockets.complete.test.js" "WebSockets"

echo ""
echo "📊 RAPPORT FINAL"
echo "================"
echo -e "Total des tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests réussis: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests échoués: ${RED}$FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Taux de réussite: ${YELLOW}$SUCCESS_RATE%${NC}"
else
    echo -e "${RED}Aucun test exécuté${NC}"
fi

echo ""
echo "📋 RECOMMANDATIONS"
echo "=================="

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}🎉 Excellent! Votre API est très robuste.${NC}"
    echo "✅ Prêt pour la production"
    echo "✅ Qualité de code élevée"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Bon niveau, mais amélioration possible.${NC}"
    echo "🔧 Corriger les tests échoués"
    echo "📖 Revoir la documentation des erreurs"
elif [ $SUCCESS_RATE -ge 50 ]; then
    echo -e "${RED}🚨 Niveau moyen - Corrections nécessaires.${NC}"
    echo "🛠️  Revoir l'architecture"
    echo "🧪 Améliorer la couverture de tests"
else
    echo -e "${RED}💥 Niveau critique - Refactoring recommandé.${NC}"
    echo "🔄 Revoir complètement l'implémentation"
    echo "📚 Former l'équipe aux bonnes pratiques"
fi

echo ""
echo "📝 FICHIERS DE RAPPORTS GÉNÉRÉS"
echo "==============================="
echo "📄 tests/reports/auth-final-report.md"
echo "📄 tests/reports/auth-test-analysis.md"

echo ""
echo "🎯 PROCHAINES ÉTAPES"
echo "==================="
echo "1. Corriger les tests échoués identifiés"
echo "2. Implémenter les routes manquantes"
echo "3. Améliorer la validation des données"
echo "4. Optimiser les performances WebSocket"
echo "5. Renforcer la sécurité globale"

echo ""
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🏆 BRAVO! Tous les tests passent!${NC}"
    exit 0
else
    echo -e "${RED}🔧 Des corrections sont nécessaires.${NC}"
    exit 1
fi
