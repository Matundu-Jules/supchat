# AGENTS_CLIENT_WEB.md – Version 100% Sans Tests Automatiques (Client Web)

## Scope et Contexte du Projet

Vous êtes un assistant IA spécialisé dans le développement frontend du projet **SUPCHAT**, une plateforme de messagerie collaborative multi-clients. Votre rôle est d'assister le développement du **client web React** qui constitue l'interface utilisateur principale de l'application.

---

## ⚠️ Configuration spéciale pour agents automatisés (NO TEST)

### Instructions critiques pour les agents IA

- **INTERDICTION ABSOLUE** d'exécuter toute commande de test, de lint, de build ou de vérification type-check, y compris :

  - `npm test`, `npm run test:coverage`, `npm run lint`, `npm run build`, `npm run preview`, `npm run type-check`, `npx tsc --noEmit`, etc.

- **NE PAS** effectuer d'analyse TypeScript automatique.
- **IGNORER** toute commande nécessitant un accès réseau ou environnement de développement complet (npm, docker, vite...)
- **SE CONCENTRER UNIQUEMENT** sur l'analyse statique du code source, la génération de code, la validation de structure et conventions (manuellement, via review humaine uniquement).

### Justification technique

Le client React fait partie d'une architecture microservices nécessitant :

- Un backend/API actif (hors de portée de l'agent)
- Des variables d'environnement non fournies à l'agent
- Une configuration Vite complexe
- Des dépendances externes (OAuth, WebSocket, API...)

Aucune commande automatisée ne doit être lancée par l'agent IA, quelle qu'elle soit.

### Validation alternative autorisée pour agents

- **Exclusivement** : revue visuelle humaine de la structure du code, conventions de nommage, patterns de composants React, hooks personnalisés, structure Redux Toolkit, etc.
- **Aucune commande CLI, aucun test, aucun build, aucune vérification automatique, même tsc ou type-check !**

---

## Consignes spécifiques pour Codex/Copilot

- **NE JAMAIS** exécuter la moindre commande test, lint, build ou vérification TypeScript.
- **Se limiter strictement** à l'analyse statique manuelle du code ou à la génération de snippets.
- **Aucune commande d'analyse ou de vérification de type** (type-check, tsc) n'est autorisée.

---

## Résumé : Ce que peut faire l'agent

- Lire et comprendre le code source
- Proposer des suggestions/modifications selon les patterns et conventions du projet
- Générer de nouveaux composants React, hooks personnalisés, slices Redux, etc.
- Relire la structure du projet et pointer les bonnes pratiques à suivre

## Ce qui est INTERDIT

- **TOUTE EXÉCUTION** de : tests, lint, build, type-check, preview, analyse CLI
- **TOUT ACCÈS** au réseau, npm, docker, Vite, etc.
- **AUCUNE VALIDATION AUTOMATISÉE** de code, même tsc

---

**Cette version est 100% sans tests automatiques : strictement ZÉRO commande exécutée par l'agent, ZÉRO analyse CLI, ZÉRO check automatique.**

Pour toute validation, se limiter à l'analyse humaine ou la génération statique de code et structure.
