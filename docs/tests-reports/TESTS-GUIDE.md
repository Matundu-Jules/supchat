# Guide des Tests Automatisés - SupChat

## 🧪 Tests API avec Docker

Ce guide explique comment lancer les tests automatisés pour l'API SupChat dans un environnement Docker isolé.

## 🚀 Lancement Rapide

### Via le script Docker Manager

```bash
./docker-manager.sh
# Puis choisir l'option 18 : "Lancer les tests automatisés"
```

### Via Docker Compose directement

```bash
# Lancer tous les tests
docker-compose -f docker-compose.test.yml run --rm api-test

# Nettoyer après les tests
docker-compose -f docker-compose.test.yml down --volumes
```

## 📋 Tests Disponibles

### Tests des Routes Utilisateur (`user.test.js`)

- ✅ Mise à jour du profil utilisateur (nom, bio, statut, préférences)
- ✅ Upload d'avatar avec validation des formats
- ✅ Validation des statuts français (`Disponible`, `Occupé`, `Absent`, `Ne pas déranger`)
- ✅ Gestion de l'authentification
- ✅ Récupération du profil utilisateur

**13 tests** qui couvrent :

- Routes PUT `/api/user/profile`
- Routes POST `/api/user/avatar`
- Routes GET `/api/user/profile`

## 🏗️ Architecture des Tests

### Base de Données Séparée

- **MongoDB de test** : `supchat-db-test` (port 27018)
- **Réseau isolé** : `supchat-test-network`
- **Volume dédié** : `mongo-test-data`

### Configuration

- **Environment** : `NODE_ENV=test`
- **MongoDB URI** : `mongodb://root:rootpassword@db-test:27017/supchat_test`
- **Secrets de test** : JWT et CSRF dédiés aux tests

## 📁 Structure des Fichiers de Test

```
api/tests/
├── setup.js              # Configuration globale des tests
├── setupEnv.js           # Variables d'environnement de test
├── fixtures/              # Fichiers de test (images, etc.)
├── factories/             # Factories pour générer des données de test
│   ├── userFactory.js
│   ├── workspaceFactory.js
│   └── channelFactory.js
└── routes/
    └── user.test.js       # Tests des routes utilisateur
```

## 🔧 Scripts de Test

### `docker-compose.test.yml`

Configuration Docker pour l'environnement de test avec base de données séparée.

### `run-tests.sh`

Scripts dédiés pour lancer les tests de façon autonome.

## 📊 Résultats des Tests

Exemple de sortie attendue :

```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        ~9s
```

## 🚨 Corrections Appliquées

### Backend

- ✅ Support des statuts français dans le modèle User
- ✅ Ajout du champ `bio` pour les biographies
- ✅ Filtrage des valeurs `null` pour éviter les erreurs de validation
- ✅ Correction du bug de double extension `.png.png` → `.png`
- ✅ Structure de réponse API standardisée (`success`, `data`, `message`, `timestamp`)

### Tests

- ✅ Utilisation de supertest pour les tests d'intégration
- ✅ Base de données MongoDB séparée pour éviter les conflits
- ✅ Factories pour générer des données de test cohérentes
- ✅ Tests de validation des formats de fichiers et tailles limites

## 🎯 Tests Couverts

| Fonctionnalité      | Tests        | Status |
| ------------------- | ------------ | ------ |
| Mise à jour profil  | 6 tests      | ✅     |
| Upload avatar       | 5 tests      | ✅     |
| Récupération profil | 2 tests      | ✅     |
| **Total**           | **13 tests** | ✅     |

## 🔍 Dépannage

### Problèmes Courants

1. **Erreur de connexion MongoDB** : Vérifier que le service `db-test` est démarré
2. **Tests qui échouent** : Nettoyer les volumes avec `--volumes`
3. **Ports occupés** : Utiliser `docker-compose down` pour libérer les ports

### Commandes de Débogage

```bash
# Voir les logs du service de test
docker-compose -f docker-compose.test.yml logs db-test

# Vérifier l'état des conteneurs
docker-compose -f docker-compose.test.yml ps

# Nettoyer complètement
docker-compose -f docker-compose.test.yml down --volumes --remove-orphans
```

## 📝 Ajout de Nouveaux Tests

Pour ajouter des tests, suivre la structure existante :

1. Créer le fichier dans `api/tests/routes/`
2. Utiliser les factories existantes dans `api/tests/factories/`
3. Importer le setup global : `require('../setup')`
4. Utiliser supertest pour les requêtes HTTP

Exemple :

```javascript
const request = require("supertest");
const { app } = require("../../src/app");

describe("GET /api/example", () => {
  it("should work", async () => {
    const res = await request(app)
      .get("/api/example")
      .set("Authorization", `Bearer ${global.tokens.admin}`);

    expect(res.status).toBe(200);
  });
});
```

Les tests sont **prêts pour la production** ! 🚀
