#!/bin/bash
# Script pour vérifier les erreurs de rendu de texte dans React Native

echo "🔍 Vérification des erreurs de rendu de texte..."

# Recherche des espaces orphelins {" "}
echo "Recherche des espaces orphelins..."
if grep -r '{" "}' client-mobile/app/ 2>/dev/null; then
    echo "❌ Espaces orphelins trouvés - à corriger"
else
    echo "✅ Aucun espace orphelin trouvé"
fi

# Recherche des chaînes potentiellement problématiques
echo "Recherche des patterns problématiques..."
if grep -r '>\s*[a-zA-Z][^<]*{' client-mobile/app/ 2>/dev/null; then
    echo "⚠️ Patterns potentiellement problématiques trouvés - à vérifier"
else
    echo "✅ Aucun pattern problématique détecté"
fi

echo "🎉 Vérification terminée"
