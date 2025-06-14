# AGENTS.md – Version 100% Sans Tests Automatiques (Racine)

**Projet :** SUPCHAT – Plateforme de messagerie collaborative
**Version :** 1.0.0
**Date :** 13 juin 2025
**Scope :** Repository entier et sous-modules

---

## ⚠️ Configuration spéciale pour agents automatisés (NO TEST)

### Instructions critiques

- **INTERDICTION ABSOLUE** d'exécuter toute commande de test, de lint, de build, de type-check ou de vérification TypeScript, y compris :
  `npm test`, `npm run lint`, `npm run build`, `npm run test:integration`, `npm run test:coverage`, `docker-compose`, `npx tsc --noEmit`, etc.
- **NE PAS** effectuer de vérification TypeScript ou d'analyse automatique de code.
- **IGNORER** toutes les commandes nécessitant un environnement Docker, Node.js, Vite, etc.
- **SE CONCENTRER UNIQUEMENT** sur l'analyse statique manuelle du code, la génération de code, et la validation des patterns et conventions (review humaine uniquement).

### Justification

Projet microservices avec Docker Compose : aucune validation automatisée ne peut être réalisée sans environnement complet.
Seules les revues de code manuelles, la génération de snippets, ou la structuration de fichiers sont autorisées pour les agents IA.

---

## Ce que peut faire l'agent

- Lire et comprendre la structure du projet
- Générer ou proposer du code selon les patterns du repo
- Suggérer des améliorations ou pointer des bonnes pratiques
- Générer de nouveaux dossiers, composants, modèles, etc.
- **Aucune commande, aucun test, aucun build, aucun check TypeScript !**

## Ce qui est INTERDIT

- **TOUTE EXÉCUTION** de : tests, lint, build, type-check, docker, npm, npx, Vite, preview, analyse CLI
- **TOUT ACCÈS** réseau ou système (environnement Docker, base Mongo, etc.)
- **AUCUNE VALIDATION AUTOMATISÉE** du code, même tsc

---

## Architecture globale du projet

- **Type :** Microservices conteneurisés (client/serveur séparés)
- **Pattern :** MVC (backend)
- **Clients :** React Web + React Native Mobile
- **API :** REST Node.js/Express
- **Base de données :** MongoDB avec Mongoose

### Structure des répertoires

```
/
├── client-web/          # Application web React+TypeScript+Vite
├── client-mobile/       # Application mobile React Native+Expo
├── supchat-server/      # API backend Node.js+Express+MongoDB
├── docker-compose.yml   # Orchestration conteneurs
└── .env.example         # Template variables d'environnement
```

---

## Conventions de code

- **JavaScript/TypeScript :**

  - Syntaxe : ES2022+
  - Typage : strict, interfaces explicites, pas d'`any`
  - Indentation : 2 espaces
  - Quotes : doubles
  - Line endings : LF
  - Nommage : camelCase (var/fonction), PascalCase (classe/composant), SCREAMING_SNAKE_CASE (constantes), kebab-case (fichiers)

- **ESLint/Prettier :**

  - Règles projet : semi obligatoires, trailing commas, unused vars interdits, print width : 80, tab width : 2

---

## Patterns architecturaux

- **Backend** : MVC (controllers, models, routes, middlewares)
- **Frontend Web** : Redux Toolkit, hooks custom, components atomiques
- **Mobile** : Routing file-based Expo, context API, hooks custom

---

## Sécurité et bonnes pratiques

- Secrets uniquement en variable d'env
- JWT signé et limité (24h)
- OAuth2 via Passport.js
- Hachage bcrypt obligatoire pour les mots de passe
- CSRF : header X-CSRF-TOKEN obligatoire pour POST/PUT/DELETE
- Validation : Joi côté back, Yup côté front
- RGPD : endpoints pour suppression/export des données utilisateurs

---

## UI/UX

- Palette via variables CSS
- Typographies : Montserrat, Open Sans, Roboto Mono
- Icones : Heroicons/Lucide
- Responsive et mobile-first
- Accessibilité : ARIA, navigation clavier, alt images

---

**Note importante :**
Ce fichier AGENTS.md racine ne doit servir qu'à la structuration du code, à la génération de snippets et à l’assistance humaine.
Pour toute validation automatisée ou exécution de commandes, utiliser AGENTS.full.md (non destiné aux agents Codex/Copilot).

---

🎯 **Strictement ZÉRO test, ZÉRO build, ZÉRO commande exécutée par l’agent IA**.
Tout doit être fait par lecture et génération statique uniquement.
