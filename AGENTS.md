# AGENTS.md – Configuration Optimisée pour OpenAI Codex

**Projet :** SUPCHAT – Plateforme de messagerie collaborative
**Version :** 1.0.0
**Date :** 13 juin 2025
**Scope :** Repository entier et sous-modules

---

## ⚠️ Configuration spéciale pour agents automatisés

### Instructions critiques

- **NE PAS** exécuter de tests automatiques
- **NE PAS** lancer `npm run lint`, `npm test`, `npm run build`
- **NE PAS** utiliser `docker-compose`
- **UTILISER UNIQUEMENT** `npx tsc --noEmit` pour validation TypeScript

### Justification

Projet microservices avec Docker Compose – les tests nécessitent un environnement complet avec base de données, services réseau et variables d'environnement spécifiques.

### Validation alternative pour agents

- Syntaxe TypeScript : `npx tsc --noEmit`
- Structure de fichiers : vérification manuelle
- Conventions de code : review visuel
- Imports/exports : validation statique

---

## Configuration agent automatisé

### Commandes à ignorer

Les agents automatisés doivent **IGNORER** les commandes suivantes :

- `npm test` – Nécessite environnement Docker complet
- `npm run lint` – Dépendances ESLint non installées globalement
- `npm run build` – Nécessite toutes les dépendances du projet
- `docker-compose config` – Docker non disponible dans l'environnement agent
- `npm run test:integration` – Scripts non configurés
- `npm run test:e2e` – Tests E2E non implémentés

### Validation alternative

Au lieu des tests automatiques, l'agent peut :

- Vérifier la syntaxe TypeScript avec `npx tsc --noEmit` uniquement
- Valider la structure des fichiers
- Contrôler les conventions de nommage
- Vérifier la cohérence des imports/exports

### Environnement de développement

Ce projet utilise une architecture microservices conteneurisée qui nécessite :

- Docker Compose avec 4 services (web, mobile, api, database)
- Variables d'environnement configurées
- Base de données MongoDB active
- Configuration réseau spécifique

Les tests et validations complètes ne peuvent s'exécuter que dans cet environnement complet.

---

## Scope hiérarchique du projet

### Architecture globale

- **Type :** Microservices conteneurisés avec séparation client/serveur
- **Pattern :** MVC (Model-View-Controller) pour le backend
- **Clients :** Multi-plateformes (React Web + React Native Mobile)
- **API :** REST avec Node.js/Express
- **Base de données :** MongoDB avec Mongoose ODM

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

---

## Conventions de code

### JavaScript/TypeScript Standards

- **Syntaxe :** ES2022+ avec modules ES6
- **Typage :** TypeScript strict activé
- **Quotes :** Doubles quotes ("string") pour les chaînes
- **Indentation :** 2 espaces (pas de tabs)
- **Line endings :** LF (Unix)
- **Naming conventions :**

  - Variables/fonctions : `camelCase`
  - Classes/composants : `PascalCase`
  - Constantes : `SCREAMING_SNAKE_CASE`
  - Fichiers : `kebab-case.extension`

### ESLint Configuration

- **Base :** @eslint/js recommended
- **TypeScript :** typescript-eslint strict
- **React :** eslint-plugin-react-hooks
- **Règles spécifiques :**

  - Semi-colons obligatoires
  - Trailing commas pour objets/arrays
  - No unused variables (erreur)
  - Console.log autorisé en dev, warning en prod

### Prettier Integration

- **Print width :** 80 caractères
- **Tab width :** 2 espaces
- **Semi :** true
- **Single quote :** false (double quotes)
- **Trailing comma :** es5

---

## Patterns architecturaux

### Backend (supchat-server/) – Pattern MVC

```
controllers/     # Logique métier et actions CRUD
models/          # Schémas MongoDB avec Mongoose
routes/          # Définition endpoints REST API
middlewares/     # Traitements transversaux
```

### Frontend Web (client-web/) – Hooks + Redux

- **State Management :** Redux Toolkit avec slices
- **Composants :** Functional components avec hooks
- **Hooks personnalisés :** Préfixe `use*` obligatoire
- **Structure :**

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

### Mobile (client-mobile/) – Expo File-based Routing

- **Navigation :** Expo Router avec routing basé fichiers
- **Structure :**

  ```
  app/              # Routes principales (file-based)
  ├── (auth)/       # Routes authentification
  ├── (tabs)/       # Navigation par onglets
  └── _layout.tsx   # Layout racine
  components/       # Composants UI mobiles
  contexts/         # Context API pour état global
  hooks/           # Hooks personnalisés mobiles
  ```

---

## Vérifications programmatiques (optionnelles)

### Note importante

Ces vérifications sont destinées à l'environnement de développement local uniquement.
Les agents automatisés doivent ignorer ces étapes pour éviter les erreurs d'environnement.

### Scripts de développement local (à exécuter manuellement)

- `npm run lint` – ESLint (nécessite configuration locale)
- `npm test` – Tests unitaires (nécessite setup complet)
- `npm run build` – Build production (nécessite toutes les dépendances)
- `docker-compose config` – Validation Docker (nécessite Docker installé)

---

## Instructions de test (environnement local uniquement)

### Configuration Jest (Backend)

- **Environment :** Node.js
- **Note :** Les tests nécessitent un environnement Docker complet
- **Exécution :** Manuelle uniquement, pas d'automatisation par les agents

### Commandes de test (manuelles)

Ces commandes nécessitent un setup complet local.
Ne pas exécuter automatiquement par les agents.

```bash
npm test # Tests unitaires (si configurés)
npm run test:watch # Mode watch (à implémenter)
npm run test:coverage # Rapport de couverture (à implémenter)
```

### Désactivation pour les agents automatisés

Les agents doivent ignorer toutes les commandes de test car le projet nécessite :

- Docker Compose avec services multiples
- Variables d'environnement spécifiques
- Base de données MongoDB active
- Configuration réseau complexe

---

## Workflow CI/CD et déploiement

### Scripts de déploiement (environnement local uniquement)

```bash
# Déploiement complet
docker-compose up --build

# Development mode (nécessite setup complet)
npm run dev              # Web client (Vite)
npm start               # API server (Nodemon)
npx expo start          # Mobile client (Expo)
```

### Health checks (environnement local)

- API endpoint `/health` – accessible uniquement avec Docker
- Base de données MongoDB – nécessite conteneur actif
- Services Docker – démarrage en environnement configuré uniquement

---

## Sécurité (Best Practices)

- Gestion des secrets : utilisation exclusive de variables d'environnement, jamais de secrets en dur dans le code
- Authentification JWT : tokens signés, durée de vie limitée (24h), refresh token configuré
- OAuth2 : connexion Google/Facebook via Passport.js, secrets OAuth dans l'environnement
- Stockage des mots de passe : hachage bcrypt obligatoire, jamais de mot de passe en clair
- Protection CSRF : double-cookie, header X-CSRF-TOKEN pour requêtes mutatives
- Validation : schémas Joi côté backend, Yup côté frontend
- Conformité RGPD : endpoints pour suppression/export de données utilisateur à prévoir

---

## Charte graphique et conventions UI/UX

- Palette de couleurs via variables CSS (`--color-primary`, `--color-secondary`, etc.)
- Typographie : Montserrat (titres), Open Sans (texte), Roboto Mono (code)
- Iconographie : Heroicons/Lucide
- Responsive design mobile-first
- Accessibilité : labels ARIA, navigation clavier, alt text images

---

**Note importante :**

- Cette configuration AGENTS.md doit être utilisée dans les interactions avec Codex/Copilot pour éviter les blocages liés aux environnements incomplets et accélérer l'assistance sur le code et l'architecture.
- Pour le développement local complet, utilisez la version étendue AGENTS.full.md.
