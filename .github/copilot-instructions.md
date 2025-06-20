# Instructions SUPCHAT pour GitHub Copilot - VERSION 2025

## Contexte du Projet

SUPCHAT est une plateforme de collaboration d'équipe moderne avec workspaces, channels, messagerie temps réel et gestion des permissions basée sur les rôles. Le projet utilise une architecture multi-service containerisée avec Docker Compose v2.

## Architecture du Projet 2025

### Structure des Services
- **📱 web/**: Application web React 18 + TypeScript + Vite 5 (port 80)
- **📱 mobile/**: Application mobile React Native 0.74 + Expo SDK 51 + New Architecture
- **🚀 api/**: Serveur API Node.js 22 LTS + Express + MongoDB 8.0 (port 3000)
- **🗃️ db**: Base de données MongoDB 8.0 (port 27017)
- **📊 cadvisor**: Monitoring containers (port 8080)

### Environnements Docker Multiples (Compose v2)
Le projet utilise **4 environnements Docker distincts** avec Docker Compose v2 :

1. **Développement** (`docker-compose.yml`):
   - Hot-reload activé avec Vite 5 HMR
   - Volumes de développement montés
   - Ports exposés pour debugging (3000, 3001, 27017)
   - Nodemon pour redémarrage automatique backend
   - Support New Architecture React Native

2. **Tests** (`docker-compose.test.yml`):
   - Environnement isolé avec MongoDB 8.0 test (port 27018)
   - Variables de test dédiées, réseau `supchat-test-network`
   - Données éphémères, nettoyage automatique après exécution
   - Tests compatibles New Architecture

3. **Production** (`docker-compose.prod.yml`):
   - Images optimisées (multi-stage builds Node.js 22)
   - Health checks configurés, réseaux privés internes
   - Variables d'environnement sécurisées
   - MongoDB 8.0 avec optimisations production

4. **Production Sécurisée** (`docker-compose-secure.yml`):
   - HTTPS obligatoire avec certificats SSL
   - Secrets Docker, reverse proxy Nginx, monitoring
   - MongoDB 8.0 avec authentification renforcée

### Scripts d'Automatisation v2
- **docker-manager.sh**: Script principal de gestion (1200+ lignes)
  - Gestion complète des 4 environnements avec Compose v2
  - Menu interactif avec options de démarrage rapide
  - Monitoring, logs, backup MongoDB 8.0 automatique
  - Nettoyage intelligent des ressources
  - Support GPU et nouveaux profils Compose v2

## Stack Technique 2025

### Backend (api/)
- **Runtime**: Node.js 22 LTS (dernière version stable)
- **Framework**: Express.js avec ES modules
- **Base de données**: MongoDB 8.0 avec optimisations performance
- **Authentification**: JWT avec refresh tokens + OAuth2
- **Temps réel**: Socket.io avec support New Architecture
- **Upload**: Multer avec validation renforcée
- **Documentation**: OpenAPI 3.1 + Swagger UI
- **Tests**: Jest 29+ + supertest
- **Sécurité**: bcrypt, CORS, rate limiting, helmet

### Frontend Web (web/)
- **Framework**: React 18 avec Concurrent Features
- **Language**: TypeScript 5.x strict
- **Build tool**: Vite 5 avec optimisations bundle
- **Styling**: SCSS avec CSS Modules
- **HTTP Client**: Axios avec intercepteurs
- **State management**: Context API + useReducer
- **Routing**: React Router v6

### Frontend Mobile (mobile/)
- **Framework**: React Native 0.74 avec New Architecture
- **Platform**: Expo SDK 51 (support bridgeless)
- **Language**: TypeScript 5.x strict
- **Navigation**: Expo Router v3 (file-based routing)
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications avec push tokens

### Infrastructure 2025
- **Containerisation**: Docker + Docker Compose v2
- **Reverse Proxy**: Nginx (production)
- **Monitoring**: cAdvisor + Prometheus (optionnel)
- **Automatisation**: Scripts Bash/PowerShell optimisés

## Conventions de Code 2025

### Architecture et Organisation
- Structure modulaire par domaine fonctionnel
- Séparation stricte des responsabilités (API/Web/Mobile)
- Controllers, Services, Models, Middlewares séparés
- Documentation organisée par catégories dans docs/
- Support ES modules natif Node.js 22

### Backend Node.js 22
- Utiliser **ES modules** avec import/export natifs
- **async/await** systématiquement, jamais de callbacks
- Validation côté serveur **obligatoire** avec Zod (recommandé 2025)
- Gestion d'erreurs centralisée avec middleware d'erreurs
- Structure RESTful pour les routes API
- JSDoc + TypeScript pour documenter les fonctions importantes
- Tests unitaires et d'intégration obligatoires avec Jest 29

### Frontend React 18
- **TypeScript 5.x strict** activé
- Composants fonctionnels avec hooks React 18
- Utilisation des Concurrent Features (Suspense, useTransition)
- Props interfaces définies pour tous les composants
- Nommage PascalCase pour les composants
- Nommage camelCase pour les variables/fonctions
- CSS Modules ou SCSS pour le styling
- Gestion d'état avec Context API + useReducer

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

## Gestion Docker Compose v2

### Environnements
- **Toujours spécifier l'environnement** lors de suggestions Docker
- **Développement**: docker-compose.yml avec Vite 5 HMR
- **Tests**: docker-compose.test.yml pour isolation
- **Production**: docker-compose.prod.yml avec Node.js 22 optimisé

### Fichiers Docker
- Dockerfile.dev pour développement avec nodemon
- Dockerfile pour production multi-stage Node.js 22
- .dockerignore pour exclure node_modules, .git, etc.

### Scripts Compose v2
- Utiliser docker-manager.sh pour toute interaction Docker
- Commandes `docker compose` (sans tiret) pour v2
- Support des profils et GPU si nécessaire
- Préférer les options du menu du docker-manager

## Tests et Qualité 2025

### Stratégie de Tests
- Tests **OBLIGATOIREMENT** dans l'environnement Docker test
- Jest 29+ avec support ES modules natifs
- Jamais de tests sur la DB de production
- Couverture > 85% requise (augmenté)
- Tests d'intégration pour les APIs avec MongoDB 8.0
- Tests unitaires pour la logique métier

### Commandes de Tests v2
```bash
# Via Docker Manager (recommandé)
./docker-manager.sh → Option 18: Lancer les TESTS

# Ou directement avec Compose v2
docker compose -f docker-compose.test.yml up --build

# Tests spécifiques
docker compose -f docker-compose.test.yml exec api npm test -- --testNamePattern="user"
```

## Sécurité 2025

### Gestion des Secrets
- **JAMAIS** de secrets en dur dans le code
- Variables d'environnement via .env.example template
- Configuration automatique via `npm run secure-env`
- Secrets Docker pour production sécurisée
- Support MongoDB 8.0 authentification renforcée

### Bonnes Pratiques
- Validation et sanitisation systématique des inputs avec Zod
- Headers de sécurité (CSP, HSTS)
- CORS configuré correctement
- Rate limiting sur les APIs sensibles
- Hash des mots de passe avec bcrypt (rounds ≥ 12)
- Support des nouvelles fonctionnalités sécurité MongoDB 8.0

## Structure de Fichiers Importante 2025

```
supchat/
├── api/
│   ├── controllers/     # Logique des routes
│   ├── models/         # Schémas MongoDB 8.0
│   ├── services/       # Logique métier
│   ├── middlewares/    # Middlewares Express
│   ├── routes/         # Définition des routes
│   ├── tests/          # Tests avec Jest 29
│   ├── validators/     # Validation Zod/Joi
│   └── types/          # Types TypeScript partagés
├── web/
│   ├── src/
│   │   ├── components/ # Composants React 18
│   │   ├── pages/      # Pages avec Suspense
│   │   ├── services/   # Services API
│   │   ├── hooks/      # Hooks personnalisés
│   │   ├── types/      # Types TypeScript
│   │   └── styles/     # Styles SCSS
├── mobile/
│   ├── app/           # Pages Expo Router v3
│   ├── components/    # Composants RN 0.74
│   ├── services/      # Services API
│   ├── hooks/         # Hooks métier
│   └── types/         # Types TypeScript
├── docs/              # Documentation organisée
│   ├── docker-guides/
│   ├── security-guides/
│   ├── tests-reports/
│   ├── new-architecture/ # Guide New Architecture
│   └── guides/
└── scripts/           # Scripts d'automatisation v2
```

## URLs de Développement

- **Frontend Web**: http://localhost:3000 (Vite 5 dev server)
- **API Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs (OpenAPI 3.1)
- **MongoDB**: mongodb://localhost:27017 (MongoDB 8.0)
- **Monitoring**: http://localhost:8080
- **Expo Dev**: http://localhost:19000 (Expo SDK 51)

## Fonctionnalités Métier

### Authentification 2025
- Email + mot de passe avec validation Zod
- OAuth2 Google et Facebook avec PKCE
- JWT avec refresh tokens sécurisés (algorithme RS256)
- Gestion des profils utilisateur avec avatar
- Support MFA (optionnel)

### Workspaces et Channels
- Création de workspaces avec permissions par rôle
- Channels publics/privés avec permissions héritées
- Invitations d'utilisateurs avec notifications push
- Gestion des membres (Admin, Modérateur, Membre)
- Support threads et réactions (nouvelles fonctionnalités)

### Messagerie Temps Réel
- Messages instantanés via Socket.io avec New Architecture
- Notifications push temps réel avec Expo SDK 51
- Rooms automatiques optimisées (user_&lt;userId&gt;, workspace_&lt;workspaceId&gt;)
- Historique avec pagination optimisée MongoDB 8.0
- Support typing indicators et statuts en ligne

## Nouveautés 2025

### New Architecture React Native
- Bridgeless mode activé par défaut
- JSI pour performance optimisée
- Fabric renderer pour UI fluide
- TurboModules pour modules natifs
- Compatibility layer pour modules legacy

### Expo SDK 51 Spécifique
- File-based routing avec Expo Router v3
- Notifications push améliorées
- Camera et MediaLibrary optimisés
- Expo Dev Tools intégrés
- Support complet New Architecture

### MongoDB 8.0 Fonctionnalités
- Query performance améliorée
- Nouveaux opérateurs aggregation
- Time series collections optimisées
- Vector search (si applicable)
- Improved change streams

### Node.js 22 LTS Avantages
- ES modules natifs sans flag
- Performance améliorée V8
- Nouveau test runner intégré
- Fetch API natif
- Support WebStreams

## Conseils pour Copilot 2025

1. **Toujours considérer la New Architecture** React Native dans les suggestions mobile
2. **Utiliser ES modules** natifs pour Node.js 22
3. **Respecter la structure modulaire** avec types TypeScript partagés
4. **Inclure validation Zod/Joi** dans le code backend
5. **Utiliser Concurrent Features** React 18 (Suspense, useTransition)
6. **Suggérer des optimisations MongoDB 8.0** spécifiques
7. **Documenter avec JSDoc + TypeScript** pour IntelliSense optimal
8. **Considérer les nouvelles APIs** Expo SDK 51
9. **Respecter les conventions Docker Compose v2**
10. **Intégrer les bonnes pratiques sécurité 2025**

Applique toujours ces règles mises à jour lors de la génération de code pour SUPCHAT !