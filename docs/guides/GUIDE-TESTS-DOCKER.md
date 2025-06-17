# 🧪 Guide des Tests avec Docker - SUPCHAT

## Vue d'ensemble

Ce guide explique comment lancer et gérer les tests automatisés de SUPCHAT dans un environnement Docker dédié, complètement isolé de la base de données de développement/production.

## 🏗️ Architecture des Tests

### Infrastructure Séparée

- **Base de données dédiée** : MongoDB sur le port `27018` (séparée du dev sur `27017`)
- **Réseau isolé** : `supchat-test-network`
- **Conteneurs éphémères** : Supprimés automatiquement après chaque exécution
- **Volumes dédiés** : `mongo-test-data` pour les données de test

### Structure des Tests

```
api/tests/
├── routes/
│   ├── user.test.js          # Tests des préférences utilisateur & avatar
│   ├── workspaces.test.js    # Tests des workspaces
│   └── channels.test.js      # Tests des channels
├── factories/                # Générateurs de données de test
├── fixtures/                 # Fichiers de test (images, etc.)
├── setup.js                  # Configuration globale des tests
└── setupEnv.js              # Variables d'environnement de test
```

## 🚀 Méthodes pour Lancer les Tests

### 1. Via le Script Docker Manager (Recommandé)

Lancez le script principal :

```bash
./docker-manager.sh
```

Puis sélectionnez l'option **18) 🧪 Lancer les TESTS**

### 2. Commande Docker Compose Directe

```bash
# Nettoyer les anciens conteneurs de test
docker-compose -f docker-compose.test.yml down --volumes

# Démarrer la base de données de test
docker-compose -f docker-compose.test.yml up -d db-test

# Attendre que la DB soit prête (environ 10 secondes)
sleep 10

# Lancer tous les tests
docker-compose -f docker-compose.test.yml run --rm api-test

# Nettoyer après les tests
docker-compose -f docker-compose.test.yml down --volumes
```

### 3. Tests Spécifiques

Pour lancer un fichier de test particulier :

```bash
# Modifier le docker-compose.test.yml temporairement
# Changer la ligne command: npm test -- tests/routes/user.test.js
# Puis lancer :
docker-compose -f docker-compose.test.yml run --rm api-test
```

### 4. Scripts Batch/Shell Automatisés

```bash
# Linux/Mac
./run-tests.sh

# Windows
./run-tests.sh
```

## 📊 Types de Tests Disponibles

### Tests des Utilisateurs (`user.test.js`)

- ✅ Mise à jour des préférences utilisateur
- ✅ Validation des statuts français
- ✅ Upload et validation d'avatar
- ✅ Gestion de l'authentification
- ✅ Validation des données

### Tests des Workspaces (`workspaces.test.js`)

- ✅ Création et gestion des workspaces
- ✅ Invitations d'utilisateurs
- ✅ Permissions par rôle

### Tests des Channels (`channels.test.js`)

- ✅ Création et configuration des channels
- ✅ Gestion des membres
- ✅ Messages et permissions

## 🔧 Configuration des Tests

### Variables d'Environnement de Test

```javascript
// api/tests/setupEnv.js
process.env.NODE_ENV = "test";
process.env.MONGO_URI =
  "mongodb://root:rootpassword@db-test:27017/supchat_test?authSource=admin";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.JWT_REFRESH = "test_jwt_refresh";
process.env.CSRF_SECRET = "test_csrf_secret";
```

### Docker Compose de Test

```yaml
# docker-compose.test.yml
services:
  db-test:
    image: mongo:6.0
    ports:
      - "127.0.0.1:27018:27017" # Port différent du dev
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword

  api-test:
    build:
      context: ./api
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=test
      - MONGO_HOST=db-test
      - MONGO_DB=supchat_test
    depends_on:
      db-test:
        condition: service_healthy
```

## 📝 Exemple de Sortie des Tests

```
 PASS  tests/routes/user.test.js (8.937 s)
  PUT /api/user/profile
    ✓ should update user preferences successfully (43 ms)
    ✓ should update user preferences with partial data (15 ms)
    ✓ should not allow empty status string (16 ms)
    ✓ should allow valid status values (55 ms)
    ✓ should reject invalid status values (7 ms)
    ✓ should require authentication (8 ms)
  POST /api/user/avatar
    ✓ should upload avatar successfully (26 ms)
    ✓ should only accept image files (45 ms)
    ✓ should require authentication for avatar upload (7 ms)
    ✓ should require avatar file (8 ms)
    ✓ should handle large file rejection (552 ms)
  GET /api/user/profile
    ✓ should get current user profile (9 ms)
    ✓ should require authentication for profile access (3 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        8.937 s
```

## 🐛 Dépannage

### Problèmes Courants

#### 1. Erreur de Connexion MongoDB

```
❌ MongoDB connection failed: connect ECONNREFUSED
```

**Solution** : Vérifiez que la base de données de test est démarrée :

```bash
docker-compose -f docker-compose.test.yml ps db-test
```

#### 2. Tests qui se Bloquent

**Solution** : Augmentez le timeout Jest ou redémarrez les conteneurs :

```bash
docker-compose -f docker-compose.test.yml down --volumes
docker-compose -f docker-compose.test.yml up -d db-test
sleep 15  # Attendre plus longtemps
```

#### 3. Conflits de Ports

**Solution** : Vérifiez qu'aucun autre service n'utilise le port 27018 :

```bash
netstat -tulpn | grep 27018
```

#### 4. Images Obsolètes

**Solution** : Reconstruisez les images de test :

```bash
docker-compose -f docker-compose.test.yml build --no-cache
```

### Logs de Debug

Pour voir les logs détaillés des tests :

```bash
# Logs de la base de données de test
docker-compose -f docker-compose.test.yml logs db-test

# Logs des tests en temps réel
docker-compose -f docker-compose.test.yml logs -f api-test
```

## 🔄 Cycle de Vie des Tests

1. **Préparation** : Création du réseau et des volumes de test
2. **Initialisation** : Démarrage de MongoDB de test
3. **Setup** : Connexion à la DB et création des utilisateurs de test
4. **Exécution** : Lancement des tests avec tokens JWT valides
5. **Nettoyage** : Suppression des données de test et arrêt des conteneurs

## 📈 Bonnes Pratiques

### Avant de Lancer les Tests

- ✅ Assurez-vous que les services de dev ne sont pas sur le port 27018
- ✅ Fermez les autres instances de test
- ✅ Vérifiez l'espace disque disponible

### Pendant les Tests

- ✅ Ne modifiez pas les fichiers de configuration de test
- ✅ Laissez les tests se terminer complètement
- ✅ Surveillez les logs en cas de problème

### Après les Tests

- ✅ Les conteneurs de test sont automatiquement nettoyés
- ✅ Les volumes de test peuvent être conservés pour debug
- ✅ Vérifiez les résultats dans la sortie console

## 🎯 Tests Ajoutés Récemment

### Corrections API Préférences Utilisateur

- ✅ **Bug `status: null`** : Filtrage automatique des valeurs null
- ✅ **Statuts français** : Support de 'Disponible', 'Occupé', 'Absent', 'Ne pas déranger'
- ✅ **Champ bio** : Nouveau champ biographie utilisateur
- ✅ **Structure de réponse** : Format standardisé avec `success`, `data`, `message`, `timestamp`

### Corrections Upload Avatar

- ✅ **Double extension** : Fix du bug `.png.png` → `.png`
- ✅ **Validation fichiers** : Vérification des formats d'image
- ✅ **Gestion erreurs** : Nettoyage automatique des fichiers en cas d'erreur

## 📞 Support

En cas de problème avec les tests :

1. **Vérifiez les logs** : `docker-compose -f docker-compose.test.yml logs`
2. **Redémarrez l'environnement** : Option 13 du script Docker Manager
3. **Nettoyage complet** : Option 12 → Nettoyage SOFT du script Docker Manager
4. **Consultez ce guide** : Vérifiez la section Dépannage

---

_Dernière mise à jour : 17 juin 2025_
_Version des tests : 1.0_
