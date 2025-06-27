# 🛠️ Roadmap de résolution des tests ChannelsPage.invitations (SUPCHAT)

## Objectif
Corriger tous les problèmes bloquants et warnings sur le test `ChannelsPage.invitations.test.tsx` en appliquant toutes les recommandations issues des fichiers d'analyse et de résolution (`solutions_tests_supchat.csv`, `guide-resolution.md`, `script-resolution.md`).

---

## 📋 Étapes détaillées (ordre conseillé)

### 1️⃣ Vérification et mise à jour des dépendances
- [x] Vérifier la présence et la version de :
  - `@testing-library/jest-dom`
  - `@testing-library/react`
  - `vitest`
  - `msw`
  - `@vitest/expect` (optionnel mais conseillé)
- [ ] Installer ou mettre à jour si besoin :
  ```bash
  npm install --save-dev @testing-library/jest-dom@^6.2.0 @testing-library/react vitest msw @vitest/expect
  ```

### 2️⃣ Correction du fichier `tsconfig.test.json`
- [x] S'assurer que le fichier contient :
  ```json
  {
    "extends": "./tsconfig.app.json",
    "compilerOptions": {
      "types": [
        "vitest/globals",
        "@testing-library/jest-dom",
        "@testing-library/jest-dom/vitest"
      ]
    },
    "include": [
      "src/**/*.test.ts", 
      "src/**/*.test.tsx", 
      "src/tests/**/*"
    ],
    "exclude": []
  }
  ```
  
  ⚠️ Actuellement :
  ```json
  {
    "extends": "./tsconfig.app.json",
    "compilerOptions": {
      "types": ["vitest/globals"]
    },
    "include": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/tests/**/*"],
    "exclude": []
  }
  ```
  ➡️ Il manque les types jest-dom, il faut les ajouter !

### 3️⃣ Correction du setup global des tests (`src/tests/setup.ts`)
- [x] Remplacer tout import de matchers par :
  ```typescript
  import '@testing-library/jest-dom/vitest';
  ```
- [x] Ajouter/adapter la configuration MSW et les mocks globaux (voir guide-resolution.md)
- [x] Nettoyage après chaque test, configuration de `matchMedia` et `localStorage` mockés

### 4️⃣ Correction du serveur MSW (`src/tests/mocks/server.ts`)
- [x] Utiliser la syntaxe MSW 2.x :
  ```typescript
  import { setupServer } from "msw/node";
  import { http, HttpResponse } from 'msw';
  const defaultHandlers = [
    http.all('*', ({ request }) => {
      console.warn(`[MSW] Unhandled request: ${request.method} ${request.url}`);
      return new HttpResponse(null, { status: 200 });
    }),
  ];
  export const server = setupServer(...defaultHandlers);
  ```

### 5️⃣ Refactor du test ChannelsPage.invitations.test.tsx
- [x] Remplacer tous les `new Response(...)` par `HttpResponse.json(...)` (MSW 2.x)
- [x] Adapter les handlers MSW avec la nouvelle syntaxe (plus de regex complexe, utiliser `*/workspaces/*/channels`)
- [x] Remplacer les regex complexes dans les assertions par des `waitFor` ou des regex plus simples
- [x] Remplacer les cast `as Type` par `satisfies Type` si possible
- [x] S'assurer que `userEvent.setup()` est utilisé si besoin

### 6️⃣ Vérification de la configuration Vitest
- [x] Vérifier que l'alias `@contexts` est bien présent dans `vitest.config.ts`
- [x] Ajouter la config MSW si manquante

### 7️⃣ Commandes de test et debug
- [ ] Lancer un test simple de vérification (`verification.test.tsx`)
- [ ] Lancer le test spécifique corrigé :
  ```bash
  npm test -- ChannelsPage.invitations.test.tsx --reporter=verbose
  ```
- [ ] Si tout passe, lancer tous les tests

### 8️⃣ Documentation et commit
- [ ] Documenter chaque modification dans le changelog ou le README de corrections
- [ ] Committer chaque étape avec un message explicite

---

## 🟢 Checklist finale
- [ ] Tous les tests passent sur `ChannelsPage.invitations.test.tsx`
- [ ] Plus d'erreurs de types ou de matchers
- [ ] MSW fonctionne avec la nouvelle syntaxe
- [ ] Setup global des tests conforme aux conventions SUPCHAT 2025
- [ ] Documentation à jour

---

> Cette roadmap doit être suivie strictement pour garantir la conformité et la robustesse des tests SUPCHAT.
