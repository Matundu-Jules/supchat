# Guide des Tests Docker - SupChat

## 🧪 Architecture des Tests

SupChat utilise une infrastructure de tests complètement séparée de l'environnement de développement pour garantir l'isolement et la fiabilité.

### Structure des Tests

```
api/tests/
├── setup.js              # Configuration globale des tests
├── setupEnv.js            # Variables d'environnement pour tests
├── factories/             # Factories pour créer des données de test
├── fixtures/              # Fichiers de test (images, etc.)
├── routes/                # Tests des routes API
│   ├── user.test.js       # Tests des préférences utilisateur et avatar
│   ├── workspaces.test.js # Tests des workspaces
│   └── channels.test.js   # Tests des channels
└── integration/           # Tests d'intégration
```

## 🐳 Infrastructure Docker de Test

### Environnement Séparé

Les tests utilisent leur propre environnement Docker avec :

- **Base de données dédiée** : MongoDB sur port 27018 (séparée de la prod sur 27017)
- **Réseau isolé** : `supchat-test-network`
- **Volumes temporaires** : Données de test nettoyées après chaque exécution

### Configuration Docker

Le fichier `docker-compose.test.yml` définit :

```yaml
services:
  db-test:
    image: mongo:6.0
    ports:
      - "127.0.0.1:27018:27017" # Port différent
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword

  api-test:
    build:
      context: ./api
    environment:
      - NODE_ENV=test
      - MONGO_HOST=db-test
      - MONGO_DB=supchat_test
```

## 🚀 Lancement des Tests

### Méthode 1 : Script Docker Manager (Recommandé)

1. Lancez le script Docker manager :

   ```bash
   ./docker-manager.sh
   ```

2. Sélectionnez l'option **18 - Lancer les tests automatisés**

3. Le script va automatiquement :
   - Nettoyer les anciens conteneurs de test
   - Démarrer la base de données de test
   - Lancer tous les tests
   - Nettoyer après les tests

### Méthode 2 : Commandes Manuelles

```bash
# 1. Nettoyer les anciens conteneurs
docker-compose -f docker-compose.test.yml down --volumes

# 2. Démarrer la base de données de test
docker-compose -f docker-compose.test.yml up -d db-test

# 3. Attendre que la DB soit prête (10-15 secondes)
sleep 15

# 4. Lancer les tests
docker-compose -f docker-compose.test.yml run --rm api-test

# 5. Nettoyer après les tests
docker-compose -f docker-compose.test.yml down --volumes
```

### Méthode 3 : Scripts Dédiés

```bash
# Linux/Mac
./run-tests.sh

# Windows
./run-tests.sh
```

## 📊 Tests Disponibles

### Tests des Préférences Utilisateur (`user.test.js`)

✅ **PUT /api/user/profile**

- Mise à jour complète du profil (nom, status, bio, préférences)
- Mise à jour partielle du profil
- Validation des statuts français : `Disponible`, `Occupé`, `Absent`, `Ne pas déranger`
- Rejet des statuts invalides
- Rejet des champs vides
- Authentification requise

✅ **POST /api/user/avatar**

- Upload d'avatar réussi avec validation du format
- Rejet des fichiers non-image
- Gestion des fichiers volumineux
- Authentification requise
- Validation de la présence du fichier
- Test de l'absence de double extension (`.png.png` → `.png`)

✅ **GET /api/user/profile**

- Récupération du profil utilisateur
- Authentification requise

### Tests des Workspaces (`workspaces.test.js`)

✅ **Création de workspaces**

- Admins peuvent créer
- Membres peuvent créer
- Invités ne peuvent pas créer

✅ **Invitations de workspaces**

- Création de notifications
- Vérification des permissions

## 🔧 Configuration des Tests

### Variables d'Environnement

Les tests utilisent des variables dédiées dans `tests/setupEnv.js` :

```javascript
process.env.NODE_ENV = "test";
process.env.MONGO_URI =
  "mongodb://root:rootpassword@db-test:27017/supchat_test?authSource=admin";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.JWT_REFRESH = "test_jwt_refresh";
process.env.CSRF_SECRET = "test_csrf_secret";
```

### Setup Global

Le fichier `tests/setup.js` configure automatiquement :

- Connexion à la base de données de test
- Création d'utilisateurs de test (admin, membre, invité)
- Génération de tokens JWT pour l'authentification
- Nettoyage automatique après les tests

### Factories

Les factories génèrent des données de test cohérentes :

```javascript
// userFactory - Génère des utilisateurs
const admin = await User.create(
  userFactory({
    role: "admin",
    email: "admin@test.com",
  })
);

// workspaceFactory - Génère des workspaces
const workspace = await Workspace.create(
  workspaceFactory({
    owner: admin._id,
    name: "Test Workspace",
  })
);
```

## 📈 Résultats des Tests

### Format de Sortie

```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        8.937 s
```

### Tests Détaillés

Les tests affichent :

- ✅ **Succès** : Tests qui passent avec code de statut attendu
- ❌ **Échecs** : Tests qui échouent avec détails de l'erreur
- 🕐 **Temps d'exécution** : Performance de chaque test

### Logs de Debug

Les tests montrent :

- Connexion MongoDB réussie
- Requêtes HTTP avec codes de réponse
- Erreurs détaillées en cas d'échec

## 🚨 Dépannage

### Problèmes Courants

**Erreur de connexion MongoDB**

```
❌ MongoDB connection failed: connect ECONNREFUSED
```

**Solution** : Vérifier que `db-test` est démarré et accessible

**Tests qui traînent (timeout)**

```
Exceeded timeout of 5000 ms for a hook
```

**Solution** : Attendre plus longtemps que MongoDB soit prêt

**Erreur 404 sur les routes**

```
expect(received).toBe(expected) // Expected: 200, Received: 404
```

**Solution** : Vérifier que les routes sont bien montées sur `/api/user/`

### Nettoyage Manuel

Si les tests laissent des conteneurs orphelins :

```bash
# Stopper tous les conteneurs de test
docker-compose -f docker-compose.test.yml down --volumes

# Nettoyer les réseaux
docker network prune

# Nettoyer les volumes
docker volume prune
```

## 📝 Ajout de Nouveaux Tests

### Structure d'un Test

```javascript
describe("GET /api/mon-endpoint", () => {
  it("should return data successfully", async () => {
    const res = await request(app)
      .get("/api/mon-endpoint")
      .set("Authorization", `Bearer ${global.tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});
```

### Bonnes Pratiques

1. **Authentification** : Utiliser `global.tokens.admin/member/guest`
2. **Factories** : Utiliser les factories pour créer des données cohérentes
3. **Nettoyage** : Les tests se nettoient automatiquement
4. **Isolation** : Chaque test doit être indépendant
5. **Assertions** : Vérifier le statut ET le contenu de la réponse

## 🎯 Tests de Performance

Les tests mesurent aussi les performances :

- Temps de réponse des API
- Temps de connexion base de données
- Temps d'exécution global

**Objectifs de performance :**

- Tests complets < 10 secondes
- Requêtes individuelles < 100ms
- Setup/Teardown < 5 secondes

---

✨ **Les tests garantissent la qualité et la fiabilité de l'API SupChat !**
