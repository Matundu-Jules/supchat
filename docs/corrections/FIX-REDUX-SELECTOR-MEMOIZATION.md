# Correction - Mémoïsation des Sélecteurs Redux

## Problème Identifié

L'avertissement Redux suivant apparaissait dans la console :

```
Selector function returned a different result when called with the same arguments.
This can lead to unnecessary rerenders.
```

### Cause du Problème

Le hook `useReactions.ts` utilisait un sélecteur non mémoïsé qui retournait un nouveau tableau à chaque appel :

```typescript
// ❌ Problématique - Nouveau tableau à chaque appel
const reactions = useSelector((state: RootState) =>
  state.reactions.items.filter((r) => r.messageId === messageId)
);
```

Cette approche causait :

- Des re-rendus inutiles des composants React
- Des avertissements Redux concernant les sélecteurs non optimisés
- Une performance dégradée sur les listes de réactions importantes

## Solution Implémentée

### 1. Mémoïsation avec `createSelector`

Utilisation de `createSelector` de Redux Toolkit pour créer un sélecteur mémoïsé :

```typescript
// ✅ Solution - Sélecteur mémoïsé
const selectReactionsByMessageId = useMemo(
  () =>
    createSelector(
      [(state: RootState) => state.reactions.items, () => messageId],
      (reactions, messageId) =>
        reactions.filter((r) => r.messageId === messageId)
    ),
  [messageId]
);

const reactions = useSelector(selectReactionsByMessageId);
```

### 2. Avantages de cette Approche

- **Performance** : Le sélecteur ne recalcule que si `state.reactions.items` ou `messageId` changent
- **Stabilité** : Retourne la même référence d'objet si les données n'ont pas changé
- **Optimisation React** : Évite les re-rendus inutiles des composants consommateurs

## Code Modifié

### Fichier : `src/hooks/useReactions.ts`

```typescript
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@store/store";

export function useReactions(messageId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Créer un sélecteur mémoïsé pour éviter les re-rendus inutiles
  const selectReactionsByMessageId = useMemo(
    () =>
      createSelector(
        [(state: RootState) => state.reactions.items, () => messageId],
        (reactions, messageId) =>
          reactions.filter((r) => r.messageId === messageId)
      ),
    [messageId]
  );

  const reactions = useSelector(selectReactionsByMessageId);

  // ... reste du code inchangé
}
```

## Bonnes Pratiques pour les Sélecteurs Redux

### ✅ Patterns Recommandés

1. **Utiliser `createSelector` pour les transformations** :

```typescript
const selectFilteredData = createSelector(
  [selectRawData, selectFilter],
  (data, filter) => data.filter((item) => item.type === filter)
);
```

2. **Mémoïser les sélecteurs paramétrés** :

```typescript
const selectItemById = useMemo(
  () =>
    createSelector([selectAllItems, (_, id) => id], (items, id) =>
      items.find((item) => item.id === id)
    ),
  [id]
);
```

3. **Éviter les nouveaux objets/tableaux inline** :

```typescript
// ❌ Éviter
const data = useSelector((state) =>
  state.items.map((item) => ({ ...item, processed: true }))
);

// ✅ Préférer
const selectProcessedItems = createSelector([selectItems], (items) =>
  items.map((item) => ({ ...item, processed: true }))
);
```

### ❌ Anti-patterns à Éviter

1. **Transformations directes dans useSelector** :

```typescript
// ❌ Crée un nouveau tableau à chaque appel
const filtered = useSelector((state) => state.items.filter(predicate));
```

2. **Sélecteurs non mémoïsés avec paramètres** :

```typescript
// ❌ Recalcule à chaque render
const item = useSelector((state) => state.items.find((i) => i.id === id));
```

## Tests et Validation

- ✅ Build TypeScript réussi
- ✅ Aucune erreur de compilation
- ✅ Avertissement Redux éliminé
- ✅ Performance optimisée

## Impact

- **Performance** : Réduction des re-rendus inutiles
- **Stabilité** : Sélecteurs plus prévisibles et optimisés
- **Maintenabilité** : Code plus robuste et conforme aux bonnes pratiques Redux

Cette correction s'intègre parfaitement avec la refactorisation unifiée des channels et contribue à un code plus performant et maintenant.
