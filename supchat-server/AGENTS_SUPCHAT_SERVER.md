# AGENTS_SUPCHAT_SERVER.md – Version 100% Sans Tests Automatiques (Server)

## Scope et Contexte du Projet

Vous êtes un assistant IA spécialisé dans le développement backend du projet **SUPCHAT**, une plateforme de messagerie collaborative multi-clients. Votre rôle est d'assister le développement du **serveur Node.js/Express** qui constitue l'API backend et le cœur fonctionnel de l'application.

---

## ⚠️ Configuration spéciale pour agents automatisés (NO TEST)

### Instructions critiques pour les agents IA

- **INTERDICTION ABSOLUE** d'exécuter toute commande de test, de lint, de build ou de vérification type-check, y compris :

  - `npm test`, `npm run test:integration`, `npm run lint`, `npm run build`, `docker-compose config`, `npx tsc --noEmit`, etc.

- **NE PAS** effectuer de vérification TypeScript automatique.
- **IGNORER** toutes les commandes nécessitant un environnement Docker ou Node.js complet (docker, npm, node, mongo, etc.).
- **SE CONCENTRER UNIQUEMENT** sur l'analyse statique du code source, la génération de code, la validation de structure et conventions (manuellement, via review humaine uniquement).

### Justification technique

Ce projet utilise une architecture microservices nécessitant :

- 4 services conteneurisés (API, MongoDB, Redis, uploads)
- Variables d'environnement spécifiques
- Configuration réseau Docker
- Base de données MongoDB active
- Service Redis pour Socket.IO

Aucune commande automatisée ne doit être lancée par l'agent IA, quelle qu'elle soit.

### Validation alternative autorisée pour agents

- **Exclusivement** : revue visuelle humaine de la structure du code, conventions de nommage, patterns MVC (routes → controllers → services → models), sécurité (JWT, Joi, Helmet, etc.), conventions asynchrones, cohérence des imports/exports, etc.
- **Aucune commande CLI, aucun test, aucun build, aucune vérification automatique, même tsc !**

---

## Consignes spécifiques pour Codex/Copilot

- **NE JAMAIS** exécuter la moindre commande de test, lint, build ou vérification TypeScript.
- **Se limiter strictement** à l'analyse statique manuelle du code ou à la génération de snippets.
- **Aucune commande d'analyse ou de vérification de type** (type-check, tsc) n'est autorisée.

---

## Résumé : Ce que peut faire l'agent

- Lire et comprendre le code source
- Proposer des suggestions/modifications selon les patterns et conventions du projet
- Générer des contrôleurs, middlewares, services, models, routes, helpers Node/Express/Mongoose
- Pointer les bonnes pratiques ou patterns à suivre

## Ce qui est INTERDIT

- **TOUTE EXÉCUTION** de : tests, lint, build, type-check, docker, mongo, npm, node, analyse CLI
- **TOUT ACCÈS** réseau ou système (environnement Docker, base Mongo, etc.)
- **AUCUNE VALIDATION AUTOMATISÉE** du code, même tsc

---

**Cette version est 100% sans tests automatiques : strictement ZÉRO commande exécutée par l'agent, ZÉRO analyse CLI, ZÉRO check automatique.**

Pour toute validation, se limiter à l'analyse humaine ou la génération statique de code et structure.
