---
name: SUPCHAT General 2025
description: Instructions générales pour le projet SUPCHAT - Plateforme de collaboration d'équipe mise à jour 2025
---

# Contexte Général du Projet SUPCHAT 2025

Tu es un expert développeur travaillant sur **SUPCHAT**, une plateforme de collaboration d'équipe moderne avec workspaces, channels, messagerie temps réel et gestion des permissions.

## 🏗️ Architecture Générale du Projet 2025

```
📁 supchat/
├── 🚀 api/          → Backend Node.js 22 LTS + Express + MongoDB 8.0 + Socket.io
├── 🌐 web/          → Frontend React 18 + TypeScript 5.x + Vite 5 + SCSS
├── 📱 mobile/       → React Native 0.74 + Expo SDK 51 + New Architecture + TypeScript 5.x
├── 📚 docs/         → Documentation complète mise à jour 2025
├── 🛠️ scripts/     → Scripts d'automatisation Docker Compose v2
└── 🐳 4 Environnements Docker distincts avec Compose v2
```

## 🔧 Stack Technique Complète 2025

### Backend API
- **Runtime**: Node.js 22 LTS avec ES modules natifs
- **Base de données**: MongoDB 8.0 avec optimisations performance
- **Authentification**: JWT avec refresh tokens + OAuth2 (Google, Facebook) avec PKCE
- **Temps réel**: Socket.io compatible New Architecture
- **Validation**: Zod (recommandé 2025) ou Joi pour validation côté serveur
- **Sécurité**: bcrypt (≥12 rounds), CORS, rate limiting, helmet
- **Tests**: Jest 29+ avec support ES modules
- **Documentation**: OpenAPI 3.1/Swagger

### Frontend Web  
- **Framework**: React 18 avec Concurrent Features (Suspense, useTransition)
- **Build**: Vite 5 avec optimisations bundle et HMR amélioré
- **Styles**: SCSS + modules CSS
- **État**: Context API + useReducer (pas Redux)
- **HTTP**: Axios avec intercepteurs JWT
- **Socket**: Socket.io-client pour temps réel
- **Types**: TypeScript 5.x strict

### Mobile
- **Framework**: React Native 0.74 + Expo SDK 51 + New Architecture
- **Navigation**: Expo Router v3 (file-based routing)
- **État local**: AsyncStorage avec SQLite pour données complexes
- **TypeScript**: Configuration 5.x stricte
- **Bridgeless**: Activé par défaut avec JSI

### Infrastructure 2025
- **Containerisation**: Docker + Docker Compose v2
- **4 Environnements**: dev, test, prod, secure
- **Reverse proxy**: Nginx (en production)
- **CI/CD**: Scripts automatisés via docker-manager.sh v2

## 🐳 Environnements Docker Compose v2 (CRUCIAL)

### Développement (`docker-compose.yml`)
- Hot-reload activé avec Vite 5 HMR ultra-rapide
- Ports exposés: Web (3000), API (3001), MongoDB (27017)
- Volumes montés pour développement en temps réel
- Support GPU pour développement AI (optionnel)

### Tests (`docker-compose.test.yml`) 
- Environnement isolé avec MongoDB 8.0 test sur port 27018
- Base de données éphémère pour tests automatisés
- Réseau séparé `supchat-test-network`
- Jest 29+ avec coverage améliorée

### Production (`docker-compose.prod.yml`)
- Images optimisées multi-stage avec Node.js 22
- Health checks configurés pour tous services
- Réseaux privés internes sécurisés
- MongoDB 8.0 avec réplicas pour haute disponibilité

### Production Sécurisée (`docker-compose-secure.yml`)
- HTTPS obligatoire avec certificats SSL/TLS 1.3
- Secrets Docker pour données sensibles
- Rate limiting renforcé et monitoring avancé

## 📋 Conventions de Code OBLIGATOIRES 2025

### API Backend (Node.js 22)
- **ES modules natifs** avec import/export (plus de require())
- **async/await** systématique avec gestion d'erreurs appropriée
- **Validation côté serveur** obligatoire avec Zod (recommandé) ou Joi
- **Structure modulaire**: controllers/ → services/ → models/ → types/
- **Gestion d'erreurs** centralisée avec middleware custom
- **Logs structurés** avec Winston + correlationId

### Frontend (Web + Mobile)
- **TypeScript 5.x strict** activé avec noImplicitAny
- **Composants fonctionnels** uniquement avec hooks React 18
- **Props typées** avec interfaces TypeScript strictes
- **Nommage**: PascalCase pour composants, camelCase pour fonctions
- **Imports relatifs** avec alias configurés (@/, ~/*)

### Base de Données (MongoDB 8.0)
- **Collections**: users, workspaces, channels, messages, invitations, notifications
- **Schémas Mongoose** avec validation stricte et types TypeScript
- **Index optimisés** pour les requêtes fréquentes MongoDB 8.0
- **Soft delete** pour la suppression logique avec timestamps

## 🔐 Sécurité 2025 (CRITIQUE)

- **JAMAIS de secrets en dur** dans le code (utiliser .env + validation)
- **Variables d'environnement** avec validation Zod au démarrage
- **JWT tokens** avec RS256, expiration courte + refresh tokens sécurisés
- **Validation systématique** côté serveur avec sanitisation
- **CORS** configuré restrictif avec allowlist domaines
- **Rate limiting** progressif sur toutes les routes publiques
- **Authentification MFA** pour comptes administrateurs (optionnel)

## 🔌 Socket.io Temps Réel avec New Architecture

### Événements Standards
- `notification` → Notifications utilisateur temps réel
- `message` → Messages instantanés avec typing indicators
- `workspace_update` → Changements workspace en temps réel
- `channel_update` → Changements channel + membres
- `user_status` → Statuts en ligne/hors ligne/occupé

### Rooms Automatiques Optimisées
- `user_${userId}` → Notifications personnelles
- `workspace_${workspaceId}` → Événements workspace
- `channel_${channelId}` → Messages channel + typing
- `typing_${channelId}` → Indicateurs de frappe

## 🧪 Tests 2025 (OBLIGATOIRE via Docker)

- **Toujours lancer via** `docker compose -f docker-compose.test.yml`
- **Jest 29+** avec support ES modules natifs et coverage améliorée
- **Couverture minimale**: 85% (augmentée pour 2025)
- **Structure**: tests/unit/, tests/integration/, tests/e2e/
- **Base de données test**: MongoDB 8.0 sur port 27018 (isolée)
- **Mocks appropriés** pour services externes

## 📱 URLs et Ports de Développement 2025

- **Web App**: http://localhost:3000 (Vite 5 dev server)
- **API Server**: http://localhost:3001 (Node.js 22)
- **API Docs**: http://localhost:3001/api-docs (OpenAPI 3.1)
- **MongoDB**: localhost:27017 (dev) / localhost:27018 (test)
- **Expo Dev**: http://localhost:19000 (Expo SDK 51)

## 🛠️ Scripts de Gestion v2

### Docker Manager v2 (Recommandé)
```bash
./docker-manager.sh
# Options rapides: 1-3 pour démarrage
# Option 18: Tests automatisés avec Jest 29
# Option 20-22: Démarrage rapide sans rebuild
# Support Compose v2 natif
```

### Scripts NPM Principaux 2025
- `npm run secure-env` → Configuration sécurisée avec validation
- `npm test` → Tests via Docker avec coverage Jest 29
- `npm run dev` → API en mode dev avec hot-reload
- `npm run build` → Build optimisé pour production Node.js 22

## 🎯 Bonnes Pratiques de Développement 2025

1. **Toujours démarrer** par `./docker-manager.sh` avec Compose v2
2. **Utiliser l'environnement test** isolé pour tous les tests
3. **Valider avec Zod/Joi** toutes les données côté serveur
4. **Typer strictement** en TypeScript 5.x avec noImplicitAny
5. **Documenter les APIs** avec OpenAPI 3.1 + exemples
6. **Suivre la structure modulaire** avec séparation claire
7. **Tester en environnement Docker** avant chaque commit
8. **Utiliser ES modules** natifs Node.js 22
9. **Implémenter Concurrent Features** React 18 (Suspense)
10. **Optimiser pour MongoDB 8.0** avec nouveaux opérateurs

## 🚀 Nouvelles Fonctionnalités 2025

### New Architecture React Native
- **Bridgeless mode** : Communication directe JS ↔ Native via JSI
- **Fabric renderer** : UI rendering optimisé et concurrent
- **TurboModules** : Modules natifs chargés à la demande
- **Codegen** : Génération automatique d'interfaces

### Expo SDK 51 Spécifique
- **Expo Router v3** : File-based routing amélioré
- **Expo Dev Tools** : Debugging intégré dans VS Code
- **New Architecture ready** : Tous les modules Expo compatibles
- **Push Notifications v2** : Système amélioré avec meilleure fiabilité

### MongoDB 8.0 Nouvelles Capacités
- **Query optimization** : Performance améliorée automatiquement
- **Time series collections** : Optimisées pour données temporelles
- **Vector search** : Recherche sémantique (si applicable)
- **Improved aggregation** : Nouveaux opérateurs et optimisations

### Node.js 22 LTS Avantages
- **ES modules natifs** : Plus besoin de flags expérimentaux
- **Test runner intégré** : Alternative à Jest pour tests simples
- **Fetch API native** : Plus besoin de node-fetch
- **Performance V8** : Améliorations significatives

## 📋 Checklist Avant Chaque Commit 2025

- [ ] Tests passent via `docker compose -f docker-compose.test.yml`
- [ ] Pas de secrets en dur + validation .env avec Zod
- [ ] TypeScript 5.x compile sans erreurs ni warnings
- [ ] Validation côté serveur avec Zod/Joi en place
- [ ] Documentation OpenAPI 3.1 mise à jour
- [ ] ES modules utilisés pour Node.js 22
- [ ] New Architecture compatible (mobile)
- [ ] Performance MongoDB 8.0 optimisée
- [ ] Coverage tests ≥ 85%

Applique toujours ces règles mises à jour 2025 lors de la génération de code pour SUPCHAT !