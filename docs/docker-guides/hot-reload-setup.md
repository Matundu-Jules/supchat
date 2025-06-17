# Configuration du Hot Reload pour SUPCHAT

## Vue d'ensemble

Le hot reload (rechargement à chaud) a été configuré avec succès pour les environnements de développement Docker Compose de SUPCHAT, permettant aux développeurs de voir leurs changements de code reflétés instantanément sans redémarrer les conteneurs.

## Backend (Node.js/Express) - ✅ FONCTIONNEL

### Configuration Nodemon

Le backend utilise `nodemon` pour le hot reload avec une configuration optimisée pour Docker et WSL :

**Fichier: `api/nodemon.json`**

```json
{
  "watch": [
    "src",
    "controllers",
    "models",
    "routes",
    "services",
    "middlewares",
    "validators"
  ],
  "ext": "js,json",
  "ignore": ["node_modules", "tests", "coverage", "public/uploads"],
  "delay": 500,
  "legacyWatch": true,
  "polling": true
}
```

### Caractéristiques clés :

- **Polling activé** : Nécessaire pour la détection fiable des changements dans Docker/WSL
- **Délai de 500ms** : Évite les reloads multiples lors de sauvegardes rapides
- **Legacy watch** : Compatibilité avec les systèmes de fichiers virtualisés
- **Surveillance ciblée** : Uniquement les dossiers contenant du code source

### Docker Compose Configuration

```yaml
api:
  volumes:
    - ./api:/usr/src/app
    - /usr/src/app/node_modules
```

## Frontend Web (Vite/React) - ✅ FONCTIONNEL

### Dockerfile de Développement

**Fichier: `web/Dockerfile.dev`**

- Utilise le serveur de développement Vite au lieu de Nginx
- Installe `curl` pour les healthchecks
- Expose le port 8080 pour le dev server

### Configuration Vite

**Fichier: `web/vite.config.ts`**

```typescript
server: {
  watch: {
    usePolling: true,
  },
  host: true,
  port: 8080,
}
```

### Docker Compose Configuration

```yaml
web:
  dockerfile: Dockerfile.dev
  environment:
    - NODE_ENV=development
  volumes:
    - ./web:/app
    - /app/node_modules
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080"]
```

### Caractéristiques clés :

- **Polling Vite** : Détection fiable des changements de fichiers
- **HMR (Hot Module Replacement)** : Mise à jour instantanée sans rafraîchissement complet
- **Healthcheck avec curl** : Surveillance de l'état du conteneur
- **Variables d'environnement** : `NODE_ENV=development` pour le mode développement

## Tests Effectués

### Backend

- ✅ Modification de `api/src/app.js` détectée et rechargée automatiquement
- ✅ Logs montrent : `[nodemon] restarting due to changes...`
- ✅ Temps de reload : ~1-2 secondes

### Frontend Web

- ✅ Modification de `web/src/App.tsx` détectée par Vite
- ✅ Logs montrent : `[vite] hmr update /src/App.tsx`
- ✅ Modification de `web/src/App.module.scss` détectée
- ✅ Temps de reload : <1 seconde (instantané)

## Avantages de cette Configuration

1. **Productivité développeur** : Changements visibles instantanément
2. **Isolation Docker** : Environnement de développement cohérent
3. **Compatibilité WSL/Windows** : Polling résout les problèmes de détection de fichiers
4. **Stabilité** : Délais et configuration legacy pour éviter les reloads multiples
5. **Healthchecks** : Surveillance continue de l'état des services

## Utilisation

### Démarrage de l'environnement de développement

```bash
docker-compose up --build
```

### Vérification du statut

```bash
docker-compose ps
```

### Suivi des logs en temps réel

```bash
# Backend
docker logs supchat-1-api-1 -f

# Frontend
docker logs supchat-1-web-1 -f
```

## Résolution de Problèmes

### Si le hot reload ne fonctionne pas :

1. **Vérifier les volumes Docker** : S'assurer que les dossiers sont bien montés
2. **Vérifier les permissions** : Problème potentiel sur certains systèmes Windows
3. **Redémarrer les conteneurs** : `docker-compose restart`
4. **Rebuild complet** : `docker-compose up --build --force-recreate`

### Logs utiles à surveiller :

- Backend : `[nodemon] restarting due to changes...`
- Frontend : `[vite] hmr update /src/...`

## Performance

- **Backend** : Reload complet en ~1-2 secondes
- **Frontend** : HMR instantané (<1 seconde)
- **Impact mémoire** : Minimal grâce à la configuration optimisée

---

_Configuration testée et validée le 16/06/2025_
_Compatible avec Docker Desktop on Windows + WSL2_
