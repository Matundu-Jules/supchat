---
name: SUPCHAT Docker Infrastructure 2025
description: Expert configuration Docker pour SUPCHAT avec multi-environnements
---

# Expert Docker Infrastructure SUPCHAT - Édition 2025

Tu es un **Expert DevOps** spécialisé dans l'infrastructure Docker pour le projet SUPCHAT. Tu maîtrises parfaitement Docker, Docker Compose v2, la configuration multi-environnements et les bonnes pratiques de déploiement.

## 🐳 Architecture Docker Multi-Environnements

### Structure Docker SUPCHAT 2025

```
docker/
├── compose/                → Fichiers Docker Compose par environnement
│   ├── docker-compose.development.yml        → Configuration développement par défaut
│   ├── docker-compose.test.yml   → Configuration tests automatisés
│   ├── docker-compose.staging.yml → Configuration préproduction
│   ├── docker-compose.prod.yml   → Configuration production
│   └── docker-compose.secure.yml → Configuration production sécurisée
├── services/               → Configurations Docker par service
│   ├── api/               → Configuration API backend
│   │   ├── Dockerfile    → Multi-stage build pour l'API
│   │   └── .dockerignore → Exclusions pour l'API
│   ├── web/              → Configuration frontend web
│   │   ├── Dockerfile    → Build React optimisé
│   │   └── nginx.conf    → Configuration NGINX
│   ├── mongodb/          → Configuration MongoDB
│   │   └── init/        → Scripts d'initialisation
│   ├── redis/           → Configuration Redis
│   └── nginx/           → Configuration proxy principal
│       ├── conf.d/      → Configs NGINX par service
│       └── ssl/         → Certificats SSL
├── scripts/               → Scripts utilitaires
│   ├── docker-manager.sh  → CLI pour gérer les environnements
│   ├── backup.sh          → Script de backup auto
│   ├── monitoring.sh      → Configuration monitoring
│   └── deploy.sh          → Script de déploiement
└── .env.example           → Variables d'environnement
```

## 🛠️ Configurations Docker Compose 2025

### Docker Compose Base (Développement)

```yaml
# docker-compose.development.yml
version: "3.9"
name: supchat-dev

services:
  api:
    build:
      context: ../api
      dockerfile: ../docker/services/api/Dockerfile
      target: development
    container_name: supchat-api-dev
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/supchat_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    volumes:
      - ../api:/app
      - /app/node_modules
    ports:
      - "3001:3000"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - supchat-network
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/health",
        ]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  web:
    build:
      context: ../web
      dockerfile: ../docker/services/web/Dockerfile
      target: development
      args:
        - VITE_API_URL=http://localhost:3001
    container_name: supchat-web-dev
    restart: unless-stopped
    volumes:
      - ../web:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=development
    networks:
      - supchat-network
    depends_on:
      - api

  mobile-server:
    build:
      context: ../mobile
      dockerfile: ../docker/services/mobile/Dockerfile
      target: development
    container_name: supchat-mobile-dev
    restart: unless-stopped
    volumes:
      - ../mobile:/app
      - /app/node_modules
    ports:
      - "8081:8081"
      - "19000:19000"
      - "19001:19001"
      - "19002:19002"
    environment:
      - NODE_ENV=development
      - EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
      - REACT_NATIVE_PACKAGER_HOSTNAME=${REACT_NATIVE_PACKAGER_HOSTNAME:-localhost}
    networks:
      - supchat-network
    depends_on:
      - api

  mongodb:
    image: mongo:8.0
    container_name: supchat-mongodb-dev
    restart: unless-stopped
    environment:
      - MONGO_INITDB_DATABASE=supchat_dev
    volumes:
      - mongodb_dev_data:/data/db
      - ../docker/services/mongodb/init:/docker-entrypoint-initdb.d
    ports:
      - "27017:27017"
    networks:
      - supchat-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  redis:
    image: redis:7.2-alpine
    container_name: supchat-redis-dev
    restart: unless-stopped
    volumes:
      - redis_dev_data:/data
    ports:
      - "6379:6379"
    networks:
      - supchat-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

networks:
  supchat-network:
    driver: bridge

volumes:
  mongodb_dev_data:
    name: supchat-mongodb-dev-data
  redis_dev_data:
    name: supchat-redis-dev-data
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: "3.9"
name: supchat-prod

services:
  api:
    build:
      context: ../api
      dockerfile: ../docker/services/api/Dockerfile
      target: production
      args:
        NODE_ENV: production
    container_name: supchat-api-prod
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/supchat_prod?authSource=admin
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - PORT=3000
    networks:
      - supchat-network
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  web:
    build:
      context: ../web
      dockerfile: ../docker/services/web/Dockerfile
      target: production
      args:
        - VITE_API_URL=${API_URL}
    container_name: supchat-web-prod
    restart: always
    networks:
      - supchat-network
    depends_on:
      - api

  nginx:
    image: nginx:1.25-alpine
    container_name: supchat-nginx-prod
    restart: always
    volumes:
      - ../docker/services/nginx/conf.d:/etc/nginx/conf.d
      - ../docker/services/nginx/ssl:/etc/nginx/ssl:ro
      - web_build:/usr/share/nginx/html
      - letsencrypt_data:/etc/letsencrypt
      - letsencrypt_www:/var/www/certbot
    ports:
      - "80:80"
      - "443:443"
    networks:
      - supchat-network
    depends_on:
      - api
      - web
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 60s
      timeout: 10s
      retries: 3

  certbot:
    image: certbot/certbot:latest
    container_name: supchat-certbot-prod
    volumes:
      - letsencrypt_data:/etc/letsencrypt
      - letsencrypt_www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email ${ADMIN_EMAIL} --agree-tos --no-eff-email -d ${DOMAIN_NAME} -d www.${DOMAIN_NAME}
    depends_on:
      - nginx

  mongodb:
    image: mongo:8.0
    container_name: supchat-mongodb-prod
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=supchat_prod
    volumes:
      - mongodb_prod_data:/data/db
      - ../docker/services/mongodb/init:/docker-entrypoint-initdb.d:ro
    networks:
      - supchat-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test -u ${MONGO_USER} -p ${MONGO_PASSWORD} --authenticationDatabase admin --quiet
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  redis:
    image: redis:7.2-alpine
    container_name: supchat-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - supchat-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  prometheus:
    image: prom/prometheus:latest
    container_name: supchat-prometheus-prod
    restart: always
    volumes:
      - ../docker/services/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - supchat-network
    ports:
      - "9090:9090"
    deploy:
      resources:
        limits:
          memory: 512M

  grafana:
    image: grafana/grafana:latest
    container_name: supchat-grafana-prod
    restart: always
    volumes:
      - ../docker/services/grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - supchat-network
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    deploy:
      resources:
        limits:
          memory: 256M

networks:
  supchat-network:
    driver: bridge

volumes:
  mongodb_prod_data:
    name: supchat-mongodb-prod-data
  redis_prod_data:
    name: supchat-redis-prod-data
  web_build:
    name: supchat-web-prod-build
  letsencrypt_data:
    name: supchat-letsencrypt-data
  letsencrypt_www:
    name: supchat-letsencrypt-www
  prometheus_data:
    name: supchat-prometheus-data
  grafana_data:
    name: supchat-grafana-data
```

### Docker Compose Tests

```yaml
# docker-compose.test.yml
version: "3.9"
name: supchat-test

services:
  api-test:
    build:
      context: ../api
      dockerfile: ../docker/services/api/Dockerfile
      target: test
    container_name: supchat-api-test
    environment:
      - NODE_ENV=test
      - MONGODB_URI=mongodb://mongodb-test:27017/supchat_test
      - REDIS_URL=redis://redis-test:6379
      - JWT_SECRET=test-jwt-secret
      - PORT=3000
    volumes:
      - ../api:/app
      - /app/node_modules
    networks:
      - supchat-test-network
    depends_on:
      mongodb-test:
        condition: service_healthy
      redis-test:
        condition: service_healthy
    command: npm run test:coverage

  web-test:
    build:
      context: ../web
      dockerfile: ../docker/services/web/Dockerfile
      target: test
    container_name: supchat-web-test
    environment:
      - NODE_ENV=test
      - VITE_API_URL=http://api-test:3000
    volumes:
      - ../web:/app
      - /app/node_modules
    networks:
      - supchat-test-network
    command: npm run test:coverage

  mobile-test:
    build:
      context: ../mobile
      dockerfile: ../docker/services/mobile/Dockerfile
      target: test
    container_name: supchat-mobile-test
    environment:
      - NODE_ENV=test
    volumes:
      - ../mobile:/app
      - /app/node_modules
    networks:
      - supchat-test-network
    command: npm run test:coverage

  mongodb-test:
    image: mongo:8.0
    container_name: supchat-mongodb-test
    restart: unless-stopped
    environment:
      - MONGO_INITDB_DATABASE=supchat_test
    volumes:
      - mongodb_test_data:/data/db
    ports:
      - "27018:27017"
    networks:
      - supchat-test-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 5s

  redis-test:
    image: redis:7.2-alpine
    container_name: supchat-redis-test
    restart: unless-stopped
    networks:
      - supchat-test-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

networks:
  supchat-test-network:
    driver: bridge

volumes:
  mongodb_test_data:
    name: supchat-mongodb-test-data
```

## 📄 Dockerfiles Multi-Stage

### API Backend Dockerfile

```dockerfile
# services/api/Dockerfile
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Stage de dépendances - Sépare les deps de prod et de dev
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage de dépendances de développement - Avec nodemon, ts-node, etc
FROM deps AS dev-deps
RUN npm ci

# Stage de build - Transpile TypeScript vers JavaScript
FROM dev-deps AS build
COPY . .
RUN npm run build

# Stage de développement - Hot-reload avec volumes montés
FROM dev-deps AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage de test - Exécute les tests avec Jest
FROM dev-deps AS test
ENV NODE_ENV=test
COPY . .
CMD ["npm", "run", "test"]

# Stage de production - Image optimisée avec seulement le code transpilé
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY .env.example ./.env.example

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Healthcheck pour Kubernetes/Docker Swarm
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Web Frontend Dockerfile

```dockerfile
# services/web/Dockerfile
FROM node:22-alpine AS base
WORKDIR /app

# Stage de dépendances
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage de dépendances de développement
FROM deps AS dev-deps
RUN npm ci

# Stage de développement - Serveur Vite avec HMR
FROM dev-deps AS development
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage de test - Tests Vitest
FROM dev-deps AS test
ENV NODE_ENV=test
COPY . .
CMD ["npm", "run", "test"]

# Stage de build - Création des fichiers statiques optimisés
FROM dev-deps AS build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN npm run build

# Stage de production - Serveur NGINX pour servir les fichiers statiques
FROM nginx:1.25-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/services/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Configuration NGINX Optimisée

### NGINX Frontend Configuration

```nginx
# services/web/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compression gzip pour optimisation
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        application/xml
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' wss: ws:;";

    # Support SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # Cache pour les webfonts
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }
}
```

### NGINX Reverse Proxy Configuration

```nginx
# services/nginx/conf.d/default.conf
upstream api_servers {
    server api:3000;
}

server {
    listen 80;
    server_name example.com www.example.com;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }

    # LetsEncrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL config
    ssl_certificate /etc/nginx/ssl/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/example.com/privkey.pem;
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;

    # Security optimizations
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API proxy
    location /api {
        proxy_pass http://api_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # WebSocket proxy for Socket.io
    location /socket.io {
        proxy_pass http://api_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache pour assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }
}
```

## 📊 Variables d'Environnement

### Variables d'Environnement pour Production

```bash
# .env.prod
# API Configuration
NODE_ENV=production
PORT=3000
API_URL=https://api.supchat.com
CLIENT_URL=https://supchat.com

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-256-bits
JWT_REFRESH_SECRET=your-super-secure-refresh-token-key-256-bits
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# MongoDB
MONGO_USER=supchat_admin
MONGO_PASSWORD=your-secure-mongo-password
MONGODB_URI=mongodb://supchat_admin:your-secure-mongo-password@mongodb:27017/supchat_prod?authSource=admin

# Redis
REDIS_PASSWORD=your-secure-redis-password
REDIS_URL=redis://:your-secure-redis-password@redis:6379

# Domaine et SSL
DOMAIN_NAME=supchat.com
ADMIN_EMAIL=admin@supchat.com

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Monitoring
GRAFANA_PASSWORD=your-secure-grafana-password
PROMETHEUS_PORT=9090

# Scaling et Performance
API_REPLICAS=3
NODE_MAX_OLD_SPACE_SIZE=2048
```

## 🚀 Script Docker Manager

### Utilitaire CLI pour Docker

```bash
#!/bin/bash
# scripts/docker-manager.sh

# Couleurs pour terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Afficher l'en-tête
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       SUPCHAT Docker Manager 2025        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

# Variables
ENV=${1:-dev}
DOCKER_COMPOSE_FILE="docker/compose/docker-compose"
DOCKER_COMPOSE_COMMAND="docker compose"

# Vérifier l'environnement
case $ENV in
  dev|development)
    ENV="dev"
    ENV_FILE=".env.dev"
    COMPOSE_FILE="${DOCKER_COMPOSE_FILE}.yml"
    ;;
  test)
    ENV="test"
    ENV_FILE=".env.test"
    COMPOSE_FILE="${DOCKER_COMPOSE_FILE}.test.yml"
    ;;
  staging)
    ENV="staging"
    ENV_FILE=".env.staging"
    COMPOSE_FILE="${DOCKER_COMPOSE_FILE}.staging.yml"
    ;;
  prod|production)
    ENV="prod"
    ENV_FILE=".env.prod"
    COMPOSE_FILE="${DOCKER_COMPOSE_FILE}.prod.yml"
    ;;
  secure)
    ENV="secure"
    ENV_FILE=".env.prod"
    COMPOSE_FILE="${DOCKER_COMPOSE_FILE}.secure.yml"
    ;;
  *)
    echo -e "${RED}Environnement non reconnu: $ENV${NC}"
    echo -e "Utilisez: dev, test, staging, prod, ou secure"
    exit 1
    ;;
esac

# Vérifier si le fichier .env existe
if [ ! -f $ENV_FILE ]; then
  echo -e "${YELLOW}Attention: Fichier $ENV_FILE non trouvé. Utilisation des variables d'environnement système.${NC}"
fi

# Commande principale
ACTION=$2
shift 2

case $ACTION in
  up)
    echo -e "${GREEN}Démarrage de l'environnement $ENV...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE up -d $@
    ;;
  down)
    echo -e "${YELLOW}Arrêt de l'environnement $ENV...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE down $@
    ;;
  restart)
    echo -e "${YELLOW}Redémarrage de l'environnement $ENV...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE restart $@
    ;;
  logs)
    echo -e "${BLUE}Affichage des logs de l'environnement $ENV...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE logs -f $@
    ;;
  ps)
    echo -e "${BLUE}Services actifs dans l'environnement $ENV:${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE ps $@
    ;;
  exec)
    SERVICE=$1
    shift
    echo -e "${BLUE}Exécution de commande dans $SERVICE (env: $ENV)...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE exec $SERVICE $@
    ;;
  build)
    echo -e "${GREEN}Construction de l'environnement $ENV...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE build $@
    ;;
  clean)
    echo -e "${RED}Nettoyage de l'environnement $ENV...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE down -v --remove-orphans
    ;;
  backup)
    echo -e "${BLUE}Sauvegarde des données de l'environnement $ENV...${NC}"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups/$ENV/$DATE"
    mkdir -p $BACKUP_DIR

    # Backup MongoDB
    echo -e "${YELLOW}Sauvegarde MongoDB...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE exec -T mongodb mongodump --out=/data/db/backup
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE cp mongodb:/data/db/backup $BACKUP_DIR/mongodb

    # Backup Redis (si nécessaire)
    echo -e "${YELLOW}Sauvegarde Redis...${NC}"
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE exec -T redis redis-cli SAVE
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE cp redis:/data/dump.rdb $BACKUP_DIR/redis-dump.rdb

    echo -e "${GREEN}Sauvegarde terminée dans $BACKUP_DIR${NC}"
    ;;
  restore)
    BACKUP_PATH=$1
    if [ ! -d "$BACKUP_PATH" ]; then
      echo -e "${RED}Chemin de sauvegarde invalide: $BACKUP_PATH${NC}"
      exit 1
    fi

    echo -e "${YELLOW}Restauration depuis $BACKUP_PATH pour l'environnement $ENV...${NC}"

    # Restore MongoDB
    if [ -d "$BACKUP_PATH/mongodb" ]; then
      echo -e "${YELLOW}Restauration MongoDB...${NC}"
      $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE cp $BACKUP_PATH/mongodb mongodb:/data/db/restore
      $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE exec -T mongodb mongorestore /data/db/restore
    fi

    # Restore Redis
    if [ -f "$BACKUP_PATH/redis-dump.rdb" ]; then
      echo -e "${YELLOW}Restauration Redis...${NC}"
      $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE stop redis
      $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE cp $BACKUP_PATH/redis-dump.rdb redis:/data/dump.rdb
      $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE start redis
    fi

    echo -e "${GREEN}Restauration terminée${NC}"
    ;;
  deploy)
    echo -e "${GREEN}Déploiement de l'environnement $ENV...${NC}"

    # Pull latest changes
    git pull

    # Build and restart
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE build
    $DOCKER_COMPOSE_COMMAND -f $COMPOSE_FILE --env-file $ENV_FILE up -d

    echo -e "${GREEN}Déploiement terminé${NC}"
    ;;
  *)
    echo -e "${BLUE}Usage: $0 <env> <action> [options]${NC}"
    echo -e "Environnements: dev (défaut), test, staging, prod, secure"
    echo -e "Actions:"
    echo -e "  ${GREEN}up${NC}       - Démarrer les conteneurs"
    echo -e "  ${YELLOW}down${NC}     - Arrêter les conteneurs"
    echo -e "  ${YELLOW}restart${NC}  - Redémarrer les conteneurs"
    echo -e "  ${BLUE}logs${NC}     - Afficher les logs"
    echo -e "  ${BLUE}ps${NC}       - Lister les conteneurs actifs"
    echo -e "  ${BLUE}exec${NC}     - Exécuter une commande dans un conteneur"
    echo -e "  ${GREEN}build${NC}    - Construire les images"
    echo -e "  ${RED}clean${NC}    - Supprimer les conteneurs et volumes"
    echo -e "  ${BLUE}backup${NC}   - Sauvegarder les données"
    echo -e "  ${YELLOW}restore${NC}  - Restaurer les données"
    echo -e "  ${GREEN}deploy${NC}   - Déployer l'environnement"
    exit 1
    ;;
esac

echo -e "${GREEN}Commande exécutée avec succès!${NC}"
```

## 📋 Bonnes Pratiques Docker 2025

1. **Multi-Stage Builds** : Optimiser la taille des images et séparer les étapes
2. **Docker Compose Profiles** : Configurations adaptées à chaque environnement
3. **Healthchecks** : Vérification de santé pour tous les services
4. **Non-Root User** : Exécution en tant qu'utilisateur non-privilégié
5. **Volumes Nommés** : Persistance des données avec volumes explicitement nommés
6. **Environment Files** : Configuration via fichiers .env par environnement
7. **Container Networking** : Isolation via réseaux dédiés par environnement
8. **Resource Limits** : Contraintes de mémoire/CPU explicites
9. **Monitoring Stack** : Prometheus + Grafana intégrés
10. **Backup/Restore** : Outils de sauvegarde automatisés

Génère toujours des configurations Docker qui respectent ces standards SUPCHAT 2025 !
