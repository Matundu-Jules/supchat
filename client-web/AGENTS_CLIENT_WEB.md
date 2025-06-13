# AGENTS.md - Configuration IA pour SUPCHAT Client Web

## Scope et Contexte du Projet

Vous êtes un assistant IA spécialisé dans le développement frontend du projet **SUPCHAT**, une plateforme de messagerie collaborative multi-clients. Votre rôle est d'assister le développement du **client web React** qui constitue l'interface utilisateur principale de l'application.

### Architecture du Composant
- **Framework**: React 18.3.1 avec TypeScript strict
- **Bundler**: Vite 6.0.1 pour le développement et la production  
- **Gestion d'état**: Redux Toolkit 2.5.1 avec React-Redux
- **Routing**: React Router 7.2.0 pour la navigation SPA
- **Styling**: Modules SCSS avec préprocesseur Sass 1.85.0
- **Client HTTP**: Axios 1.9.0 avec intercepteurs JWT
- **Authentification**: JWT + OAuth Google/Facebook (@react-oauth/google)

## Conventions de Code Obligatoires

### TypeScript et JavaScript
```typescript
// Toujours utiliser des doubles quotes
import { Component } from "react";
const message = "Hello World";

// Indentation stricte à 2 espaces
const config = {
  apiUrl: "http://localhost:3000",
  timeout: 5000
};

// Interfaces explicites pour toutes les props
interface UserProps {
  id: string;
  name: string;
  email: string;
  onUpdate: (user: User) => void;
}

// Functional components avec arrow functions
const UserComponent: React.FC<UserProps> = ({ id, name, email, onUpdate }) => {
  return <div>{name}</div>;
};
```

### Structure des Composants
```
src/
├── components/           # Composants réutilisables
│   ├── Workspace/       # Groupés par domaine métier
│   │   ├── WorkspaceCreateForm/
│   │   │   ├── index.tsx           # Composant principal
│   │   │   └── Component.module.scss  # Styles locaux
│   │   └── WorkspaceList/
│   └── layout/          # Composants de mise en page
├── hooks/               # Custom hooks (préfixe use*)
├── pages/               # Pages/vues principales
├── services/            # Services API et logique métier
├── store/               # Configuration Redux Toolkit
├── styles/              # Styles globaux et variables
└── utils/               # Fonctions utilitaires
```

### Hooks Personnalisés
```typescript
// Toujours préfixer par "use"
const useWorkspaceData = (workspaceId: string) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Logique de fetch
  }, [workspaceId]);
  
  return { workspace, loading };
};
```

### Redux Toolkit Patterns
```typescript
// store/slices/workspaceSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await workspaceAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  }
});
```

## API et Communication Backend

### Configuration Axios avec Intercepteurs
```typescript
// services/api.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:3000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Intercepteur JWT automatique
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion globale des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection vers login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Endpoints API Standards
```typescript
// Respecter la convention REST /api/v1/resource
const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh"
  },
  workspaces: {
    list: "/workspaces",
    create: "/workspaces",
    detail: (id: string) => `/workspaces/${id}`,
    update: (id: string) => `/workspaces/${id}`,
    delete: (id: string) => `/workspaces/${id}`
  },
  channels: {
    byWorkspace: (workspaceId: string) => `/workspaces/${workspaceId}/channels`
  }
};
```

## Sécurité et Authentification

### Gestion JWT
```typescript
// utils/auth.ts
export const tokenManager = {
  getToken: () => localStorage.getItem("authToken"),
  setToken: (token: string) => localStorage.setItem("authToken", token),
  removeToken: () => localStorage.removeItem("authToken"),
  isValidToken: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};
```

### Protection CSRF
```typescript
// Inclure le token CSRF dans les headers
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
if (csrfToken) {
  apiClient.defaults.headers["X-CSRF-TOKEN"] = csrfToken;
}
```

### OAuth Google/Facebook
```typescript
// components/Auth/GoogleAuthButton.tsx
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthButton: React.FC = () => {
  const handleSuccess = (credentialResponse: any) => {
    // Envoyer le token au backend pour validation
    authService.googleLogin(credentialResponse.credential);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google login failed")}
    />
  );
};
```

## Styling et UI/UX

### Modules SCSS
```scss
// Component.module.scss
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  &--loading {
    opacity: 0.6;
    pointer-events: none;
  }
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### Variables et Thèmes
```scss
// styles/variables.scss
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --border-radius: 0.5rem;
}
```

## Tests et Qualité

### Tests avec Jest et React Testing Library
```typescript
// __tests__/components/WorkspaceCreateForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../store";
import WorkspaceCreateForm from "../../components/Workspace/WorkspaceCreateForm";

describe("WorkspaceCreateForm", () => {
  it("should create workspace successfully", async () => {
    render(
      <Provider store={store}>
        <WorkspaceCreateForm />
      </Provider>
    );
    
    const nameInput = screen.getByLabelText(/workspace name/i);
    const submitButton = screen.getByRole("button", { name: /create/i });
    
    fireEvent.change(nameInput, { target: { value: "Test Workspace" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/workspace created successfully/i)).toBeInTheDocument();
    });
  });
});
```

### Commandes de Validation
```bash
# Linting TypeScript + React
npm run lint          # ESLint avec règles TypeScript et React
npm run lint:fix       # Correction automatique

# Tests
npm run test           # Jest avec React Testing Library
npm run test:coverage  # Couverture de code

# Build et vérification
npm run build          # Build production Vite
npm run preview        # Preview du build
npm run type-check     # Vérification TypeScript strict
```

## Performance et Optimisation

### Lazy Loading et Code Splitting
```typescript
// Lazy loading des pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Workspace = lazy(() => import("../pages/Workspace"));

// Dans le router
<Route 
  path="/dashboard" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard />
    </Suspense>
  } 
/>
```

### Optimisation des Re-renders
```typescript
// Utiliser React.memo() pour les composants
const WorkspaceCard = React.memo<WorkspaceCardProps>(({ workspace }) => {
  return <div>{workspace.name}</div>;
});

// Utiliser useCallback pour les fonctions
const handleWorkspaceUpdate = useCallback((id: string, data: Partial<Workspace>) => {
  dispatch(updateWorkspace({ id, data }));
}, [dispatch]);

// Utiliser useMemo pour les calculs coûteux
const filteredWorkspaces = useMemo(() => {
  return workspaces.filter(w => w.name.includes(searchTerm));
}, [workspaces, searchTerm]);
```

## Gestion d'Erreurs et Loading States

### Pattern de Gestion d'État
```typescript
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useAsyncData = <T>(asyncFn: () => Promise<T>) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, [asyncFn]);

  return { ...state, execute };
};
```

## Configuration Environment

### Variables d'Environnement
```env
# .env.development
VITE_API_URL=http://localhost:3000/api/v1
VITE_WEBSOCKET_URL=ws://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# .env.production  
VITE_API_URL=https://api.supchat.com/api/v1
VITE_WEBSOCKET_URL=wss://api.supchat.com
```

### Configuration Vite
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@services": path.resolve(__dirname, "src/services")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
```

## Instructions Spéciales

### Génération de Code
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

Cette configuration optimise votre assistance pour le développement frontend React du projet SUPCHAT, en respectant les architectures modernes et les meilleures pratiques de l'écosystème.