# SupChat - Liens des Modules et Services

Ce document liste tous les liens d'accès aux différents modules et services de l'application SupChat.

## 🌐 Services Web Accessibles

### 📱 Application Web (Client React)

- **URL d'accès :** http://localhost
- **Port :** 80
- **Description :** Interface web principale de l'application SupChat
- **Technologies :** React + Vite
- **Variables d'environnement :**
  - `VITE_API_URL=/api`
  - `VITE_WEBSOCKET_URL=/socket.io`
  - `VITE_APP_NAME=SupChat`

### 🔧 API Backend (Serveur Node.js)

- **URL d'accès :** http://localhost:3000
- **Port :** 3000
- **Description :** API REST principale et serveur WebSocket
- **Technologies :** Node.js + Express + Socket.io
- **Documentation API :** http://localhost:3000/api-docs (Swagger)
- **Endpoints principaux :**
  - `/api/auth` - Authentification
  - `/api/workspaces` - Gestion des espaces de travail
  - `/api/channels` - Gestion des canaux
  - `/api/messages` - Gestion des messages
  - `/socket.io` - WebSocket pour la communication temps réel

### 📊 Monitoring (cAdvisor)

- **URL d'accès :** http://localhost:8080
- **Port :** 8080
- **Description :** Interface de monitoring des conteneurs Docker
- **Technologies :** Google cAdvisor
- **Note :** Accessible uniquement depuis localhost pour des raisons de sécurité

## 🗄️ Services de Base de Données

### 🍃 MongoDB

- **Host :** localhost
- **Port :** 27017
- **Base de données :** supchat
- **Description :** Base de données principale de l'application
- **Accès :** Restreint à localhost uniquement
- **Utilisateur admin :** supchat-admin
- **Interface recommandée :** MongoDB Compass

## 📱 Application Mobile

### 📱 Client Mobile (React Native + Expo)

- **Plateforme :** React Native avec Expo
- **Configuration réseau :**
  - `EXPO_PUBLIC_API_URL=http://169.254.83.107:3000/api`
  - `EXPO_PUBLIC_DEFAULT_HOST=169.254.83.107`
  - `EXPO_PUBLIC_DEFAULT_PORT=3000`
- **Description :** Application mobile iOS/Android
- **Note :** L'IP peut varier selon votre configuration réseau

## 🔐 OAuth et Authentification

### Google OAuth

- **Client ID :** 991869916796-re5ejvbv6d4h825kfog0u2k870tqda1c.apps.googleusercontent.com
- **Redirect URI :** http://localhost:3000/api/auth/google/callback

### Facebook OAuth

- **App ID :** 766701949015755
- **Redirect URI :** http://localhost:3000/api/auth/facebook/callback

## 🚀 Commandes de Démarrage

### Avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up

# Démarrer seulement la base de données
docker-compose up db

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter tous les services
docker-compose stop
```

### Avec les Tâches VS Code

- **Start Backend :** `cd supchat-server && npm start`
- **Start Frontend Web :** `cd client-web && npm run dev`
- **Start Mobile :** `cd client-mobile && npm start`
- **Start DB (Docker Compose) :** `docker-compose up db`
- **Stop All Dev Services :** `docker-compose stop`

## 🌍 Configuration Réseau

### Réseau Docker

- **Nom du réseau :** supchat-network
- **Type :** bridge
- **Description :** Réseau interne pour la communication entre les services

### Ports Exposés

| Service     | Port Interne | Port Externe | Accès                |
| ----------- | ------------ | ------------ | -------------------- |
| Web Client  | 8080         | 80           | Public               |
| API Backend | 3000         | 3000         | Public (0.0.0.0)     |
| MongoDB     | 27017        | 27017        | Localhost uniquement |
| cAdvisor    | 8080         | 8080         | Localhost uniquement |

## 📁 Structure des Projets

### Backend (supchat-server)

- **Dossier :** `./supchat-server`
- **Point d'entrée :** serveur Express avec Socket.io
- **Base de données :** MongoDB

### Frontend Web (client-web)

- **Dossier :** `./client-web`
- **Framework :** React + Vite
- **Build :** Production optimisé

### Application Mobile (client-mobile)

- **Dossier :** `./client-mobile`
- **Framework :** React Native + Expo
- **Plateforme :** iOS/Android

## 🔒 Notes de Sécurité

- MongoDB et cAdvisor sont accessibles uniquement depuis localhost
- L'API est exposée sur toutes les interfaces (0.0.0.0) pour permettre l'accès mobile
- Les secrets JWT et CSRF sont configurés via les variables d'environnement
- Les credentials OAuth sont configurés pour le développement local

## 📝 Logs et Debugging

### Consulter les logs

```bash
# Logs de tous les services
docker-compose logs

# Logs d'un service spécifique
docker-compose logs api
docker-compose logs web
docker-compose logs db
docker-compose logs cadvisor

# Suivre les logs en temps réel
docker-compose logs -f api
```

---

**Dernière mise à jour :** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
