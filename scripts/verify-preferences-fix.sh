#!/bin/bash

# Script de vérification des corrections de préférences utilisateur
# SUPCHAT - 18 juin 2025

echo "🔍 Vérification des corrections de préférences utilisateur SUPCHAT"
echo "=============================================================="

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de vérification des fichiers
check_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 existe${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 manquant${NC}"
        return 1
    fi
}

# Fonction de vérification du contenu
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ $1 contient '$2'${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 ne contient pas '$2'${NC}"
        return 1
    fi
}

echo ""
echo "📁 Vérification des fichiers modifiés..."

# Frontend Web
echo ""
echo "🌐 Frontend Web:"
check_file_exists "web/src/store/preferencesSlice.ts"
check_content "web/src/store/preferencesSlice.ts" "initializePreferences"
check_content "web/src/store/preferencesSlice.ts" "resetPreferences"

check_file_exists "web/src/hooks/useSettingsLogic.ts"
check_content "web/src/hooks/useSettingsLogic.ts" "initializePreferences"

check_file_exists "web/src/hooks/useHeaderLogic.ts"
check_content "web/src/hooks/useHeaderLogic.ts" "resetPreferences"

check_file_exists "web/src/App.tsx"
check_content "web/src/App.tsx" "initializePreferences"

# Frontend Mobile
echo ""
echo "📱 Frontend Mobile:"
check_file_exists "mobile/contexts/ThemeContext.tsx"
check_content "mobile/contexts/ThemeContext.tsx" "syncThemeWithServer"

check_file_exists "mobile/app/settings.tsx"
check_content "mobile/app/settings.tsx" "updateStatus"

# Backend
echo ""
echo "🚀 Backend API:"
check_file_exists "api/controllers/userController.js"
check_content "api/controllers/userController.js" "updatePreferences"

check_file_exists "api/services/userService.js"
check_content "api/services/userService.js" "updatePreferences"

check_file_exists "api/models/User.js"
check_content "api/models/User.js" "theme"
check_content "api/models/User.js" "status"

# Documentation
echo ""
echo "📚 Documentation:"
check_file_exists "docs/CORRECTIONS-PREFERENCES-UTILISATEUR.md"

echo ""
echo "🔍 Vérification de la logique Redux..."

# Vérifier que les actions Redux sont bien exportées
if grep -q "export.*initializePreferences" "web/src/store/preferencesSlice.ts" 2>/dev/null; then
    echo -e "${GREEN}✅ Actions Redux exportées correctement${NC}"
else
    echo -e "${RED}❌ Actions Redux manquantes${NC}"
fi

# Vérifier l'import dans les hooks
if grep -q "initializePreferences" "web/src/hooks/useSettingsLogic.ts" 2>/dev/null; then
    echo -e "${GREEN}✅ Imports dans useSettingsLogic corrects${NC}"
else
    echo -e "${RED}❌ Imports dans useSettingsLogic manquants${NC}"
fi

echo ""
echo "🎯 Vérification de la logique thème/statut..."

# Vérifier que le thème utilise localStorage
if grep -q "localStorage.*theme" "web/src/store/preferencesSlice.ts" 2>/dev/null; then
    echo -e "${GREEN}✅ Thème utilise localStorage${NC}"
else
    echo -e "${RED}❌ Thème n'utilise pas localStorage${NC}"
fi

# Vérifier que le statut N'utilise PAS localStorage
if ! grep -q "localStorage.*status" "web/src/store/preferencesSlice.ts" 2>/dev/null; then
    echo -e "${GREEN}✅ Statut n'utilise pas localStorage (correct)${NC}"
else
    echo -e "${YELLOW}⚠️ Statut utilise localStorage (à vérifier)${NC}"
fi

echo ""
echo "🔄 Suggestions de tests manuels:"
echo "1. Connecter deux utilisateurs différents → vérifier statuts séparés"
echo "2. Changer le thème sur web → vérifier sync mobile"
echo "3. Déconnecter/reconnecter → vérifier persistance thème"
echo "4. Tester hors ligne → vérifier comportement gracieux"
echo "5. Changer statut → vérifier API sync"

echo ""
echo "🚀 Pour tester avec Docker:"
echo "   ./docker-manager.sh → Option 1 (Dev)"
echo "   Puis ouvrir http://localhost:80"

echo ""
echo "=============================================================="
echo -e "${GREEN}🎉 Vérification terminée !${NC}"
