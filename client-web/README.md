# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

# Client Web - SupChat

Application web React avec TypeScript et Vite pour le projet SupChat.

## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

## 🧪 Tests

### Tests unitaires/composants (Vitest)

```bash
npm test              # Lance les tests
npm run test:watch    # Mode watch
npm run test:ui       # Interface graphique
npm run test:coverage # Rapport de couverture
```

### Tests E2E (Cypress)

```bash
npm run test:e2e      # Lance les tests E2E
npm run test:e2e:open # Interface Cypress
```

### Stack de test

- **Vitest** : Test runner (compatible Jest, plus rapide pour Vite)
- **Testing Library** : Tests React (@testing-library/react + user-event + jest-dom)
- **MSW** : Mock Service Worker pour les APIs
- **Cypress** : Tests end-to-end
