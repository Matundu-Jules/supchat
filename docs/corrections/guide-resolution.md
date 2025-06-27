# 🚀 Guide de résolution complet des tests SUPCHAT

## 📋 Plan d'action étape par étape

### 1️⃣ Vérification des dépendances

```bash
# Vérification des versions
npm list @testing-library/jest-dom @testing-library/react vitest msw

# Si des versions sont manquantes ou incompatibles :
npm install --save-dev @testing-library/jest-dom@^6.2.0
npm install --save-dev @vitest/expect  # Parfois nécessaire pour les types
```

### 2️⃣ Correction du tsconfig.test.json

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

### 3️⃣ Correction du setup.ts

```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Nettoyage après chaque test
afterEach(() => {
  cleanup();
});

// Configuration MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Configuration globale pour les tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

vi.setConfig({ testTimeout: 10000 });
```

### 4️⃣ Correction du server MSW

```typescript
// src/tests/mocks/server.ts
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

### 5️⃣ Correction du test principal

Remplace dans `ChannelsPage.invitations.test.tsx` :

```typescript
// ❌ Ancienne syntaxe MSW
http.get(/\/workspaces\/.*\/channels$/, () => {
  return new Response(JSON.stringify({ channels }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}),

// ✅ Nouvelle syntaxe MSW 2.x
http.get("*/workspaces/*/channels", () => {
  return HttpResponse.json({ channels });
}),
```

```typescript
// ❌ Regex complexe problématique
expect(
  await screen.findByText(/Invitation acceptée(\s+|\n|.)*succès/i, {
    collapseWhitespace: true,
  })
).toBeInTheDocument();

// ✅ Attente simplifiée
await waitFor(
  () => {
    expect(screen.getByText(/invitation acceptée/i)).toBeInTheDocument();
  },
  { timeout: 5000 }
);
```

```typescript
// ❌ Cast explicite
role: "membre" as Role,

// ✅ Utilise satisfies
role: "membre" satisfies Role,
```

### 6️⃣ Commandes de test

```bash
# Test spécifique
npm test ChannelsPage.invitations.test.tsx

# Tous les tests avec verbose
npm test -- --reporter=verbose

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 🔍 Diagnostic des erreurs courantes

### Erreur : "Property 'toBeInTheDocument' does not exist"

**Cause** : Types TypeScript manquants
**Solution** : Vérifier tsconfig.test.json et setup.ts

### Erreur : "Cannot find name 'describe'" ou "Cannot find name 'it'"

**Cause** : Vitest globals mal configurés
**Solution** : Ajouter `"vitest/globals"` dans types

### Erreur : "Timeout exceeded" sur findByText

**Cause** : MSW ou composant pas prêt
**Solutions** :
- Augmenter timeout : `{ timeout: 10000 }`
- Vérifier les handlers MSW
- Utiliser `waitFor` avec timeout

### Erreur : "Request handler not found"

**Cause** : MSW mal configuré
**Solutions** :
- Vérifier que server.listen() est appelé
- Ajouter des handlers catch-all
- Vérifier les patterns d'URL

## 🚀 Test de vérification

Créé un test simple pour vérifier la configuration :

```typescript
// src/tests/verification.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Configuration Test', () => {
  it('devrait fonctionner avec les matchers jest-dom', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    document.body.appendChild(div);
    
    expect(div).toBeInTheDocument(); // ✅ Devrait fonctionner
    expect(div).toHaveTextContent('Hello World'); // ✅ Devrait fonctionner
  });
});
```

## 🎯 Points de vérification final

- [ ] tsconfig.test.json contient les types jest-dom
- [ ] setup.ts utilise l'import /vitest
- [ ] server.ts a des handlers par défaut
- [ ] MSW utilise HttpResponse.json()
- [ ] Tests utilisent waitFor avec timeout
- [ ] Pas de cast `as Type` mais `satisfies Type`
- [ ] userEvent.setup() dans chaque test

## 📞 Si ça ne marche toujours pas

1. **Supprime node_modules et réinstalle** :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Redémarre TypeScript dans VS Code** :
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

3. **Lance un test simple** :
   ```bash
   npm test -- verification.test.tsx
   ```

Tiens-moi au courant de ce qui fonctionne ou pas ! 🤞