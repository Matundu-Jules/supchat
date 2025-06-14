# AGENTS_CLIENT_WEB.md – Version Optimisée pour Codex (Client Web)

## Scope et Contexte du Projet

Vous êtes un assistant IA spécialisé dans le développement frontend du projet **SUPCHAT**, une plateforme de messagerie collaborative multi-clients. Votre rôle est d'assister le développement du **client web React** qui constitue l'interface utilisateur principale de l'application.

---

## ⚠️ Configuration spéciale pour agents automatisés

### Instructions critiques pour les agents IA

- **NE PAS** exécuter de tests automatiques (`npm test`, `npm run test:coverage`)
- **NE PAS** lancer `npm run lint`, `npm run build`, `npm run preview`
- **NE PAS** utiliser `npm run type-check` automatiquement
- **UTILISER UNIQUEMENT** la validation TypeScript manuelle si nécessaire
- **IGNORER** toutes les commandes qui nécessitent l'environnement de développement complet

### Justification technique

Ce client React fait partie d'une architecture microservices avec :

- Backend API séparé sur le port 3000
- Configuration Vite avec proxy API
- Variables d'environnement spécifiques (`VITE_API_URL`, `VITE_WEBSOCKET_URL`)
- Dépendances OAuth (Google/Facebook) nécessitant des clés API
- Store Redux connecté à l'API backend

Les tests et validations complètes ne peuvent s'exécuter que dans cet environnement complet avec l'API backend active.

### Validation alternative pour agents

- ✅ Analyse statique du code TypeScript React
- ✅ Vérification de la structure des composants
- ✅ Validation des patterns Redux Toolkit
- ✅ Contrôle des conventions de nommage
- ✅ Review des interfaces TypeScript
- ✅ Vérification de l'architecture modulaire

---

## Workflow Optimisé pour Agents IA

### Processus de développement pour agents

1. **Analyse du code existant** – Review statique uniquement
2. **Génération de composants** – Respect des patterns définis
3. **Validation de structure** – Vérification manuelle de l'architecture
4. **Optimisation du code** – Application des best practices

### Priorités pour les agents

- **PRIORITÉ 1** : Génération de code conforme aux patterns
- **PRIORITÉ 2** : Respect des conventions TypeScript React
- **PRIORITÉ 3** : Application de l'architecture modulaire
- **INTERDICTION** : Exécution de commandes nécessitant l'environnement complet

### Validation alternative

Au lieu des tests automatiques, utiliser :

- Analyse de la syntaxe TypeScript
- Validation des interfaces et types
- Contrôle des patterns Redux Toolkit
- Vérification de la structure des composants
- Review des hooks personnalisés

---

## Tests et Qualité (Environnement local uniquement)

### ⚠️ Important pour les agents automatisés

Les tests suivants nécessitent un environnement de développement complet et ne doivent **PAS** être exécutés automatiquement par les agents IA.

### Configuration Jest + React Testing Library (Manuel)

// jest.config.js – Configuration pour développement local uniquement
// NE PAS EXÉCUTER par les agents automatisés

```javascript
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapping: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },
};
```

### Commandes de validation (Exécution manuelle uniquement)

Ces commandes nécessitent l'environnement complet avec API backend.
À exécuter UNIQUEMENT en environnement de développement local

```bash
npm run lint          # ESLint – nécessite config complète
npm run lint:fix      # Correction automatique – env local uniquement
npm test              # Jest + RTL – nécessite jsdom et API mock
npm run test:coverage # Couverture – nécessite setup complet
npm run build         # Build Vite – nécessite toutes les dépendances
npm run preview       # Preview – nécessite build réussi
npm run type-check    # TypeScript – peut générer des timeouts
```

### Alternative pour agents automatisés

Au lieu d'exécuter les tests automatiques, les agents peuvent :

- Analyser la syntaxe TypeScript React
- Valider les patterns de composants fonctionnels
- Contrôler les interfaces et types
- Vérifier l'utilisation correcte des hooks
- Analyser la structure Redux Toolkit
- Valider les conventions de nommage (usePrefix pour hooks)

---

### Validation pour Agents Automatisés

#### Vérifications autorisées (analyse statique uniquement)

- **Architecture des composants** : Vérifier la structure modulaire
- **Conventions TypeScript** : Interfaces explicites, pas d'`any`
- **Patterns React** : Functional components, hooks personnalisés
- **Redux Toolkit** : createSlice, createAsyncThunk
- **Styling** : Modules SCSS, variables CSS
- **Structure des dossiers** : Respect de l'organisation définie

#### Vérifications manuelles (code review)

- **Hooks personnalisés** : Préfixe `use*` obligatoire
- **Props interfaces** : TypeScript strict pour tous les composants
- **Gestion d'état** : Redux Toolkit avec async thunks
- **API calls** : Axios avec intercepteurs JWT
- **Lazy loading** : Code splitting avec React.lazy()
- **Performance** : React.memo, useCallback, useMemo

#### Ce qui est INTERDIT aux agents

- Exécution de Jest et React Testing Library
- Lancement du serveur de développement Vite
- Build de production avec `npm run build`
- Vérifications TypeScript avec type-check
- Linting automatique avec ESLint
- Tests de couverture
- Preview de build

---

## Performance et Optimisation

### Note pour agents automatisés

Les exemples ci-dessous sont fournis pour référence et compréhension de l'architecture.
Ne pas tenter d'exécuter ou de tester ces optimisations automatiquement.

---

## Configuration Environment

### ⚠️ Variables d'environnement critiques

Ces variables sont nécessaires pour le fonctionnement de l'application et expliquent pourquoi les tests automatiques échouent sans environnement complet.

### Variables d'Environnement (Référence)

.env.development – Nécessaire pour API calls

```
VITE_API_URL=http://localhost:3000/api/v1 # Backend doit être actif
VITE_WEBSOCKET_URL=ws://localhost:3000 # Socket.IO backend
VITE_GOOGLE_CLIENT_ID=your_google_client_id # OAuth Google
VITE_FACEBOOK_APP_ID=your_facebook_app_id # OAuth Facebook
```

**Agent automatisé** : Ces variables expliquent pourquoi les tests ne peuvent pas s'exécuter sans l'environnement Docker complet incluant l'API backend.

---

## Instructions Spéciales

- **Toujours** créer des composants TypeScript fonctionnels avec interfaces explicites
- **Privilégier** les custom hooks pour la logique réutilisable
- **Utiliser** Redux Toolkit avec createAsyncThunk pour les appels API
- **Implémenter** la validation côté client avec Yup ou similaire
- **Respecter** la structure modulaire avec un dossier par composant

### Patterns à Éviter

- **Ne jamais** utiliser `any` en TypeScript, préférer `unknown` si nécessaire
- **Éviter** les classes React, privilégier les functional components
- **Ne pas** modifier l'état Redux directement, utiliser les reducers
- **Éviter** les effets de bord dans les composants de présentation

### Standards de Qualité

- **Couverture de tests** minimale: 80%
- **Pas d'erreurs** ESLint ou TypeScript
- **Performance**: Lighthouse score > 90
- **Accessibilité**: Utiliser des attributs ARIA appropriés
- **SEO**: Meta tags et structure sémantique HTML5

---

Cette configuration optimise votre assistance pour le développement frontend React du projet SUPCHAT, en respectant les architectures modernes et les meilleures pratiques de l'écosystème.
