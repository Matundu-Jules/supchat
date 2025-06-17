# Guide Docker Development vs Production

## Vue d'ensemble

Le projet SUPCHAT utilise une architecture Docker harmonisée avec des configurations séparées pour le développement et la production. **Chaque service (web, api, mobile) possède 2 Dockerfiles :**

- `Dockerfile` → **Production**
- `Dockerfile.dev` → **Développement**

## Architecture des Dockerfiles

### 🔧 Web Service

#### Development (`Dockerfile.dev`)

- **Base**: `node:20-alpine`
- **Setup**: Vite dev server avec hot reload
- **Port**: 8080
- **Volume**: Code mappé pour hot reload
- **Command**: `npm run dev --host 0.0.0.0 --port 8080`

#### Production (`Dockerfile`)

- **Base**: Multi-stage avec `node:20-alpine` + `nginx:alpine`
- **Build**: `npm run build` (génère `dist/`)
- **Serve**: Nginx optimisé pour servir les fichiers statiques
- **Port**: 8080 (non-privilegié)
- **Security**: Utilisateur non-root `webuser`

### 🚀 API Service

#### Development (`Dockerfile.dev`)

- **Base**: `node:lts-alpine`
- **Dependencies**: `npm install` (toutes les dépendances y compris devDependencies)
- **Command**: `npm run dev` (nodemon pour auto-restart)
- **Port**: 3000
- **Volume**: Code mappé pour hot reload

#### Production (`Dockerfile`)

- **Base**: `node:lts-alpine`
- **Dependencies**: `npm ci --only=production` (optimisé)
- **Command**: `npm start`
- **Security**: Health check + utilisateur non-root
- **Optimizations**: Cache nettoyé, logs directory

### 📱 Mobile Service

#### Development (`Dockerfile.dev`)

- **Base**: `node:24-alpine3.22`
- **Expo**: Dev server basique sans tunnel
- **Command**: `npm start`
- **Port**: 8081 (Metro bundler)
- **Volume**: Code mappé

#### Production (`Dockerfile`)

- **Base**: `node:24-alpine3.22`
- **Expo**: Avec tunnel activé pour exposition publique
- **Command**: `npx expo start --clear --tunnel`
- **Security**: Health check script

## Utilisation

### Développement (Hot Reload)

```bash
# Démarrer tous les services en mode dev
docker-compose up --build

# Ou service par service
docker-compose up web  # Web avec hot reload
docker-compose up api  # API avec nodemon
docker-compose up mobile # Mobile Expo dev
```

### Production (Optimisé)

```bash
# Démarrer en mode production
docker-compose -f docker-compose.prod.yml up --build

# Build only
docker-compose -f docker-compose.prod.yml build
```

## Différences clés Dev vs Prod

| Aspect          | Development            | Production                    |
| --------------- | ---------------------- | ----------------------------- |
| **Web**         | Vite dev server        | Build + Nginx                 |
| **API**         | toutes deps + nodemon  | deps prod only + health check |
| **Mobile**      | Expo dev local         | Expo tunnel + health check    |
| **Volumes**     | Code mappé             | Pas de mapping                |
| **Environment** | `NODE_ENV=development` | `NODE_ENV=production`         |
| **Build time**  | Plus rapide            | Plus long (optimisations)     |
| **Size**        | Plus gros              | Plus léger                    |

## Volumes Development

```yaml
volumes:
  - ./web:/app # Hot reload web
  - ./api:/usr/src/app # Hot reload API
  - ./mobile:/app # Hot reload mobile
  - /app/node_modules # Preserve deps
```

## Avantages de cette approche

### ✅ Développement

- **Hot reload** sur tous les services
- **Debugging** facilité avec volumes mappés
- **Développement rapide** avec toutes les devDependencies
- **Nodemon** pour restart automatique de l'API

### ✅ Production

- **Images optimisées** (taille réduite)
- **Sécurité renforcée** (utilisateurs non-root, health checks)
- **Performance** (builds optimisés, nginx pour static files)
- **Monitoring** (health checks intégrés)

## Commandes utiles

```bash
# Reconstruire complètement les images
docker-compose build --no-cache

# Voir les logs d'un service
docker-compose logs -f api

# Executer une commande dans un container
docker-compose exec api npm test

# Nettoyer tout
docker-compose down -v --rmi all
```

## Configuration des ports

| Service  | Dev Port              | Prod Port             | Description        |
| -------- | --------------------- | --------------------- | ------------------ |
| Web      | 80:8080               | 80:8080               | Frontend React     |
| API      | ${PORT}:${PORT}       | ${PORT}:${PORT}       | Backend Node.js    |
| Mobile   | -                     | -                     | Expo (Metro: 8081) |
| MongoDB  | 127.0.0.1:27017:27017 | 127.0.0.1:27017:27017 | Database           |
| cAdvisor | 127.0.0.1:8080:8080   | 127.0.0.1:8080:8080   | Monitoring         |

## Variables d'environnement

- **Dev**: Utilise `.env` avec `NODE_ENV=development`
- **Prod**: Utilise `.env.production` avec `NODE_ENV=production`
