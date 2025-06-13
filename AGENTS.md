# AGENTS.md - Configuration Officielle pour OpenAI Codex

**Projet:** SUPCHAT - Plateforme de messagerie collaborative  
**Version:** 1.0.0  
**Date:** 13 juin 2025  
**Scope:** Repository entier et sous-modules

## Scope hiérarchique du projet

### Architecture globale
- **Type:** Microservices conteneurisés avec séparation client/serveur
- **Pattern:** MVC (Model-View-Controller) pour le backend
- **Clients:** Multi-plateformes (React Web + React Native Mobile)
- **API:** REST avec Node.js/Express
- **Base de données:** MongoDB avec Mongoose ODM

### Structure des répertoires
```
/
├── client-web/          # Application web React+TypeScript+Vite
├── client-mobile/       # Application mobile React Native+Expo
├── supchat-server/      # API backend Node.js+Express+MongoDB
├── docker-compose.yml   # Orchestration conteneurs
└── .env.example         # Template variables d'environnement
```

### Hiérarchie de scope (précédence décroissante)
1. Instructions système directes
2. AGENTS.md spécifiques aux sous-modules
3. AGENTS.md racine (ce fichier)
4. Conventions par défaut

## Conventions de code

### JavaScript/TypeScript Standards
- **Syntaxe:** ES2022+ avec modules ES6
- **Typage:** TypeScript strict activé
- **Quotes:** Doubles quotes ("string") pour les chaînes
- **Indentation:** 2 espaces (pas de tabs)
- **Line endings:** LF (Unix)
- **Naming conventions:**
  - Variables/fonctions: `camelCase`
  - Classes/composants: `PascalCase`
  - Constantes: `SCREAMING_SNAKE_CASE`
  - Fichiers: `kebab-case.extension`

### ESLint Configuration
- **Base:** @eslint/js recommended
- **TypeScript:** typescript-eslint strict
- **React:** eslint-plugin-react-hooks
- **Règles spécifiques:**
  - Semi-colons obligatoires
  - Trailing commas pour objets/arrays
  - No unused variables (erreur)
  - Console.log autorisé en dev, warning en prod

### Prettier Integration
- **Print width:** 80 caractères
- **Tab width:** 2 espaces
- **Semi:** true
- **Single quote:** false (double quotes)
- **Trailing comma:** es5

## Patterns architecturaux

### Backend (supchat-server/) - Pattern MVC
```
controllers/     # Logique métier et actions CRUD
├── authController.js
├── workspaceController.js
├── channelController.js
└── messageController.js

models/          # Schémas MongoDB avec Mongoose
├── User.js
├── Workspace.js
├── Channel.js
├── Message.js
└── Permission.js

routes/          # Définition endpoints REST API
├── auth.Routes.js
├── workspace.Routes.js
├── channel.Routes.js
└── message.Routes.js

middlewares/     # Traitements transversaux
├── authMiddleware.js
├── validationMiddleware.js
└── errorMiddleware.js
```

### Frontend Web (client-web/) - Hooks + Redux
- **State Management:** Redux Toolkit avec slices
- **Composants:** Functional components avec hooks
- **Hooks personnalisés:** Préfixe `use*` obligatoire
- **Structure:**
  ```
  src/
  ├── components/      # Composants réutilisables
  ├── pages/          # Pages/vues principales
  ├── hooks/          # Custom hooks (useAuth, useWorkspace)
  ├── store/          # Redux store et slices
  ├── services/       # Appels API (Axios)
  ├── types/          # Interfaces TypeScript
  └── utils/          # Fonctions utilitaires
  ```

### Mobile (client-mobile/) - Expo File-based Routing
- **Navigation:** Expo Router avec routing basé fichiers
- **Structure:**
  ```
  app/              # Routes principales (file-based)
  ├── (auth)/       # Routes authentification
  ├── (tabs)/       # Navigation par onglets
  └── _layout.tsx   # Layout racine
  
  components/       # Composants UI mobiles
  contexts/         # Context API pour état global
  hooks/           # Hooks personnalisés mobiles
  ```

## Instructions de test

### Jest Configuration (Backend)
- **Environment:** Node.js
- **Setup:** `./tests/setup.js` pour configuration globale
- **Coverage:** Minimum 80% pour controllers et models
- **Structure tests:**
  ```
  tests/
  ├── unit/           # Tests unitaires
  ├── integration/    # Tests d'intégration API
  └── setup.js        # Configuration Jest globale
  ```

### Tests Frontend
- **Framework:** Jest + React Testing Library (à implémenter)
- **Convention nommage:** `*.test.tsx` ou `*.spec.tsx`
- **Localisation:** Co-location avec composants testés

### Commandes de test obligatoires
```bash
# Backend
npm test                    # Lance Jest en mode séquentiel
npm run test:watch         # Mode watch (à implémenter)
npm run test:coverage      # Rapport de couverture (à implémenter)

# Frontend Web
npm run test              # Tests unitaires React
npm run test:e2e          # Tests E2E Cypress (à implémenter)

# Mobile
npm test                  # Tests unitaires mobile
```

### Validation pre-commit obligatoire
- ESLint doit passer sans erreurs
- Tests unitaires doivent passer à 100%
- Build TypeScript doit réussir
- Formatage Prettier appliqué

## Workflow CI/CD et déploiement

### Docker Configuration
- **Orchestration:** docker-compose.yml obligatoire
- **Services requis:**
  - `supchat-api` (backend)
  - `supchat-web` (frontend)
  - `supchat-mobile` (client mobile)
  - `mongo` (base de données)
  - `cadvisor` (monitoring)

### Variables d'environnement
- **Fichier template:** `.env.example` à jour obligatoire
- **Secrets:** JAMAIS en clair dans le code
- **Variables critiques:**
  ```
  NODE_ENV=production|development
  JWT_SECRET=<secret-fort>
  MONGO_URI=mongodb://localhost:27017/supchat
  GOOGLE_CLIENT_ID=<oauth-google>
  FACEBOOK_APP_ID=<oauth-facebook>
  ```

### Scripts de déploiement
```bash
# Déploiement complet
docker-compose up --build

# Development mode
npm run dev              # Web client (Vite)
npm start               # API server (Nodemon)
npx expo start          # Mobile client (Expo)
```

### Health checks obligatoires
- API endpoint `/health` doit retourner status 200
- Base de données accessible via connexion MongoDB
- Services Docker doivent démarrer en moins de 2 minutes

## Sécurité

### CSRF Token Management
- **Middleware:** csrf-csrf configuré
- **Headers requis:** X-CSRF-TOKEN pour mutations
- **Validation:** Obligatoire pour POST/PUT/DELETE
- **Exception:** Routes authentication (/api/auth/*)

### JWT Validation
- **Algorithm:** HS256 obligatoire
- **Expiration:** 24h pour access tokens
- **Refresh:** Implémentation recommandée
- **Middleware:** authMiddleware.js pour routes protégées
- **Headers:** `Authorization: Bearer <token>`

### Authentication Flow
```javascript
// Pattern requis pour vérification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### Validation de données
- **Backend:** Joi schemas obligatoires
- **Frontend:** Yup validation pour formulaires
- **Sanitization:** Input sanitization systématique
- **Rate limiting:** express-rate-limit (à implémenter)

## API Conventions

### REST Endpoints Structure
```
/api/v1/auth/           # Authentification
├── POST /login         # Connexion utilisateur
├── POST /register      # Inscription
├── POST /refresh       # Renouvellement token
└── DELETE /logout      # Déconnexion

/api/v1/workspaces/     # Gestion workspaces
├── GET /               # Liste workspaces utilisateur
├── POST /              # Création workspace
├── GET /:id            # Détails workspace
├── PUT /:id            # Modification workspace
└── DELETE /:id         # Suppression workspace

/api/v1/channels/       # Gestion canaux
/api/v1/messages/       # Gestion messages
/api/v1/users/          # Gestion utilisateurs
```

### Response Format Standard
```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response  
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Vérifications programmatiques obligatoires

### Pre-commit hooks (doit passer)
```bash
# Linting
npm run lint              # ESLint sans erreurs
npm run lint:fix          # Auto-fix si possible

# Type checking
npx tsc --noEmit         # TypeScript compilation check

# Tests
npm test                 # Jest tests unitaires
npm run test:integration # Tests d'intégration (si disponibles)

# Build
npm run build            # Production build réussie

# Docker
docker-compose config    # Validation docker-compose.yml
```

### Validation post-changements
```bash
# Démarrage services
docker-compose up -d

# Health checks
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost/health || exit 1

# Tests E2E (si disponibles)
npm run test:e2e

# Logs validation
docker-compose logs --tail=50 | grep -i error && exit 1 || exit 0
```

## Instructions spécifiques par contexte

### Lors de modifications Backend
1. Mettre à jour les modèles Mongoose si schéma modifié
2. Regénérer documentation Swagger si routes modifiées
3. Mettre à jour tests unitaires correspondants
4. Valider avec collection Postman fournie

### Lors de modifications Frontend
1. Mettre à jour types TypeScript si interfaces modifiées
2. Tester sur mobile et web si composants partagés
3. Valider responsive design (mobile-first)
4. Vérifier accessibilité (ARIA labels)

### Lors de modifications Docker
1. Tester build complet avec `docker-compose build --no-cache`
2. Valider ordre de démarrage des services
3. Vérifier volumes persistants et réseaux
4. Documenter changements dans README.md

---

**Note importante:** Ces instructions s'appliquent à l'ensemble du repository SUPCHAT. Pour des instructions spécifiques aux sous-modules, consultez les fichiers AGENTS.md dans les répertoires correspondants.