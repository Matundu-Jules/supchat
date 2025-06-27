# Guide - Optimisation des Sélecteurs Redux dans SUPCHAT

## Résumé des Optimisations Appliquées

### ✅ Corrections Effectuées

1. **Hook `useReactions.ts`** - Mémoïsation du sélecteur avec `createSelector`
   - **Problème** : Filtrage en ligne retournant un nouveau tableau à chaque appel
   - **Solution** : Sélecteur mémoïsé avec `useMemo` + `createSelector`
   - **Impact** : Élimination de l'avertissement Redux et amélioration des performances

## Analyse des Sélecteurs Existants

### Sélecteurs Optimisés ✅

Les sélecteurs suivants sont déjà optimisés et ne nécessitent pas de modifications :

1. **Sélecteurs de primitives** :

```typescript
// Ces sélecteurs sont optimaux car ils retournent des valeurs primitives
const user = useSelector((state: RootState) => state.auth.user);
const loading = useSelector((state: RootState) => state.auth.isLoading);
const theme = useSelector((state: RootState) => state.preferences.theme);
```

2. **Sélecteurs d'arrays/objets directs** :

```typescript
// Ces sélecteurs sont optimaux car ils retournent des références d'objets stockés
const workspaces = useSelector((state: RootState) => state.workspaces.items);
const messages = useSelector((state: RootState) => state.messages.items);
const notifications = useSelector(
  (state: RootState) => state.notifications.items
);
```

3. **Transformations conditionnelles simples** :

```typescript
// Acceptable car retourne la même référence si déjà un array
workspaces: Array.isArray(workspaces) ? workspaces : [];
```

### Sélecteurs à Surveiller 🔍

Les patterns suivants sont acceptables mais pourraient nécessiter une optimisation si des problèmes de performance apparaissent :

1. **Filtrage local dans les composants** :

```typescript
// Dans ChannelList - Acceptable car dépend des props
const filtered = lowered
  ? channels.filter((c) => c.name.toLowerCase().includes(lowered))
  : channels;
```

2. **Logique de filtrage simple** :

```typescript
// Dans WorkspaceList - Acceptable pour la logique de rendu
const filtered = lowered
  ? workspaces.filter((w) => w.name.toLowerCase().includes(lowered))
  : workspaces;
```

## Bonnes Pratiques Appliquées

### 🎯 Quand Utiliser `createSelector`

**Utilisez `createSelector` pour** :

- ✅ Filtrage ou transformation d'arrays
- ✅ Calculs dérivés complexes
- ✅ Combinaison de plusieurs parties du state
- ✅ Sélecteurs paramétrés (avec `useMemo`)

**Exemple optimal** :

```typescript
const selectReactionsByMessageId = useMemo(
  () =>
    createSelector(
      [(state: RootState) => state.reactions.items, () => messageId],
      (reactions, messageId) =>
        reactions.filter((r) => r.messageId === messageId)
    ),
  [messageId]
);
```

### 🚫 Quand NE PAS Utiliser `createSelector`

**N'utilisez PAS `createSelector` pour** :

- ❌ Sélecteurs de valeurs primitives
- ❌ Accès direct aux objets/arrays stockés
- ❌ Logique de rendu local aux composants

**Exemples corrects sans mémoïsation** :

```typescript
// ✅ Valeurs primitives - Pas de mémoïsation nécessaire
const user = useSelector((state: RootState) => state.auth.user);
const isLoading = useSelector((state: RootState) => state.auth.isLoading);

// ✅ Arrays/objets directs - Pas de mémoïsation nécessaire
const items = useSelector((state: RootState) => state.entities.items);
```

## Monitoring et Détection

### Signaux d'Alertes 🚨

**Surveillez ces avertissements** :

```
Selector function returned a different result when called with the same arguments.
This can lead to unnecessary rerenders.
```

**Indicateurs de problèmes de performance** :

- Re-rendus fréquents sans changement de données
- Ralentissements lors du filtrage/tri
- Console warnings Redux

### Outils de Diagnostic

1. **React DevTools Profiler** - Identifier les re-rendus excessifs
2. **Redux DevTools** - Observer les changements de state
3. **Console warnings** - Détecter les sélecteurs non optimisés

## Template de Correction

### Pattern de Sélecteur Mémoïsé

```typescript
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@store/store";

export function useOptimizedSelector(param: string) {
  // Créer un sélecteur mémoïsé pour éviter les re-rendus inutiles
  const selectData = useMemo(
    () =>
      createSelector(
        [
          (state: RootState) => state.entities.items,
          () => param, // Paramètre constant
        ],
        (items, param) => items.filter((item) => item.category === param)
      ),
    [param] // Dépendances pour useMemo
  );

  return useSelector(selectData);
}
```

## Résultats et Impact

### Métriques d'Amélioration

- ✅ **Avertissements Redux** : 0 (éliminés)
- ✅ **Performance** : Réduction des re-rendus inutiles
- ✅ **Maintenabilité** : Code plus robuste et prévisible
- ✅ **Conformité** : Respect des bonnes pratiques Redux Toolkit

### Tests de Validation

```bash
# Build réussi sans erreurs
npm run build

# Tests passants
npm run test

# Aucun warning dans la console de développement
npm run dev
```

## Prochaines Étapes

### Actions Recommandées

1. **Monitoring continu** : Surveiller les nouveaux sélecteurs ajoutés
2. **Code reviews** : Vérifier l'optimisation des sélecteurs dans les PR
3. **Documentation** : Former l'équipe aux bonnes pratiques Redux
4. **Linting** : Considérer des règles ESLint pour détecter les anti-patterns

### Maintenance

- Réviser les sélecteurs lors des ajouts de nouvelles fonctionnalités
- Profiler régulièrement les performances React
- Maintenir cette documentation à jour avec les nouvelles optimisations

---

**Note** : Cette optimisation s'intègre parfaitement avec la refactorisation unifiée des channels et contribue à un code plus performant et maintenu selon les standards Redux Toolkit 2025.
