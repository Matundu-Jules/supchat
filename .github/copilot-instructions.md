````instructions
# Instructions SUPCHAT pour GitHub Copilot - VERSION 2025 MISE À JOUR

## 🚨 **RÈGLES CRITIQUES - ARCHITECTURE DOCKER OBLIGATOIRE - VERSION 2025**

### **❌ INTERDICTIONS ABSOLUES - AUCUNE EXCEPTION**

1. **❌ INTERDICTION TOTALE** de créer des fichiers `.env` dans `web/`, `api/`, `mobile/`
2. **❌ INTERDICTION TOTALE** de toute commande manuelle `npm`, `node`, `yarn`, `npx` hors Docker
3. **❌ INTERDICTION TOTALE** de scripts de test manuels (test-_.sh, test-_.js)
4. **❌ INTERDICTION TOTALE** de workflows de développement hors Docker Compose
5. **❌ INTERDICTION TOTALE** de validation manuelle de configuration
6. **❌ INTERDICTION TOTALE** de suggérer `npm test`, `npm start`, `node script.js`
7. **❌ INTERDICTION TOTALE** de créer des scripts de diagnostic hors Docker
8. **❌ INTERDICTION TOTALE** de modifier les fichiers SCSS de base (\_variables.scss, \_themes.scss, \_base.scss, \_breakpoints.scss)

### **✅ RÈGLES OBLIGATOIRES - RESPECT STRICT**

1. **✅ CONSULTATION MÉMOIRE AUTOMATIQUE** : Au début de chaque nouvelle conversation ou demande, TOUJOURS consulter la mémoire (knowledge graph) avec `mcp_memory_read_graph` ou `mcp_memory_search_nodes` pour récupérer le contexte du projet, les conventions validées, et l'historique des modifications
2. **✅ SEULS** les fichiers `.env.*` à la racine du projet sont autorisés (`.env.test`, `.env.development`, `.env.production`)
3. **✅ TOUS** les tests doivent passer par `docker-compose.test.yml` avec le bon fichier d'environnement
4. **✅ TOUTE** exécution doit passer par les environnements Docker : `development`, `test`
5. **✅ UTILISATION EXCLUSIVE** de `./docker-manager.sh` pour toute action
6. **✅ VARIABLES D'ENVIRONNEMENT** gérées uniquement par Docker Compose avec les bons fichiers `.env.*`
7. **✅ SEULES COMMANDES AUTORISÉES** : `docker compose -f docker-compose.*.yml --env-file .env.*`
8. **✅ DÉBOGAGE UNIQUEMENT** via logs Docker et outils intégrés
9. **✅ TESTS** uniquement dans `web/src/tests/` et `api/tests/` via Docker
10. **✅ DEMANDER CONFIRMATION** avant tests ou donner logs Docker

### **🔧 ARCHITECTURE CORRECTE - CONFIGURATION ACTUELLE**

- **Configuration** : Fichiers `.env.*` multiples à la racine selon l'environnement, lus par Docker Compose
- **Développement** : `docker compose -f docker-compose.development.yml --env-file .env.development up`
- **Tests** : `docker compose -f docker-compose.test.yml --env-file .env.test up --build`
- **Débogage** : `docker compose logs -f [service]`
- **Gestion** : `./docker-manager.sh` (menu interactif modulaire)
- **Focus** : Seulement `development` et `test` (prod/secure supprimés temporairement)

## Contexte du Projet

SUPCHAT est une plateforme de collaboration d'équipe moderne avec workspaces, channels, messagerie temps réel et gestion des permissions basée sur les rôles. Le projet utilise une architecture multi-service containerisée avec Docker Compose v2.

**🎯 FOCUS ACTUEL** : Développement concentré sur `web/` (frontend) et `api/` (backend). La partie `mobile/` n'est pas encore développée.

## Architecture du Projet 2025 - CONFIGURATION ACTUELLE

### Structure des Services Actifs

- **📱 web/**: Application web React 18 + TypeScript + Redux Toolkit + Vite 5 (port 80 exposé via Docker)
- ** api/**: Serveur API Node.js 22 LTS + Express + MongoDB 8.0 (port 3000)
- **🗃️ db**: Base de données MongoDB 8.0 (port 27017 dev / 27018 test)
- **📊 cadvisor**: Monitoring containers (port 8080)
- **📱 mobile/**: React Native 0.74 + Expo SDK 51 (NON DÉVELOPPÉ - à ignorer temporairement)

**IMPORTANT**: Tous les services fonctionnent UNIQUEMENT via Docker Compose. Aucune exécution manuelle avec `npm start` ou `node` n'est autorisée.

### Environnements Docker Actifs (Compose v2)

Le projet utilise **2 environnements Docker distincts** actuellement :

1. **Développement** (`docker-compose.development.yml`):

   - Hot-reload activé avec Vite 5 HMR
   - Volumes de développement montés
   - Ports exposés : web (80), api (3000), db (27017), cadvisor (8080)
   - Nodemon pour redémarrage automatique backend
   - **COMMANDE** : `docker compose -f docker-compose.development.yml up`

2. **Tests** (`docker-compose.test.yml`):

   - Environnement isolé avec MongoDB 8.0 test (port 27018)
   - Variables de test dédiées, réseau `supchat-test-network`
   - Données éphémères, nettoyage automatique après exécution
   - Tests avec Vitest + MSW (web) et Jest (api)
   - **COMMANDE** : `docker compose -f docker-compose.test.yml up --build`

### Scripts d'Automatisation v2

- **docker-manager.sh**: Script principal de gestion modulaire
  - Gestion complète des 2 environnements avec Compose v2
  - Menu interactif avec options de démarrage rapide
  - Monitoring, logs, backup MongoDB 8.0 automatique
  - Structure modulaire : `docker-manager/utils.sh`, `docker-manager/menu.sh`, etc.

## Stack Technique 2025 - MISE À JOUR

### Backend (api/)

- **Runtime**: Node.js 22 LTS (dernière version stable)
- **Framework**: Express.js avec ES modules
- **Base de données**: MongoDB 8.0 avec optimisations performance
- **Authentification**: JWT avec refresh tokens + OAuth2
- **Temps réel**: Socket.io
- **Upload**: Multer avec validation renforcée
- **Documentation**: OpenAPI 3.1 + Swagger UI
- **Tests**: Jest 29+ + supertest
- **Sécurité**: bcrypt, CORS, rate limiting, helmet

### Frontend Web (web/) - **ARCHITECTURE REDUX TOOLKIT**

- **Framework**: React 18 avec Concurrent Features
- **Language**: TypeScript 5.x strict
- **Build tool**: Vite 5.4.19 avec optimisations bundle
- **State management**: **Redux Toolkit v2.5.1** (ARCHITECTURE CENTRALE)
- **Styling**: SCSS avec CSS Modules (fichiers \_variables.scss, \_themes.scss, \_base.scss, \_breakpoints.scss OBLIGATOIRES)
- **HTTP Client**: Axios avec intercepteurs
- **Routing**: React Router v7.2.0
- **Validation**: Yup v1.6.1
- **Tests**: **Vitest v1.6.1** + React Testing Library + **MSW v2.1.0**
- **Mobile-first**: Responsive design avec Media queries dans \_breakpoints.scss

### Structure Redux Toolkit Configurée

```typescript
// Store configuré avec slices modulaires
store = {
  auth: authSlice,
  workspaces: workspacesSlice,
  channels: channelsSlice,
  messages: messagesSlice,
  notifications: notificationsSlice,
  preferences: preferencesSlice,
  reactions: reactionsSlice,
  notificationPrefs: notificationPrefSlice,
};

// Hooks typés disponibles
useAppDispatch = useDispatch.withTypes<AppDispatch>();
useAppSelector = useSelector.withTypes<RootState>();
```

### Frontend Mobile (mobile/) - **NON DÉVELOPPÉ ACTUELLEMENT**

⚠️ **IMPORTANT** : Le mobile n'est pas encore développé. Se concentrer uniquement sur web/ et api/.

- React Native 0.74 + Expo SDK 51 (à développer plus tard)
- Navigation avec Expo Router v3 (planifié)
- TypeScript 5.x (prévu)

### Infrastructure 2025

- **Containerisation**: Docker + Docker Compose v2
- **Reverse Proxy**: Nginx (production)
- **Monitoring**: cAdvisor + Prometheus (optionnel)
- **Automatisation**: Scripts Bash/PowerShell optimisés

## Conventions de Code 2025 - MISE À JOUR

### Architecture et Organisation

- Structure modulaire par domaine fonctionnel
- Séparation stricte des responsabilités (API/Web/Mobile)
- Controllers, Services, Models, Middlewares séparés
- Documentation organisée par catégories dans docs/
- Support ES modules natif Node.js 22
- **Tous les types TypeScript métiers (User, Channel, Message, etc.) doivent être définis dans le dossier `web/src/types/` dans un fichier dédié, et importés dans les composants/hooks. Ne jamais redéfinir un type métier dans un composant.**

### Backend Node.js 22

- Utiliser **ES modules** avec import/export natifs
- **async/await** systématiquement, jamais de callbacks
- Validation côté serveur **obligatoire** avec Joi ou Zod
- Gestion d'erreurs centralisée avec middleware d'erreurs
- Structure RESTful pour les routes API
- JSDoc + TypeScript pour documenter les fonctions importantes
- Tests unitaires et d'intégration obligatoires avec Jest 29

### Frontend React 18 - **NOUVELLES CONVENTIONS**

- **TypeScript 5.x strict** activé
- **Redux Toolkit** pour la gestion d'état globale (NOUVEAU)
- Composants fonctionnels avec hooks React 18
- Utilisation des Concurrent Features (Suspense, useTransition)
- Props interfaces définies pour tous les composants
- **Alias configurés** : @components, @pages, @store, @hooks, @services, @styles, @utils
- Nommage PascalCase pour les composants
- Nommage camelCase pour les variables/fonctions
- CSS Modules ou SCSS pour le styling
- **Validation avec Yup** au lieu de Zod (CHANGEMENT)

### Mobile React Native 0.74 + New Architecture

- Structure modulaire avec Expo Router v3
- TypeScript 5.x pour tous les fichiers
- Hooks personnalisés pour la logique métier
- AsyncStorage pour la persistance locale
- Navigation avec Expo Router v3 (file-based)
- Support bridgeless activé par défaut

### Base de Données MongoDB 8.0

- Schémas Mongoose avec validation stricte
- Indexation optimisée pour MongoDB 8.0
- Population des références avec select approprié
- Utilisation des nouvelles fonctionnalités performance MongoDB 8.0

## Structure de Fichiers Importante 2025 - **CONFIGURATION ACTUELLE**

```
supchat/
├── .env.development        # Variables développement (SEUL AUTORISÉ À LA RACINE)
├── .env.test              # Variables test (SEUL AUTORISÉ À LA RACINE)
├── .env.production        # Variables production (SEUL AUTORISÉ À LA RACINE)
├── api/
│   ├── controllers/       # Logique des routes
│   ├── models/           # Schémas MongoDB 8.0
│   ├── services/         # Logique métier
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Définition des routes
│   ├── tests/            # Tests avec Jest 29 (OBLIGATOIRE pour tests API)
│   ├── validators/       # Validation Joi/Zod
│   └── types/            # Types TypeScript partagés
├── web/                  # **ARCHITECTURE REDUX TOOLKIT**
│   ├── src/
│   │   ├── components/   # Composants React 18
│   │   ├── config/       # Configuration app
│   │   ├── contexts/     # Contextes React (Socket, etc.)
│   │   ├── hooks/        # Hooks personnalisés typés (useAppDispatch, useAppSelector)
│   │   ├── pages/        # Pages avec Suspense
│   │   │   └── channels/
│   │   │       └── ChannelsPage/   # ✅ Page unique canaux (ex-UnifiedChannelPage)
│   │   ├── services/     # Services API
│   │   ├── store/        # **Redux Toolkit store et slices (CENTRAL)**
│   │   │   ├── store.ts          # Configuration du store
│   │   │   ├── authSlice.ts      # Authentification
│   │   │   ├── workspacesSlice.ts
│   │   │   ├── channelsSlice.ts
│   │   │   ├── messagesSlice.ts
│   │   │   └── ...
│   │   ├── styles/     # **STYLES SCSS OBLIGATOIRES**
│   │   │   ├── _variables.scss  # **NE PAS MODIFIER**
│   │   │   ├── _themes.scss     # **NE PAS MODIFIER**
│   │   │   ├── _base.scss       # **NE PAS MODIFIER**
│   │   │   └── _breakpoints.scss # **NE PAS MODIFIER**
│   │   ├── tests/      # **Tests Vitest + MSW (OBLIGATOIRE pour tests web)**
│   │   ├── types/      # Types TypeScript locaux
│   │   └── utils/      # Utilitaires
├── mobile/             # **NON DÉVELOPPÉ - À IGNORER**
│   └── (structure planifiée mais non active)
├── docs/              # Documentation organisée
│   ├── docker-guides/
│   ├── security-guides/
│   └── tests-reports/
└── docker-manager/    # Scripts modulaires v2
    ├── utils.sh
    ├── menu.sh
    ├── environments.sh
    └── ...
```

## Pages de canaux - Convention 2025

- **Page unique** : `web/src/pages/channels/ChannelsPage/` (anciennement UnifiedChannelPage)
- **Toutes les anciennes pages** `ChannelsPage` et `ChannelChatPage` **ont été supprimées** pour éviter les doublons.
- **La navigation et la logique de chat passent exclusivement par cette page unique.**

## Gestion Redux Toolkit - **NOUVEAU**

### Configuration Store

```typescript
// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import workspaceSlice from "./slices/workspaceSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    workspace: workspaceSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Structure des Slices

```typescript
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});
```

### Hooks Redux Typés

```typescript
// src/hooks/redux.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@store/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## Tests et Qualité 2025 - **CONFIGURATION ACTUELLE - CONVENTIONS VALIDÉES**

### Stratégie de Tests - **APPROCHE DOCKER-FIRST**

- **Vitest** comme test runner principal pour web/ au lieu de Jest
- **MSW (Mock Service Worker)** pour les mocks API
- Tests **OBLIGATOIREMENT** dans l'environnement Docker test avec `.env.test`
- **Couverture ≥ 70%** requise
- Tests d'intégration pour les APIs avec MongoDB 8.0
- Tests unitaires pour la logique métier et les slices Redux

### Configuration Tests par Service

#### Frontend Web (`web/src/tests/`)

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      thresholds: {
        global: { branches: 70, functions: 70, lines: 70, statements: 70 },
      },
    },
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@contexts": path.resolve(__dirname, "./src/contexts"), // **AJOUTÉ - REQUIS**
      "@ts_types": path.resolve(__dirname, "./src/types"),
    },
  },
});
```

#### Backend API (`api/tests/`)

```javascript
// jest.config.js pour l'API
module.exports = {
  testEnvironment: "node",
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
};
```

### Commandes de Tests via Docker UNIQUEMENT

```bash
# Via Docker Manager (recommandé)
./docker-manager.sh → Option : Lancer les TESTS

# Ou directement avec Compose v2 + bon fichier .env
docker compose -f docker-compose.test.yml --env-file .env.test up --build

# Tests spécifiques
docker compose -f docker-compose.test.yml --env-file .env.test exec web-test npm test
docker compose -f docker-compose.test.yml --env-file .env.test exec api npm test
```

### ⚠️ **COMPORTEMENT REQUIS POUR LES TESTS - CONVENTIONS VALIDÉES**

1. **DEMANDER CONFIRMATION** avant de lancer des tests automatiquement
2. **PROPOSER LES LOGS** Docker en cas de problème
3. **UTILISER UNIQUEMENT** les environnements de test Docker existants avec le bon `.env.test`
4. **NE JAMAIS CRÉER** de scripts de test manuels hors Docker

### **Helpers de Test - Configuration Validée**

```typescript
// src/tests/test-utils.tsx - **CONFIGURATION FINALE VALIDÉE**
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { store } from '@store/store';

// **Mock du hook useSocket - OBLIGATOIRE**
vi.mock('@hooks/useSocket', () => ({
  useSocket: () => ({
    socket: {
      id: 'mock-socket-id',
      connected: true,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    connected: true,
    socketId: 'mock-socket-id'
  })
}));

// **MockSocketProvider - Configuration finale validée**
const MockSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockContextValue = {
    socket: {
      id: 'mock-socket-id',
      connected: true,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    connected: true,
    socketId: 'mock-socket-id'
  };

  return (
    <div data-testid="mock-socket-provider">
      {children}
    </div>
  );
};

// **TestProvider - Helper principal validé**
const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <MockSocketProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </MockSocketProvider>
  </Provider>
);

// **renderWithProviders - Fonction finale validée**
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestProvider });
};

export { renderWithProviders, TestProvider, MockSocketProvider };
```

#### Tests Pattern Validé

```typescript
// ✅ CORRECT - Pattern de test validé avec tous les mocks
import { renderWithProviders } from '@tests/test-utils';
import { vi } from 'vitest';

// Mock nécessaire si useSocket utilisé directement
vi.mock('@hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { id: 'mock', connected: true, on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    connected: true,
    socketId: 'mock'
  })
}));

test('Mon composant', () => {
  const { getByText } = renderWithProviders(<MonComposant />);
  expect(getByText('Texte attendu')).toBeInTheDocument();
});
```

## Conseils pour Copilot 2025 - **MISE À JOUR - CONVENTIONS VALIDÉES**

0. **🧠 CONSULTATION MÉMOIRE PRIORITAIRE** : AVANT toute action ou réponse, OBLIGATOIREMENT consulter la mémoire avec `mcp_memory_read_graph` ou `mcp_memory_search_nodes` pour récupérer le contexte complet du projet SUPCHAT, les patterns validés, l'historique des corrections, et les conventions techniques
1. **Toujours utiliser Redux Toolkit** au lieu de Context API pour l'état global
2. **Utiliser les alias configurés** (@components, @store, @contexts, etc.)
3. **Privilégier Yup** pour la validation côté client
4. **Utiliser Vitest + MSW** pour tous les tests
5. **Respecter la nouvelle structure modulaire** avec types/ et config/
6. **Utiliser les hooks Redux typés** (useAppSelector, useAppDispatch)
7. **Documenter avec JSDoc + TypeScript** pour IntelliSense optimal
8. **Considérer React Router v7** patterns pour la navigation
9. **Utiliser ES modules** natifs pour Node.js 22
10. **Intégrer les bonnes pratiques sécurité 2025**
11. **RESPECTER les fichiers SCSS existants** (\_variables.scss, \_themes.scss, etc.)
12. **DEMANDER CONFIRMATION** avant de lancer des tests
13. **UTILISER UNIQUEMENT Docker** pour toute exécution avec les bons fichiers `.env.*`
14. **UTILISER les helpers de test validés** (`renderWithProviders`, `TestProvider`, `MockSocketProvider`)
15. **TOUJOURS inclure l'alias @contexts** dans la configuration Vitest

### Tests avec Vitest + MSW - **Patterns validés**

```typescript
// ✅ Test avec MSW et helpers validés
import { renderWithProviders } from '@tests/test-utils';
import { server } from '@tests/mocks/server';
import { rest } from 'msw';

beforeEach(() => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.json([]));
    })
  );
});

test('Mon test', () => {
  const { getByText } = renderWithProviders(<MonComposant />);
  expect(getByText('Mon texte')).toBeInTheDocument();
});
```

## **CONFIGURATION FINALE VALIDÉE - RÉSUMÉ EXÉCUTIF**

### ✅ **TESTS FRONTEND : 112/112 RÉUSSIS**

- ✅ **Environnement Docker test** : `docker compose -f docker-compose.test.yml --env-file .env.test`
- ✅ **Configuration Vitest** : Alias `@contexts` ajouté et requis
- ✅ **Helpers de test** : `renderWithProviders`, `TestProvider`, `MockSocketProvider` validés
- ✅ **Mocks** : `useSocket` hook mocké globalement pour tous les tests
- ✅ **Architecture** : Redux Toolkit + Vitest + MSW entièrement opérationnels

### ✅ **CONVENTIONS OBLIGATOIRES VALIDÉES**

1. **Fichiers d'environnement** : Multiples `.env.*` à la racine selon l'environnement
2. **Tests Docker-first** : Toujours avec le bon fichier `.env.test`
3. **Alias TypeScript** : `@contexts` requis pour les tests
4. **Helpers de test** : Configuration finale validée et opérationnelle
5. **Mocks** : Pattern useSocket mocké globalement validé

### ⚠️ **RAPPELS CRITIQUES**

- **JAMAIS** de fichiers `.env` dans les sous-dossiers `web/`, `api/`, `mobile/`
- **TOUJOURS** utiliser Docker Compose avec le bon fichier `.env.*`
- **OBLIGATOIRE** : Alias `@contexts` dans toute configuration Vitest
- **REQUIS** : Helpers de test validés pour tous nouveaux tests
- **INTERDIT** : Modification des fichiers SCSS de base

---

*Cette documentation reflète l'état final validé après résolution complète des 112 tests frontend avec succès.*
````
