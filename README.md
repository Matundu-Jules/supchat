# 💬 SUPCHAT

**SUPCHAT** est une plateforme de collaboration d'équipe moderne avec workspaces, channels, messagerie temps réel et gestion des permissions basée sur les rôles. Solution complète avec applications web, mobile et API robuste.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com/)
[![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Docker-orange.svg)](https://jestjs.io/)

---

## 🚨 IMPORTANT - CONFIGURATION DOCKER OBLIGATOIRE

> **⚠️ RÈGLES STRICTES :** Ce projet utilise **EXCLUSIVEMENT** Docker Compose.
>
> **❌ INTERDIT :** `.env` dans `web/`, `api/`, `mobile/` - **✅ SEUL** `.env` à la racine
>
> **❌ INTERDIT :** `npm start`, `node script.js` - **✅ SEUL** Docker Compose autorisé
>
> **📖 Lisez :** [RULES-DOCKER-ENV.md](./RULES-DOCKER-ENV.md) pour les règles complètes

---

## 🏗️ Architecture du Projet

```
📁 supchat/
├── 📱 web/              → Application Web React + TypeScript + Vite
├── 📱 mobile/           → Application Mobile React Native + Expo
├── 🚀 api/              → Serveur API Node.js + Express + MongoDB
├── 🐳 docker-compose.dev.yml → Orchestration des services (DÉVELOPPEMENT)
├── 🧪 docker-compose.test.yml → Environnement de tests isolé
├── 🏭 docker-compose.prod.yml → Configuration PRODUCTION optimisée
├── � docker-compose-secure.yml → Production avec sécurité renforcée
├── �📚 docs/             → Documentation complète
└── 🛠️ scripts/          → Scripts d'automatisation
```

## 🐳 Environnements Docker

SUPCHAT utilise **4 environnements Docker** distincts selon le contexte d'utilisation :

### 🔧 **Développement** - `docker-compose.dev.yml`

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Caractéristiques :**

- ✅ **Hot-reload** activé sur tous les services
- ✅ **Volumes de développement** montés
- ✅ **Ports exposés** pour accès direct (3000, 3001, 27017)
- ✅ **Mode debug** avec logs détaillés
- ✅ **Nodemon** pour redémarrage auto du backend

### 🧪 **Tests** - `docker-compose.test.yml`

```bash
docker-compose -f docker-compose.test.yml up --build
```

**Caractéristiques :**

- ✅ **Environnement isolé** (base de données séparée port 27018)
- ✅ **Variables de test** dédiées
- ✅ **Réseaux séparés** (`supchat-test-network`)
- ✅ **Nettoyage automatique** après exécution
- ✅ **Données éphémères** (pas de persistance)

### 🏭 **Production** - `docker-compose.prod.yml`

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Caractéristiques :**

- ✅ **Images optimisées** (multi-stage builds)
- ✅ **Variables d'environnement** sécurisées
- ✅ **Réseaux privés** internes
- ✅ **Healthchecks** configurés
- ✅ **Logging** centralisé

### 🔐 **Production Sécurisée** - `docker-compose-secure.yml`

```bash
docker-compose -f docker-compose-secure.yml up -d
```

**Caractéristiques :**

- ✅ **HTTPS obligatoire** avec certificats SSL
- ✅ **Secrets Docker** pour données sensibles
- ✅ **Rate limiting** renforcé
- ✅ **Reverse proxy** Nginx avec sécurité
- ✅ **Monitoring** et alertes

### 🎯 **Comparaison Rapide**

| Environnement | Fichier                     | Usage               | Ports Exposés       | Hot-Reload | Sécurité    |
| ------------- | --------------------------- | ------------------- | ------------------- | ---------- | ----------- |
| 🔧 **Dev**    | `docker-compose.dev.yml`    | Développement local | ✅ Tous             | ✅ Oui     | ⚠️ Basique  |
| 🧪 **Test**   | `docker-compose.test.yml`   | Tests automatisés   | ❌ Aucun            | ❌ Non     | ✅ Isolé    |
| 🏭 **Prod**   | `docker-compose.prod.yml`   | Déploiement         | ⚠️ Essentiels       | ❌ Non     | ✅ Standard |
| 🔐 **Secure** | `docker-compose-secure.yml` | Production critique | 🔒 HTTPS uniquement | ❌ Non     | 🛡️ Maximum  |

## 🚀 Démarrage Rapide

### 🎯 Méthode Recommandée : Docker Manager

Le script **Docker Manager** automatise tous les aspects du projet :

```bash
# Linux/Mac
./docker-manager.sh

# Windows
docker-manager.bat
```

**Menu principal :**

- 🚀 **Option 1-3** : Démarrage rapide (web, mobile, complet)
- 🔧 **Option 4-8** : Gestion des services individuels
- 🧪 **Option 18** : Lancer les tests automatisés
- 🛠️ **Option 12-17** : Maintenance et nettoyage

### 📋 Prérequis

- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/)
- [Node.js 16+](https://nodejs.org/) (pour le développement local)
- Expo CLI (pour le mobile) : `npm install -g @expo/cli`

### ⚡ Démarrage Ultra-Rapide

```bash
# Cloner et démarrer
git clone <votre-repo> supchat
cd supchat
./docker-manager.sh
# Choisir option 3 : "Démarrer TOUT"
```

Accès aux applications :

- 🌐 **Web** : [http://localhost:3000](http://localhost:3000)
- 📱 **Mobile** : Scanner le QR code Expo affiché
- 📖 **API Docs** : [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

### ⚡ **NOUVEAU : Options de Démarrage Rapide**

Le Docker Manager dispose maintenant d'**options ultra-rapides** (5-15 secondes) qui évitent le rebuild complet :

- **Option 20** : ⚡ Démarrage RAPIDE Développement (sans rebuild)
- **Option 21** : ⚡ Démarrage RAPIDE Production (sans rebuild)
- **Option 22** : ⚡ Démarrage RAPIDE Tests (sans rebuild)

**📖 Guide complet :** [docs/QUICK-START-GUIDE.md](./docs/QUICK-START-GUIDE.md)

---

## 🛠️ Services et Ports

| Service             | Port  | URL                            | Description                   |
| ------------------- | ----- | ------------------------------ | ----------------------------- |
| 🌐 **Web App**      | 3000  | http://localhost:3000          | Interface React + Vite        |
| 🚀 **API Server**   | 3001  | http://localhost:3001          | Node.js + Express + Socket.io |
| 📖 **Swagger UI**   | 3001  | http://localhost:3001/api-docs | Documentation API interactive |
| 📱 **Mobile**       | Expo  | QR Code                        | React Native + Expo           |
| 🗃️ **MongoDB**      | 27017 | localhost:27017                | Base de données principale    |
| 🧪 **MongoDB Test** | 27018 | localhost:27018                | Base de données de tests      |

---

## 🧪 Tests Automatisés

**IMPORTANT** : Les tests doivent être lancés dans l'environnement Docker dédié !

### 🎯 Lancement Rapide des Tests

```bash
# Via Docker Manager (recommandé)
./docker-manager.sh
# Choisir option 18 : "🧪 Lancer les TESTS"

# Ou directement
./run-tests.sh
```

### 📊 Tests Disponibles

- ✅ **API Utilisateurs** : Préférences, avatar, authentification
- ✅ **Workspaces** : Création, invitations, permissions
- ✅ **Channels** : Gestion, membres, messages
- ✅ **Socket.io** : Notifications temps réel
- ✅ **Upload** : Validation des fichiers et sécurité

📚 **Guide complet** : [GUIDE-TESTS-DOCKER.md](./GUIDE-TESTS-DOCKER.md)

---

## 🛠️ Développement Local

### 🔧 Installation Manuelle

```bash
# Backend
cd api
npm install
npm run dev

# Frontend Web
cd web
npm install
npm run dev

# Mobile
cd mobile
npm install
npm start
```

### � Scripts Disponibles

| Script         | Commande                | Description                             |
| -------------- | ----------------------- | --------------------------------------- |
| Setup sécurisé | `npm run secure-env`    | Configuration automatique des variables |
| Dev backend    | `npm run start-backend` | API en mode développement               |
| Dev web        | `npm run start-web`     | Interface web avec hot-reload           |
| Dev mobile     | `npm run start-mobile`  | Application mobile Expo                 |
| Tests          | `npm test`              | Tests automatisés (via Docker)          |

---

## 🔐 Sécurité et Configuration

### 🔑 Variables d'Environnement

Le projet utilise un système de gestion sécurisée des secrets :

```bash
# Configuration automatique
npm run secure-env

# Ou via Docker Manager
./docker-manager.sh → Option 19 : "Configurer ENV"
```

### 🛡️ Bonnes Pratiques Implémentées

- ✅ **JWT** avec refresh tokens
- ✅ **CORS** configuré
- ✅ **Rate limiting** sur les APIs
- ✅ **Validation** côté serveur systématique
- ✅ **Sanitisation** des inputs utilisateur
- ✅ **Headers de sécurité** (CSP, HSTS, etc.)
- ✅ **Secrets** jamais en dur dans le code

## 📚 **Guides de sécurité** : Voir le dossier `docs/security-guides/`

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Utilisateurs

- ✅ **Inscription/Connexion** avec email + mot de passe
- ✅ **OAuth2** Google et Facebook (configuré)
- ✅ **JWT** avec refresh tokens sécurisés
- ✅ **Gestion du profil** : bio, statut, préférences
- ✅ **Upload d'avatar** avec validation des formats

### 🏢 Workspaces & Organisation

- ✅ **Création de workspaces** avec permissions par rôle
- ✅ **Invitations d'utilisateurs** avec système de notifications
- ✅ **Gestion des membres** : Admin, Modérateur, Membre
- ✅ **Channels publics/privés** avec permissions héritées

### � Messagerie Temps Réel

- ✅ **Messages instantanés** via Socket.io
- ✅ **Notifications push** temps réel
- ✅ **Historique des messages** avec pagination
- ✅ **Statuts utilisateur** : Disponible, Occupé, Absent, Ne pas déranger

### 📱 Applications Multiplateformes

- ✅ **Web App** responsive (React + TypeScript)
- ✅ **Mobile App** native (React Native + Expo)
- ✅ **API REST** complète avec documentation Swagger
- ✅ **Synchronisation** automatique entre plateformes

---

## 📚 Documentation Complète

| Document                                                                    | Description                             |
| --------------------------------------------------------------------------- | --------------------------------------- |
| � [QUICK-START-GUIDE.md](./docs/QUICK-START-GUIDE.md)                       | **Guide de démarrage rapide Docker**    |
| � [AMELIORATIONS-DOCKER-MANAGER.md](./docs/AMELIORATIONS-DOCKER-MANAGER.md) | **Résumé des améliorations Docker**     |
| 🖥️ [LOGS-VSCODE-README.md](./docs/LOGS-VSCODE-README.md)                    | **Guide des logs VS Code**              |
| � [GUIDE-TESTS-DOCKER.md](./docs/guides/GUIDE-TESTS-DOCKER.md)              | **Guide complet des tests automatisés** |
| 🔐 `docs/security-guides/`                                                  | Guides de sécurité et configuration     |
| 📊 `docs/tests-reports/`                                                    | Rapports de tests et couverture         |
| 🏗️ `docs/uml_models/`                                                       | Diagrammes UML et architecture          |
| 📋 `docs/project-specs/`                                                    | Spécifications du projet                |

### 🔗 Liens Rapides

- **API Documentation** : [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Postman Collection** : `api/supchat-api.postman_collection.json`
- **Tests Coverage** : Généré après `npm test`

---

## 🛠️ Stack Technique

### 🎯 Backend

```
Node.js 16+ ── Express.js ── MongoDB 6.0
    │              │             │
    ├── JWT ────────┼── Socket.io ─┤
    ├── bcrypt ─────┼── Multer ────┤
    └── Swagger ────┴── Jest ──────┘
```

### 🎨 Frontend Web

```
React 18 ── TypeScript ── Vite
    │           │          │
    ├── SCSS ───┼── Axios ──┤
    └── Context API ───────┘
```

### 📱 Frontend Mobile

```
React Native ── Expo 49+ ── TypeScript
    │              │           │
    ├── AsyncStorage ──────────┤
    └── Expo Router ───────────┘
```

### 🏗️ Infrastructure

```
Docker ── Docker Compose ── MongoDB
   │           │               │
   ├── Nginx ──┼── Node.js ─────┤
   └── Scripts d'automatisation ─┘
```

---

## 🔄 Workflow de Développement

### 1. 🚀 **Démarrage** (Environnement DEV)

```bash
git clone <repo>
cd supchat

# Via Docker Manager (recommandé)
./docker-manager.sh  # Option 3: Démarrer TOUT

# Ou manuellement
docker-compose -f docker-compose.dev.yml up --build  # Utilise docker-compose.dev.yml (DEV)
```

### 2. 🧪 **Tests** (Environnement TEST isolé)

```bash
# Via Docker Manager
./docker-manager.sh  # Option 18: Lancer les TESTS

# Ou manuellement
docker-compose -f docker-compose.test.yml up --build
```

### 3. 🔧 **Développement** (Services individuels)

```bash
# API seule en watch mode
./docker-manager.sh  # Option 4: Démarrer API seule

# Frontend avec hot-reload
./docker-manager.sh  # Option 5: Démarrer WEB seule

# Mobile en développement
./docker-manager.sh  # Option 6: Démarrer MOBILE seule
```

### 4. 🚢 **Déploiement** (Environnements PRODUCTION)

#### 🏭 **Production Standard**

```bash
# Configuration production optimisée
docker-compose -f docker-compose.prod.yml up -d

# Vérification des services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

#### 🔐 **Production Sécurisée** (Pour environnements critiques)

```bash
# Configuration sécurité renforcée + HTTPS
docker-compose -f docker-compose-secure.yml up -d

# Monitoring des services sécurisés
docker-compose -f docker-compose-secure.yml logs nginx
```

### 📋 **Sélection de l'Environnement**

| Contexte                    | Commande                                            | Fichier Docker              | Caractéristiques                              |
| --------------------------- | --------------------------------------------------- | --------------------------- | --------------------------------------------- |
| 💻 **Développement local**  | `docker-compose -f docker-compose.dev.yml up -d`    | `docker-compose.dev.yml`    | Hot-reload, debug, ports exposés              |
| 🧪 **Tests automatisés**    | `docker-compose -f docker-compose.test.yml up`      | `docker-compose.test.yml`   | DB isolée (port 27018), environnement jetable |
| 🏭 **Production simple**    | `docker-compose -f docker-compose.prod.yml up -d`   | `docker-compose.prod.yml`   | Images optimisées, healthchecks               |
| 🔐 **Production sécurisée** | `docker-compose -f docker-compose-secure.yml up -d` | `docker-compose-secure.yml` | HTTPS, secrets, monitoring                    |

---

## 🎯 Équipe de Développement

| Développeur                | Rôle               | Spécialités               |
| -------------------------- | ------------------ | ------------------------- |
| **Jules-langa MATUNDU**    | Lead Developer     | Backend API, Architecture |
| **Julien SHOEFFRE**        | Frontend Developer | React Web, UI/UX          |
| **Kévin Gabriel BUMBESCU** | Mobile Developer   | React Native, Expo        |
| **Enzo LECHANOINE**        | DevOps & Tests     | Docker, CI/CD, Tests      |

---

## 🚨 Notifications Temps Réel

Le système de notifications utilise **Socket.io** pour les événements instantanés :

```javascript
// Auto-connexion lors de l'authentification
useSocket(undefined, userId);  // Rejoint automatiquement room user_<userId>

// Événements supportés
- 'notification'     → Nouvelles invitations
- 'message'         → Messages instantanés
- 'workspace_update' → Changements workspace
- 'channel_update'   → Changements channel
```

**Rooms automatiques :**

- `user_<userId>` → Notifications personnelles
- `workspace_<workspaceId>` → Événements workspace
- `channel_<channelId>` → Messages channel

---

## ⚠️ Notes Importantes

### 🔐 Sécurité

- ❌ **JAMAIS** de secrets en dur dans le code
- ✅ Utiliser les variables d'environnement via `npm run secure-env`
- ✅ Configuration automatique des secrets via Docker Manager

### 🧪 Tests

- ❌ Ne **PAS** lancer les tests sur la DB de production
- ✅ **TOUJOURS** utiliser l'environnement Docker de test
- ✅ Voir [GUIDE-TESTS-DOCKER.md](./GUIDE-TESTS-DOCKER.md) pour les détails

### 🚀 Production

- ✅ Utiliser `docker-compose.prod.yml` pour la production
- ✅ Configurer HTTPS et certificats SSL
- ✅ Surveiller les logs avec `docker-compose logs -f`

---

## 📞 Support & Contributions

### 🐛 Signaler un Bug

1. Vérifier les [issues existantes](./docs/tests-reports/)
2. Fournir les logs : `docker-compose logs <service>`
3. Inclure les étapes de reproduction

### 🔧 Environnement de Développement

1. **Docker** : Obligatoire pour les tests
2. **Node.js 16+** : Pour le développement local
3. **Expo CLI** : Pour le développement mobile

### 📝 Standards de Code

- **Backend** : `async/await`, validation systématique, middleware d'erreurs
- **Frontend** : TypeScript strict, composants fonctionnels, hooks React
- **Tests** : Jest + supertest, couverture > 80%
- **Documentation** : JSDoc pour les fonctions, README à jour

---

**📅 Dernière mise à jour** : 17 juin 2025  
**🏷️ Version** : 1.0.0  
**📜 Licence** : MIT

---

_🎉 **SUPCHAT** - Votre plateforme de collaboration moderne !_
