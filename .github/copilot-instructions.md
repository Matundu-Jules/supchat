# GitHub Copilot Instructions pour SUPCHAT

## Contexte du Projet
SUPCHAT est une plateforme de collaboration d'équipe avec workspaces, channels, messagerie et permissions basées sur les rôles. Stack MERN avec Docker.

## Technologies Principales
- **Backend**: Node.js, Express.js, MongoDB, Socket.io, JWT, OAuth2
- **Frontend Web**: React, TypeScript, Vite, CSS/SCSS
- **Frontend Mobile**: React Native, Expo
- **Infrastructure**: Docker, Docker Compose
- **Tests**: Jest, Vitest, Cypress
- **Documentation**: Swagger

## Conventions de Code

### Backend (Node.js/Express)
- Utilise toujours `async/await` plutôt que les callbacks
- Structure MVC : `controllers/`, `models/`, `routes/`, `services/`, `middlewares/`
- Validation avec `express-validator`
- Gestion d'erreurs centralisée avec middleware personnalisé
- JWT pour l'authentification, bcrypt pour les mots de passe
- Socket.io pour les notifications temps réel

### Frontend React/TypeScript
- Composants fonctionnels avec hooks React
- Types TypeScript stricts - évite `any`
- Props interfaces bien définies
- Utilise `useState`, `useEffect`, `useContext` pour l'état
- CSS Modules ou Styled Components
- Gestion d'état avec Context API ou Zustand

### Sécurité OBLIGATOIRE
- JAMAIS de secrets en dur dans le code
- Utilise les variables d'environnement
- Validation côté serveur TOUJOURS
- Sanitisation des inputs utilisateur
- Headers de sécurité (CORS, CSP, etc.)
- Rate limiting sur les APIs

### Base de Données MongoDB
- Modèles Mongoose avec schémas stricts
- Validation des schémas
- Index sur les champs fréquemment requêtés
- Population des références avec `.populate()`

### Tests
- Tests unitaires pour chaque service/composant
- Tests d'intégration pour les APIs
- Tests E2E avec Cypress pour les parcours utilisateur
- Mocks pour les services externes

### Docker
- Multi-stage builds pour optimiser les images
- `.dockerignore` pour exclure node_modules
- Variables d'environnement via `.env` files
- Health checks dans docker-compose.yml

## Patterns Spécifiques SUPCHAT

### Gestion des Workspaces
- Un workspace peut avoir plusieurs channels
- Permissions héritées : workspace → channel → message
- Types de channels : public, private

### Système d'Authentification
- Support email + OAuth2 (Google, Facebook)
- JWT avec refresh token
- Middleware d'authentification pour toutes les routes protégées

### Notifications Temps Réel
- Socket.io pour les notifications instant
- Rooms par workspace et channel
- Events: `message`, `invitation`, `notification`

### Structure des Réponses API
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-06-16T08:01:00Z"
}
```

## Erreurs Fréquentes à Éviter
- Ne pas oublier la validation des permissions avant chaque action
- Toujours vérifier l'appartenance à un workspace/channel
- Gérer les cas d'erreur réseau dans le frontend
- Ne pas exposer d'informations sensibles dans les réponses API
- Valider les données côté client ET serveur

## Outils de Développement
- Postman collection disponible pour tester l'API
- Swagger UI accessible via `/api-docs`
- Utilise `npm run dev` pour le développement local
- `docker-compose up --build` pour l'environnement complet