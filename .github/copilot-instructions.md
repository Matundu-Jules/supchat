# Instructions SUPCHAT pour GitHub Copilot

## Contexte du Projet

SUPCHAT est une plateforme de collaboration d'équipe moderne avec workspaces, channels, messagerie temps réel et gestion des permissions basée sur les rôles. Le projet utilise une architecture multi-service containerisée avec Docker.

## Architecture du Projet

### Structure des Services
- **📱 web/**: Application web React + TypeScript + Vite (port 80)
- **📱 mobile/**: Application mobile React Native + Expo 
- **🚀 api/**: Serveur API Node.js + Express + MongoDB (port 3000)
- **🗃️ db**: Base de données MongoDB (port 27017)
- **📊 cadvisor**: Monitoring containers (port 8080)

### Environnements Docker Multiples
Le projet utilise **4 environnements Docker distincts** :

1. **Développement** (`docker-compose.yml`):
   - Hot-reload activé sur tous les services
   - Volumes de développement montés
   - Ports exposés pour debugging (3000, 3001, 27017)
   - Nodemon pour redémarrage automatique backend

2. **Tests** (`docker-compose.test.yml`):
   - Environnement isolé avec DB séparée (port 27018)
   - Variables de test dédiées, réseau `supchat-test-network`
   - Données éphémères, nettoyage automatique après exécution

3. **Production** (`docker-compose.prod.yml`):
   - Images optimisées (multi-stage builds)
   - Health checks configurés, réseaux privés internes
   - Variables d'environnement sécurisées

4. **Production Sécurisée** (`docker-compose-secure.yml`):
   - HTTPS obligatoire avec certificats SSL
   - Secrets Docker, reverse proxy Nginx, monitoring

### Scripts d'Automatisation
- **docker-manager.sh**: Script principal de gestion (1000+ lignes)
  - Gestion complète des 4 environnements
  - Menu interactif avec options de démarrage rapide
  - Monitoring, logs, backup MongoDB automatique
  - Nettoyage intelligent des ressources

## Stack Technique

### Backend (api/)
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Base de données**: MongoDB 6.0
- **Authentification**: JWT avec refresh tokens
- **Temps réel**: Socket.io
- **Upload**: Multer
- **Documentation**: Swagger UI
- **Tests**: Jest + supertest
- **Sécurité**: bcrypt, CORS, rate limiting

### Frontend Web (web/)
- **Framework**: React 18
- **Language**: TypeScript strict
- **Build tool**: Vite
- **Styling**: SCSS
- **HTTP Client**: Axios
- **State management**: Context API
- **Routing**: React Router

### Frontend Mobile (mobile/)
- **Framework**: React Native
- **Platform**: Expo 49+
- **Language**: TypeScript
- **Storage**: AsyncStorage
- **Navigation**: Expo Router

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (production)
- **Monitoring**: cAdvisor
- **Automatisation**: Scripts Bash/PowerShell

## Conventions de Code

### Architecture et Organisation
- Structure modulaire par domaine fonctionnel
- Séparation stricte des responsabilités (API/Web/Mobile)
- Controllers, Services, Models, Middlewares séparés
- Documentation organisée par catégories dans docs/

### Backend Node.js
- Utiliser **async/await** systématiquement, jamais de callbacks
- Validation côté serveur **obligatoire** avec middleware de validation
- Gestion d'erreurs centralisée avec middleware d'erreurs
- Structure RESTful pour les routes API
- JSDoc pour documenter les fonctions importantes
- Tests unitaires et d'intégration obligatoires

### Frontend React/TypeScript
- **TypeScript strict** activé
- Composants fonctionnels avec hooks React
- Props interfaces définies pour tous les composants
- Nommage PascalCase pour les composants
- Nommage camelCase pour les variables/fonctions
- CSS Modules ou SCSS pour le styling
- Gestion d'état avec Context API

### Mobile React Native
- Structure modulaire avec app/, components/, services/
- TypeScript pour tous les fichiers
- Hooks personnalisés pour la logique métier
- AsyncStorage pour la persistance locale
- Navigation avec Expo Router

### Base de Données
- MongoDB avec schémas Mongoose
- Validation des schémas côté base
- Indexation des champs fréquemment interrogés
- Population des références avec select approprié

## Gestion Docker

### Environnements
- **Toujours spécifier l'environnement** lors de suggestions Docker
- **Développement**: docker-compose.yml pour hot-reload
- **Tests**: docker-compose.test.yml pour isolation
- **Production**: docker-compose.prod.yml pour optimisation

### Fichiers Docker
- Dockerfile.dev pour développement avec nodemon
- Dockerfile pour production multi-stage optimisé
- .dockerignore pour exclure node_modules, .git, etc.

### Scripts
- Utiliser docker-manager.sh pour toute interaction Docker
- Ne jamais suggérer de commandes docker-compose directes
- Préférer les options du menu du docker-manager

## Tests et Qualité

### Stratégie de Tests
- Tests **OBLIGATOIREMENT** dans l'environnement Docker test
- Jamais de tests sur la DB de production
- Couverture > 80% requise
- Tests d'intégration pour les APIs
- Tests unitaires pour la logique métier

### Commandes de Tests
```bash
# Via Docker Manager (recommandé)
./docker-manager.sh → Option 18: Lancer les TESTS

# Ou directement
./run-tests.sh

# Tests spécifiques
docker-compose -f docker-compose.test.yml exec api npm test -- --testNamePattern="user"
```

## Sécurité

### Gestion des Secrets
- **JAMAIS** de secrets en dur dans le code
- Variables d'environnement via .env.example template
- Configuration automatique via `npm run secure-env`
- Secrets Docker pour production sécurisée

### Bonnes Pratiques
- Validation et sanitisation systématique des inputs
- Headers de sécurité (CSP, HSTS)
- CORS configuré correctement
- Rate limiting sur les APIs sensibles
- Hash des mots de passe avec bcrypt

## Structure de Fichiers Importante

```
supchat/
├── api/
│   ├── controllers/     # Logique des routes
│   ├── models/         # Schémas MongoDB
│   ├── services/       # Logique métier
│   ├── middlewares/    # Middlewares Express
│   ├── routes/         # Définition des routes
│   ├── tests/          # Tests API
│   └── validators/     # Validation des données
├── web/
│   ├── src/
│   │   ├── components/ # Composants réutilisables
│   │   ├── pages/      # Pages de l'application
│   │   ├── services/   # Services API
│   │   ├── hooks/      # Hooks personnalisés
│   │   └── styles/     # Styles SCSS
├── mobile/
│   ├── app/           # Pages Expo Router
│   ├── components/    # Composants React Native
│   ├── services/      # Services API
│   └── hooks/         # Hooks métier
├── docs/              # Documentation organisée
│   ├── docker-guides/
│   ├── security-guides/
│   ├── tests-reports/
│   └── guides/
└── scripts/           # Scripts d'automatisation
```

## URLs de Développement

- **Frontend Web**: http://localhost:80
- **API Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **MongoDB**: mongodb://localhost:27017
- **Monitoring**: http://localhost:8080

## Fonctionnalités Métier

### Authentification
- Email + mot de passe classique
- OAuth2 Google et Facebook configuré
- JWT avec refresh tokens sécurisés
- Gestion des profils utilisateur avec avatar

### Workspaces et Channels
- Création de workspaces avec permissions par rôle
- Channels publics/privés avec permissions héritées
- Invitations d'utilisateurs avec notifications
- Gestion des membres (Admin, Modérateur, Membre)

### Messagerie Temps Réel
- Messages instantanés via Socket.io
- Notifications push temps réel
- Rooms automatiques (user_<userId>, workspace_<workspaceId>)
- Historique avec pagination

## Conseils pour Copilot

1. **Toujours considérer l'environnement Docker** approprié dans tes suggestions
2. **Respecter la structure modulaire** existante
3. **Inclure la validation et la gestion d'erreurs** dans le code backend
4. **Utiliser TypeScript strict** pour le frontend
5. **Documenter le code complexe** avec JSDoc
6. **Suggérer des tests** appropriés pour le code généré
7. **Respecter les conventions de nommage** du projet
8. **Considérer la sécurité** dans toutes les suggestions