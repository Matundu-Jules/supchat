# GitHub Copilot Instructions pour SUPCHAT

## Architecture et Stack Technique

Ce projet utilise une architecture microservices avec React+TypeScript (web), React Native+Expo (mobile), et Node.js+Express+MongoDB (backend). Tous les services sont conteneurisés avec Docker.

Utilise toujours TypeScript strict avec des interfaces explicites pour tous les composants et fonctions.

## Style JavaScript/TypeScript

Utilise des doubles quotes pour toutes les chaînes de caractères et 2 espaces pour l'indentation, jamais de tabs.

Applique la convention de nommage camelCase pour les variables et fonctions, PascalCase pour les classes et composants React.

Termine toujours les instructions avec des points-virgules et ajoute des trailing commas dans les objets et arrays multi-lignes.

## Structure React et Hooks

Préfixe tous les hooks personnalisés avec `use` (exemple: useAuth, useWorkspace, useMessages).

Utilise des functional components avec hooks React plutôt que des class components.

Implémente la logique d'état avec Redux Toolkit et des slices pour les données globales.

Structure les composants avec des props TypeScript explicites et utilise React.FC uniquement quand nécessaire.

## Conventions API REST

Préfixe toutes les routes API avec `/api/v1/` et groupe par ressource (auth, workspaces, channels, messages, users).

Utilise les verbes HTTP appropriés: GET pour lecture, POST pour création, PUT pour modification complète, PATCH pour modification partielle, DELETE pour suppression.

Retourne toujours des réponses JSON avec format standardisé:
```json
{
  "success": boolean,
  "data": any,
  "message": string
}
```

## Gestion d'État Redux

Organise le store Redux avec des slices dédiés par fonctionnalité (authSlice, workspaceSlice, messageSlice).

Utilise createAsyncThunk pour les appels API asynchrones et gère les états loading/success/error.

Applique des reducers immuables avec Immer intégré dans Redux Toolkit.

Exporte les actions et selectors depuis chaque slice pour réutilisation dans les composants.

## Tests Unitaires et d'Intégration

Utilise Jest comme framework de test principal avec la configuration `testEnvironment: "node"` pour le backend.

Nomme les fichiers de test avec l'extension `.test.js`, `.test.ts`, ou `.spec.ts` et place-les dans un dossier `tests/` ou à côté du fichier testé.

Structure les tests avec describe/it/expect et utilise beforeEach/afterEach pour setup/cleanup.

Mock les dépendances externes (API calls, database) et teste la logique métier isolément.

## Authentification et Sécurité

Implémente l'authentification JWT avec middleware de vérification sur toutes les routes protégées.

Utilise le pattern `Authorization: Bearer <token>` pour les headers d'authentification.

Intègre Passport.js pour OAuth Google et Facebook avec les stratégies appropriées.

Valide toujours les données d'entrée avec Joi côté backend et Yup côté frontend.

## Base de Données MongoDB

Utilise Mongoose comme ODM avec des schémas TypeScript stricts pour tous les modèles.

Définit les relations entre documents avec des références ObjectId et populate() pour les jointures.

Implémente des validations Mongoose au niveau schéma (required, unique, enum).

Utilise des index pour optimiser les requêtes fréquentes (email unique, workspace members).

## Configuration Docker

Maintiens docker-compose.yml avec services: api, web, mobile, mongodb, cadvisor pour monitoring.

Configure des volumes persistants pour MongoDB et des networks isolés (supchat-network, monitoring).

Utilise des variables d'environnement via .env.example sans jamais exposer de secrets en clair.

Implemente des health checks pour tous les services et configure restart policies.

## Mobile React Native/Expo

Utilise Expo Router avec file-based routing dans le dossier `app/` pour la navigation.

Structure les écrans mobiles dans `app/` avec layouts partagés et navigation par onglets.

Applique AsyncStorage pour le stockage local persistant des tokens et préférences utilisateur.

Utilise des Context API pour l'état global mobile plutôt que Redux si plus simple.

## Patterns de Code Récurrents

Pour les appels API, utilise axios avec interceptors pour gérer automatiquement les tokens JWT et les erreurs globales.

Implémente des custom hooks pour encapsuler la logique métier réutilisable (useAuth, useFetch, useSocket).

Utilise des Higher-Order Components ou render props pour la logique d'autorisation et de protection des routes.

Applique le pattern loading/error/success pour tous les appels asynchrones avec gestion d'état appropriée.

## Validation et Erreurs

Centralise la gestion d'erreurs avec un middleware Express global et des types d'erreurs standardisés.

Valide les schémas JSON avec Joi côté backend avant traitement et retourne des erreurs 400 avec détails explicites.

Implémente des messages d'erreur utilisateur-friendly côté frontend avec gestion des codes d'erreur API.

Utilise try/catch systématiquement pour les opérations asynchrones et log les erreurs pour debugging.

## Performance et Optimisation

Implémente la pagination pour toutes les listes (messages, workspaces, users) avec paramètres limit/offset.

Utilise React.memo() et useMemo() pour optimiser les re-renders des composants coûteux.

Configure le cache HTTP avec des headers appropriés (Cache-Control, ETag) pour les ressources statiques.

Applique le lazy loading pour les composants non-critiques et code splitting par routes.