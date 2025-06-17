# SupChat - Client Web

Application web React avec TypeScript et Vite pour le projet SupChat.

## 📋 Description

Interface web moderne pour l'application de messagerie collaborative SupChat. Développée avec React, TypeScript et Vite pour une expérience utilisateur fluide et performante.

## 🛠️ Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **SCSS** - Styling avancé
- **Socket.io Client** - Communication temps réel
- **React Router** - Navigation
- **Axios** - Client HTTP

## ⚡ Fonctionnalités

- Interface responsive et moderne
- Messagerie temps réel
- Gestion des workspaces et channels
- Authentification OAuth2 et classique
- Partage de fichiers
- Notifications en temps réel
- Thème sombre/clair
- Recherche avancée

## 🚀 Installation et démarrage

### Prérequis

- Node.js >= 18
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Production

```bash
npm run build
```

## 🧪 Tests

```bash
npm test              # Lance les tests
npm run test:watch    # Mode watch
npm run test:coverage # Rapport de couverture
```

## 🏗️ Structure du projet

```
src/
├── components/     # Composants réutilisables
├── pages/         # Pages de l'application
├── services/      # Services et API calls
├── store/         # Gestion d'état
├── hooks/         # Hooks personnalisés
├── utils/         # Utilitaires
└── styles/        # Styles globaux
```

## 🐳 Docker

L'application est dockerisée et peut être lancée via Docker Compose depuis la racine du projet :

```bash
docker-compose up frontend
```
