# 🐳 ANALYSE DE L'ARCHITECTURE DOCKER - SUPCHAT

**Date d'analyse** : 22 juin 2025  
**Analysé par** : GitHub Copilot  
**Objectif** : Comprendre l'architecture Docker actuelle pour diagnostiquer les problèmes WebSocket

---

## 📋 RÉSUMÉ EXÉCUTIF

Le projet SUPCHAT utilise une architecture Docker Compose avec **4 environnements distincts** :

- **Développement** (`docker-compose.yml`)
- **Tests** (`docker-compose.test.yml`)
- **Production** (`docker-compose.prod.yml`)
- **Production Sécurisée** (`docker-compose-secure.yml`)

### 🎯 Problème Principal Identifié

Les messages envoyés via l'interface web **n'apparaissent pas en temps réel** pour l'expéditeur ou les autres clients connectés.

---

## 🏗️ ARCHITECTURE DOCKER ACTUELLE

### 1. 🛠️ ENVIRONNEMENT DE DÉVELOPPEMENT (`docker-compose.yml`)

#### Services Déployés :

- **API Backend** (`api`) - Port 3000 (exposé 0.0.0.0:3000)
- **Frontend Web** (`web`) - Port 80 (exposé 0.0.0.0:80)
- **Mobile Client** (`mobile`) - Expo dev server
- **MongoDB** (`db`) - Port 27017 (exposé 127.0.0.1:27017)
- **cAdvisor** (`cadvisor`) - Port 8080 (monitoring)
- **Test Data Init** (`test-data-init`) - Service one-shot

#### Configuration Réseau :

```yaml
networks:
  - supchat-network (bridge)
```

#### Points Critiques :

- ✅ API et WebSocket sur le **même serveur** (port 3000)
- ✅ Frontend configuré avec `VITE_API_URL=http://localhost:3000`
- ✅ Hot-reload activé (volumes montés)
- ⚠️ CSRF en mode dev (`CSRF_DEV_MODE=true`)

### 2. 🧪 ENVIRONNEMENT DE TEST (`docker-compose.test.yml`)

#### Services Déployés :

- **API Test** (`api-test`) - Port 3001
- **MongoDB Test** (`db-test`) - Port 27018 (isolé)

#### Configuration Spécifique :

```yaml
environment:
  - NODE_ENV=test
  - PORT=3001
  - MONGO_DB=supchat_test
```

#### Points Critiques :

- ⚠️ **PORT DIFFÉRENT** : Tests sur 3001, dev sur 3000
- ✅ Base de données isolée
- ✅ Réseau séparé (`supchat-test-network`)
- ❌ Pas de frontend web dans l'environnement de test

### 3. 🚀 ENVIRONNEMENT DE PRODUCTION (`docker-compose.prod.yml`)

#### Services Déployés :

- **API Prod** - Multi-stage build optimisé
- **Web Prod** - Build statique optimisé
- **MongoDB Prod** - Configuration production
- **cAdvisor** - Monitoring

#### Points Critiques :

- ✅ Images optimisées
- ✅ Health checks configurés
- ✅ Réseaux privés internes

### 4. 🔒 ENVIRONNEMENT SÉCURISÉ (`docker-compose-secure.yml`)

#### Fonctionnalités :

- HTTPS obligatoire
- Certificats SSL
- Secrets Docker
- Reverse proxy Nginx

---

## 🔍 ANALYSE DU PROBLÈME WEBSOCKET

### Configuration WebSocket Actuelle

#### Backend (API) :

- **Serveur** : Node.js 22 + Express + Socket.IO
- **Port** : 3000 (dev) / 3001 (test)
- **Authentification** : JWT via cookies HTTP-only
- **Événements** : `new-message`, `user-typing`, etc.

#### Frontend (Web) :

- **Client** : Socket.IO client
- **Configuration** : `VITE_API_URL=http://localhost:3000`
- **Authentification** : Token JWT depuis cookies
- **Hooks** : `useSocket`, `useMessages`, `useReactions`

### 🐛 Problèmes Identifiés

#### 1. **Incohérence dans les noms d'événements**

```javascript
// Backend (messageController.js) :
io.to(channelId).emit("new-message", message);

// Frontend (useMessages.ts) :
socket.on("new-message", handleNewMessage); // ✅ Corrigé
```

#### 2. **Double envoi de messages**

```javascript
// useMessages.ts (PROBLÈME RÉSOLU)
await dispatch(addMessage({ channelId, text, file })); // API
socket.emit('send-message', { ... }); // WebSocket - SUPPRIMÉ
```

#### 3. **Structure des données incohérente**

- API retourne : `{ message: {...}, success: true }`
- WebSocket émet : `message` directement
- Redux slice attend : `message._id` pour éviter doublons

#### 4. **Problème de scope WebSocket**

```javascript
// socket.js ligne 353 :
socket.to(data.channelId).emit("new-message", messageForClient);
// N'envoie qu'aux AUTRES clients, pas à l'expéditeur

// messageController.js ligne 228 :
io.to(channelId).emit("new-message", message);
// Envoie à TOUS les clients du channel (incluant expéditeur)
```

---

## 🛠️ SCRIPTS DE GESTION

### Docker Manager (`docker-manager.sh`)

- ✅ Menu interactif complet
- ✅ Gestion des 4 environnements
- ✅ Monitoring et logs
- ⚠️ Tests WebSocket à améliorer

### Modules de Support :

- `docker-manager/environments.sh` - Gestion environnements
- `docker-manager/tests.sh` - Gestion tests
- `docker-manager/monitoring.sh` - Surveillance
- `docker-manager/services.sh` - Services

---

## 📊 MATRICE DE COMPATIBILITÉ

| Environnement | API Port | WebSocket | Frontend    | Base de données | Status            |
| ------------- | -------- | --------- | ----------- | --------------- | ----------------- |
| **Dev**       | 3000     | ✅        | ✅ Port 80  | 27017           | 🟡 Bug WebSocket  |
| **Test**      | 3001     | ✅        | ❌ Manquant | 27018           | 🔴 Tests échouent |
| **Prod**      | 3000     | ✅        | ✅ Optimisé | 27017           | 🟢 OK             |
| **Secure**    | 443      | ✅ HTTPS  | ✅ HTTPS    | 27017           | 🟢 OK             |

---

## 🎯 PLAN DE CORRECTION

### Phase 1 : Correction WebSocket (En cours)

- [x] Corriger noms d'événements (`newMessage` → `new-message`)
- [x] Supprimer double envoi de messages
- [x] ✅ **TESTS UNITAIRES PASSÉS** - Hook useMessages fonctionne correctement
- [ ] Assurer que l'expéditeur reçoit son propre message
- [ ] Uniformiser structure des données

### Phase 2 : Tests

- [x] ✅ **Tests unitaires useMessages** - 11/11 tests passés
- [ ] Corriger environnement de test Docker
- [ ] Créer tests reproductibles du bug en conditions réelles
- [ ] Valider corrections

### Phase 3 : Diagnostic Temps Réel

- [x] ✅ **Tests unitaires validés** - Hook useMessages 11/11 tests passés
- [x] ✅ **Script de diagnostic créé** - websocket-listener.js pour écouter les événements
- [ ] 🔄 **EN COURS** - Test interface web avec monitoring WebSocket
- [ ] Vérifier logs WebSocket côté backend
- [ ] Tester multi-clients (2 onglets)
- [ ] Confirmer réception des événements `new-message`

---

## 📝 NOTES TECHNIQUES

### Variables d'Environnement Critiques :

```bash
# Développement
VITE_API_URL=http://localhost:3000
NODE_ENV=development
PORT=3000

# Test
NODE_ENV=test
PORT=3001
MONGO_DB=supchat_test

# Production
NODE_ENV=production
PORT=3000
```

### Volumes Docker :

- **Code source** : Montés pour hot-reload
- **node_modules** : Préservés dans container
- **MongoDB** : Persistance via volumes nommés

### Réseaux :

- `supchat-network` (dev/prod)
- `supchat-test-network` (test isolé)

---

**Prochaine étape** : Analyser en détail le flux de messages WebSocket et créer des tests reproductibles.
