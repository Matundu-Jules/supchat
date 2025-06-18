---
name: SUPCHAT General
description: Instructions générales pour le projet SUPCHAT - Plateforme de collaboration d'équipe
---

# Contexte Général du Projet SUPCHAT

Tu es un expert développeur travaillant sur **SUPCHAT**, une plateforme de collaboration d'équipe moderne avec workspaces, channels, messagerie temps réel et gestion des permissions.

## 🏗️ Architecture Générale du Projet

```
📁 supchat/
├── 🚀 api/          → Backend Node.js + Express + MongoDB + Socket.io
├── 🌐 web/          → Frontend React + TypeScript + Vite + SCSS
├── 📱 mobile/       → React Native + Expo + TypeScript
├── 📚 docs/         → Documentation complète
├── 🛠️ scripts/     → Scripts d'automatisation
└── 🐳 4 Environnements Docker distincts
```

## 🔧 Stack Technique Complète

### Backend API
- **Runtime**: Node.js 16+ avec Express.js
- **Base de données**: MongoDB 6.0 
- **Authentification**: JWT avec refresh tokens + OAuth2 (Google, Facebook)
- **Temps réel**: Socket.io pour notifications instantanées
- **Validation**: Joi pour validation côté serveur
- **Sécurité**: bcrypt, CORS, rate limiting, helmet
- **Tests**: Jest + supertest
- **Documentation**: Swagger/OpenAPI

### Frontend Web  
- **Framework**: React 18 avec TypeScript strict
- **Build**: Vite (remplacement de Create React App)
- **Styles**: SCSS + modules CSS
- **État**: Context API React (pas Redux)
- **HTTP**: Axios avec intercepteurs
- **Socket**: Socket.io-client pour temps réel

### Mobile
- **Framework**: React Native + Expo 49+
- **Navigation**: Expo Router
- **État local**: AsyncStorage
- **TypeScript**: Configuration stricte

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **4 Environnements**: dev, test, prod, secure
- **Reverse proxy**: Nginx (en production)
- **CI/CD**: Scripts automatisés via docker-manager.sh

## 🐳 Environnements Docker (CRUCIAL)

### Développement (`docker-compose.yml`)
- Hot-reload activé sur tous les services
- Ports exposés: Web (3000), API (3001), MongoDB (27017)
- Volumes montés pour développement en temps réel

### Tests (`docker-compose.test.yml`) 
- Environnement isolé avec MongoDB test sur port 27018
- Base de données éphémère pour tests automatisés
- Réseau séparé `supchat-test-network`

### Production (`docker-compose.prod.yml`)
- Images optimisées multi-stage
- Health checks configurés
- Réseaux privés internes

### Production Sécurisée (`docker-compose-secure.yml`)
- HTTPS obligatoire avec SSL
- Secrets Docker pour données sensibles
- Rate limiting renforcé

## 📋 Conventions de Code OBLIGATOIRES

### API Backend
- **async/await** systématique (jamais de .then())
- **Validation côté serveur** obligatoire avec Joi
- **Structure modulaire**: controllers/ → services/ → models/
- **Gestion d'erreurs** centralisée avec middleware
- **Logs structurés** avec Winston

### Frontend (Web + Mobile)
- **TypeScript strict** activé
- **Composants fonctionnels** uniquement avec hooks
- **Props typées** avec interfaces TypeScript
- **Nommage**: PascalCase pour composants, camelCase pour fonctions
- **Imports relatifs** avec alias configurés

### Base de Données
- **Collections**: users, workspaces, channels, messages, invitations
- **Schémas Mongoose** avec validation stricte
- **Index** optimisés pour les requêtes fréquentes
- **Soft delete** pour la suppression logique

## 🔐 Sécurité (CRITIQUE)

- **JAMAIS de secrets en dur** dans le code
- **Variables d'environnement** via .env (exclus de Git)
- **JWT tokens** avec expiration courte + refresh tokens
- **Validation** systématique côté serveur
- **Sanitisation** des inputs utilisateur
- **CORS** configuré restrictif
- **Rate limiting** sur toutes les routes publiques

## 🔌 Socket.io Temps Réel

### Événements Standards
- `notification` → Notifications utilisateur
- `message` → Messages instantanés  
- `workspace_update` → Changements workspace
- `channel_update` → Changements channel

### Rooms Automatiques
- `user_<userId>` → Notifications personnelles
- `workspace_<workspaceId>` → Événements workspace
- `channel_<channelId>` → Messages channel

## 🧪 Tests (OBLIGATOIRE via Docker)

- **Toujours lancer via** `docker-compose.test.yml`
- **Couverture minimale**: 80%
- **Structure**: tests/unit/, tests/integration/, tests/e2e/
- **Base de données test**: Port 27018 (isolée)

## 📱 URLs et Ports de Développement

- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001  
- **API Docs**: http://localhost:3001/api-docs
- **MongoDB**: localhost:27017 (dev) / localhost:27018 (test)

## 🛠️ Scripts de Gestion

### Docker Manager (Recommandé)
```bash
./docker-manager.sh
# Options rapides: 1-3 pour démarrage
# Option 18: Tests automatisés  
# Option 20-22: Démarrage rapide sans rebuild
```

### Scripts NPM Principaux
- `npm run secure-env` → Configuration sécurisée
- `npm test` → Tests via Docker (obligatoire)
- `npm run start-backend` → API en mode dev
- `npm run start-web` → Frontend avec hot-reload

## 🎯 Bonnes Pratiques de Développement

1. **Toujours démarrer** par `./docker-manager.sh`
2. **Utiliser l'environnement test** pour les tests
3. **Valider côté serveur** toutes les données
4. **Typer strictement** en TypeScript
5. **Documenter les APIs** avec Swagger
6. **Suivre la structure modulaire** établie
7. **Tester en environnement Docker** avant push

## 📋 Checklist Avant Chaque Commit

- [ ] Tests passent via `docker-compose.test.yml`
- [ ] Pas de secrets en dur dans le code
- [ ] TypeScript compile sans erreurs
- [ ] Validation côté serveur en place
- [ ] Documentation API mise à jour
- [ ] Variables d'environnement configurées

Applique toujours ces règles lors de la génération de code pour SUPCHAT !