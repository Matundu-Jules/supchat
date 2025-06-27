# ⚡ Script de résolution rapide - Tests SUPCHAT

## 🎯 Commandes à exécuter dans l'ordre

### 1. Vérification de l'environnement

```bash
# Vérifie que tu es dans le bon dossier
pwd
# Devrait afficher quelque chose comme: /path/to/supchat/web

# Vérifie les dépendances
npm list @testing-library/jest-dom vitest msw
```

### 2. Installation des dépendances manquantes (si nécessaire)

```bash
# Si @vitest/expect est manquant (souvent nécessaire)
npm install --save-dev @vitest/expect

# Si tu as des erreurs de versions
npm update @testing-library/jest-dom @testing-library/react
```

### 3. Modification des fichiers de configuration

#### A. tsconfig.test.json
```bash
# Backup du fichier actuel
cp tsconfig.test.json tsconfig.test.json.backup

# Remplace le contenu par :
cat > tsconfig.test.json << 'EOF'
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "types": [
      "vitest/globals",
      "@testing-library/jest-dom",
      "@testing-library/jest-dom/vitest"
    ]
  },
  "include": [
    "src/**/*.test.ts", 
    "src/**/*.test.tsx", 
    "src/tests/**/*"
  ],
  "exclude": []
}
EOF
```

#### B. src/tests/setup.ts
```bash
# Backup du fichier actuel
cp src/tests/setup.ts src/tests/setup.ts.backup

# Remplace l'import problématique
sed -i.bak "s/import \* as matchers from '@testing-library\/jest-dom\/matchers';/\/\/ Matchers importés via import direct/" src/tests/setup.ts
sed -i.bak "s/expect\.extend(matchers);/\/\/ Plus besoin d'extend avec import \/vitest/" src/tests/setup.ts

# Ajoute l'import correct au début du fichier
sed -i.bak "1i\\
import '@testing-library/jest-dom/vitest';" src/tests/setup.ts
```

#### C. src/tests/mocks/server.ts
```bash
# Backup du fichier actuel
cp src/tests/mocks/server.ts src/tests/mocks/server.ts.backup

# Remplace le contenu par :
cat > src/tests/mocks/server.ts << 'EOF'
import { setupServer } from "msw/node";
import { http, HttpResponse } from 'msw';

const defaultHandlers = [
  http.all('*', ({ request }) => {
    console.warn(`[MSW] Unhandled request: ${request.method} ${request.url}`);
    return new HttpResponse(null, { status: 200 });
  }),
];

export const server = setupServer(...defaultHandlers);
EOF
```

### 4. Test de vérification

```bash
# Lance un test simple pour vérifier la configuration
npm test -- --run src/tests/setup.ts

# Si pas d'erreurs, lance le test spécifique
npm test -- ChannelsPage.invitations.test.tsx
```

### 5. Si tu as encore des erreurs

#### Erreur TypeScript
```bash
# Redémarre le serveur TypeScript
# Dans VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Ou depuis la ligne de commande
npx tsc --noEmit --project tsconfig.test.json
```

#### Erreur MSW/HTTP
```bash
# Vérifie que MSW 2.x est installé
npm list msw
# Devrait être >= 2.0.0

# Si version < 2.0.0, met à jour :
npm install --save-dev msw@latest
```

#### Erreur de modules
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 6. Corrections spécifiques du test

Dans `src/tests/pages/ChannelsPage/ChannelsPage.invitations.test.tsx`, remplace :

```bash
# Remplace les imports MSW
sed -i.bak 's/import { http } from "msw";/import { http, HttpResponse } from "msw";/' src/tests/pages/ChannelsPage/ChannelsPage.invitations.test.tsx

# Remplace la syntaxe Response par HttpResponse
sed -i.bak 's/return new Response(JSON\.stringify/return HttpResponse.json/g' src/tests/pages/ChannelsPage/ChannelsPage.invitations.test.tsx
sed -i.bak 's/, {\s*status: 200,\s*headers:.*});/);/g' src/tests/pages/ChannelsPage/ChannelsPage.invitations.test.tsx
```

### 7. Test final

```bash
# Lance le test corrigé
npm test -- ChannelsPage.invitations.test.tsx --reporter=verbose

# Si ça marche, lance tous les tests
npm test
```

## 🔧 Commandes de debug

```bash
# Debug verbose
npm test -- ChannelsPage.invitations.test.tsx --reporter=verbose --no-coverage

# Avec timeout plus long
npm test -- ChannelsPage.invitations.test.tsx --testTimeout=30000

# Mode watch pour développement
npm test -- ChannelsPage.invitations.test.tsx --watch
```

## ✅ Vérification finale

Si tout fonctionne, tu devrais voir :
```
✓ affiche la liste des invitations en attente
✓ permet d'accepter une invitation et affiche un feedback de succès  
✓ permet de refuser une invitation et affiche un feedback de succès

Tests passed: 3/3
```

## 🆘 Si ça ne marche toujours pas

1. **Envoie-moi les erreurs exactes** avec :
   ```bash
   npm test -- ChannelsPage.invitations.test.tsx 2>&1 | tee test-errors.log
   ```

2. **Vérifie les versions** :
   ```bash
   npm list > dependencies.log
   ```

3. **Statut des fichiers modifiés** :
   ```bash
   git status
   git diff
   ```

Happy debugging ! 🚀