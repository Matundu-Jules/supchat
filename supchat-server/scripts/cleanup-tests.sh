#!/bin/bash

# Script de Nettoyage Intelligent des Tests
# Permet de choisir quelle stratégie adopter

echo "🧹 Nettoyage Intelligent des Tests SupChat"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "📊 ANALYSE DES TESTS ACTUELS :"
echo ""

echo -e "${BLUE}Tests EXISTANTS (basiques) :${NC}"
[ -f "tests/user.test.js" ] && echo "  ✅ tests/user.test.js (basique)"
[ -f "tests/workspace.test.js" ] && echo "  ✅ tests/workspace.test.js (basique)"
[ -f "tests/channel.test.js" ] && echo "  ✅ tests/channel.test.js (basique)"
[ -f "tests/message.test.js" ] && echo "  ✅ tests/message.test.js (basique)"
[ -f "tests/routes/auth.test.js" ] && echo "  ✅ tests/routes/auth.test.js (basique)"
[ -f "tests/routes/channels.test.js" ] && echo "  ✅ tests/routes/channels.test.js"
[ -f "tests/routes/workspaces.test.js" ] && echo "  ✅ tests/routes/workspaces.test.js"

echo ""
echo -e "${GREEN}Tests SPÉCIALISÉS (à garder) :${NC}"
[ -d "tests/security" ] && echo "  ✅ tests/security/ (CORS, permissions, rate limit)"
[ -d "tests/sockets" ] && echo "  ✅ tests/sockets/ (WebSocket)"
[ -f "tests/channel.permissions.test.js" ] && echo "  ✅ tests/channel.permissions.test.js"

echo ""
echo -e "${YELLOW}Tests INTÉGRATION (nouveaux complets) :${NC}"
[ -d "tests/integration" ] && echo "  ✅ tests/integration/ (9 suites complètes)"

echo ""
echo "🎯 STRATÉGIES DE NETTOYAGE DISPONIBLES :"
echo ""
echo "1) 🧹 NETTOYAGE COMPLET (Recommandé)"
echo "   → Supprime les tests basiques redondants"
echo "   → Garde les tests spécialisés + intégration"
echo "   → Structure propre et optimisée"
echo ""
echo "2) 🤝 COEXISTENCE"
echo "   → Garde tout"
echo "   → Organise juste la structure"
echo "   → Plus de tests mais potentiels doublons"
echo ""
echo "3) 🔍 ANALYSE SEULEMENT"
echo "   → Montre ce qui sera fait"
echo "   → Aucune suppression"
echo ""
echo "4) ❌ ANNULER"
echo "   → Rien ne change"
echo ""

read -p "Choisissez votre stratégie (1-4) : " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🧹 NETTOYAGE COMPLET SÉLECTIONNÉ${NC}"
        echo ""
        echo "Fichiers qui seront SUPPRIMÉS :"
        
        files_to_remove=(
            "tests/user.test.js"
            "tests/workspace.test.js"
            "tests/channel.test.js"
            "tests/message.test.js"
            "tests/routes/auth.test.js"
        )
        
        for file in "${files_to_remove[@]}"; do
            if [ -f "$file" ]; then
                echo -e "  ${RED}❌ $file${NC}"
            fi
        done
        
        echo ""
        echo "Fichiers qui seront GARDÉS :"
        echo -e "  ${GREEN}✅ tests/security/${NC} (tous les fichiers)"
        echo -e "  ${GREEN}✅ tests/sockets/${NC} (tous les fichiers)" 
        echo -e "  ${GREEN}✅ tests/integration/${NC} (tous les fichiers)"
        echo -e "  ${GREEN}✅ tests/channel.permissions.test.js${NC}"
        echo -e "  ${GREEN}✅ tests/routes/channels.test.js${NC} (si différent)"
        echo -e "  ${GREEN}✅ tests/routes/workspaces.test.js${NC} (si différent)"
        
        echo ""
        read -p "Confirmer la suppression ? (y/N) : " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo ""
            echo "🗑️  Suppression en cours..."
            
            for file in "${files_to_remove[@]}"; do
                if [ -f "$file" ]; then
                    rm "$file"
                    echo -e "  ${RED}🗑️  Supprimé: $file${NC}"
                fi
            done
            
            echo ""
            echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
            echo ""
            echo "📊 STRUCTURE FINALE :"
            echo "tests/"
            echo "├── integration/          ← Tests complets (9 suites)"
            echo "├── security/            ← Tests sécurité spécialisés"
            echo "├── sockets/             ← Tests WebSocket"
            echo "├── channel.permissions.test.js"
            echo "└── routes/              ← Tests routes spécifiques"
            
        else
            echo -e "${YELLOW}❌ Annulé${NC}"
        fi
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🤝 COEXISTENCE SÉLECTIONNÉE${NC}"
        echo ""
        echo "Aucun fichier ne sera supprimé."
        echo "Tous vos tests coexisteront."
        echo ""
        echo "📊 STRUCTURE ACTUELLE MAINTENUE :"
        echo "tests/"
        echo "├── integration/          ← Tests complets (nouveaux)"
        echo "├── routes/              ← Tests routes (existants)"
        echo "├── security/            ← Tests sécurité (existants)"
        echo "├── sockets/             ← Tests WebSocket (existants)"
        echo "├── *.test.js            ← Tests unitaires (existants)"
        echo "└── ..."
        echo ""
        echo -e "${YELLOW}⚠️  Note: Risque de doublons et de tests qui échouent${NC}"
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}🔍 ANALYSE DÉTAILLÉE${NC}"
        echo ""
        echo "TESTS REDONDANTS identifiés :"
        echo ""
        
        if [ -f "tests/user.test.js" ] && [ -f "tests/integration/auth.complete.test.js" ]; then
            echo -e "  ${YELLOW}⚠️  tests/user.test.js VS tests/integration/auth.complete.test.js${NC}"
        fi
        
        if [ -f "tests/workspace.test.js" ] && [ -f "tests/integration/workspaces.complete.test.js" ]; then
            echo -e "  ${YELLOW}⚠️  tests/workspace.test.js VS tests/integration/workspaces.complete.test.js${NC}"
        fi
        
        if [ -f "tests/routes/auth.test.js" ] && [ -f "tests/integration/auth.complete.test.js" ]; then
            echo -e "  ${YELLOW}⚠️  tests/routes/auth.test.js VS tests/integration/auth.complete.test.js${NC}"
        fi
        
        echo ""
        echo "TESTS COMPLÉMENTAIRES (pas de conflit) :"
        echo -e "  ${GREEN}✅ tests/security/ + tests/integration/security.complete.test.js${NC}"
        echo -e "  ${GREEN}✅ tests/sockets/ + tests/integration/websockets.complete.test.js${NC}"
        
        echo ""
        echo "RECOMMANDATION :"
        echo -e "  ${GREEN}→ Relancez le script avec l'option 1 pour nettoyer${NC}"
        ;;
        
    4)
        echo ""
        echo -e "${YELLOW}❌ Annulé - Aucun changement${NC}"
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Option invalide${NC}"
        ;;
esac

echo ""
echo "📝 Pour plus d'informations, consultez :"
echo "   📄 TESTS-COMPARISON.md"
echo "   📄 CLEANUP-GUIDE.md"
