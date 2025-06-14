# AGENTS_SUPCHAT_SERVER.md – Configuration Optimisée pour Codex (Server)

## Scope et Contexte du Projet

Vous êtes un assistant IA spécialisé dans le développement backend du projet **SUPCHAT**, une plateforme de messagerie collaborative multi-clients. Votre rôle est d'assister le développement du **serveur Node.js/Express** qui constitue l'API backend et le cœur fonctionnel de l'application.

---

## ⚠️ Configuration spéciale pour agents automatisés

### Instructions critiques pour les agents IA

- **NE PAS** exécuter de tests automatiques (`npm test`, `npm run test:integration`)
- **NE PAS** lancer `npm run lint`, `npm run build`
- **NE PAS** utiliser `docker-compose config`
- **UTILISER UNIQUEMENT** `npx tsc --noEmit` pour validation TypeScript
- **IGNORER** toutes les commandes qui nécessitent l'environnement Docker complet

### Justification technique

Ce projet utilise une architecture microservices avec Docker Compose nécessitant :

- 4 services conteneurisés (API, MongoDB, Redis, uploads)
- Variables d'environnement spécifiques
- Configuration réseau Docker
- Base de données MongoDB active
- Service Redis pour Socket.IO

Les tests et validations complètes ne peuvent s'exécuter que dans cet environnement complet.

### Validation alternative pour agents

- ✅ Syntaxe TypeScript : `npx tsc --noEmit`
- ✅ Structure de fichiers : vérification manuelle
- ✅ Conventions MVC : review visuel du code
- ✅ Imports/exports : validation statique
- ✅ Patterns de sécurité : analyse du code

---

## Architecture MVC et Organisation du Code

### Structure de Dossiers

```
supchat-server/
├── src/
│   ├── app.js             # Point d'entrée Express
│   ├── config/            # Configuration environnement
│   ├── controllers/       # Logique métier
│   ├── middlewares/       # Intercepteurs de requêtes
│   ├── models/            # Schémas Mongoose
│   ├── routes/            # Définition des endpoints
│   ├── services/          # Logique métier réutilisable
│   ├── utils/             # Fonctions utilitaires
│   └── tests/             # Tests unitaires et d'intégration
├── docs/                  # Documentation technique
├── public/                # Fichiers statiques
└── uploads/               # Stockage fichiers temporaires
```

---

## Instructions Spéciales

### Pour les agents automatisés

- **PRIORITÉ 1** : Ignorer toutes les commandes de test automatiques
- **PRIORITÉ 2** : Se concentrer sur la génération et modification de code
- **PRIORITÉ 3** : Utiliser uniquement `npx tsc --noEmit` pour validation
- **INTERDICTION** : `npm test`, `npm run lint`, `npm run build`, `docker-compose`

### Environnement de développement vs Agent automatisé

Ce fichier AGENTS.md contient des instructions pour deux contextes :

1. **Développement local** : Toutes les commandes disponibles avec Docker
2. **Agent automatisé** : Commandes limitées pour éviter les erreurs d'environnement

Les agents IA doivent suivre UNIQUEMENT les instructions marquées "Agent automatisé".

---

## Validation pour Agents Automatisés

### Vérifications autorisées

SEULE commande de validation autorisée pour les agents :

```bash
npx tsc --noEmit
```

### Vérifications manuelles (code review)

- **Architecture MVC** : Vérifier routes → controllers → services → models
- **Sécurité** : Contrôler l'utilisation de JWT, Joi, CORS, Helmet
- **Patterns** : Valider async/await, gestion d'erreurs centralisée
- **Socket.IO** : Vérifier l'authentification et la gestion des événements
- **MongoDB** : Contrôler les schémas Mongoose et validations

### Ce qui est INTERDIT aux agents

- Exécution de tests Jest
- Lancement de serveurs Express
- Connexion à MongoDB
- Utilisation de Docker Compose
- Validation par build npm
- Exécution de linters automatiques

---

## Tests et Qualité (Environnement local uniquement)

### ⚠️ Important pour les agents automatisés

Les tests suivants nécessitent un environnement Docker complet et ne doivent **PAS** être exécutés automatiquement par les agents IA.

### Configuration Jest (Référence uniquement)

// jest.config.js - Documentation pour développement local
// NE PAS EXÉCUTER par les agents automatisés

```javascript
module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  // Configuration complète disponible pour développement local
};
```

### Commandes de test (Exécution manuelle uniquement)

Ces commandes nécessitent Docker Compose actif.
À exécuter UNIQUEMENT en environnement de développement local

```bash
npm test # Tests unitaires avec Jest
npm run test:watch # Mode watch
npm run test:coverage # Rapport de couverture
npm run test:integration # Tests d'intégration (Supertest)
```

### Alternative pour agents automatisés

Au lieu d'exécuter les tests, les agents peuvent :

- Vérifier la syntaxe avec `npx tsc --noEmit`
- Analyser la structure MVC du code
- Valider les patterns de sécurité (JWT, validation Joi)
- Contrôler les conventions de nommage
- Vérifier la cohérence des imports/exports

---

## Remarques Importantes

**Note importante** :

- Cette configuration est fournie pour référence lors du développement local. Les agents automatisés ne doivent pas tenter d'exécuter Jest ou les tests car cela nécessite un environnement Docker complet avec MongoDB et Redis actifs.
- Pour le développement local complet, gardez une version sauvegardée sous AGENTS_SUPCHAT_SERVER.full.md.
