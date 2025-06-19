# Correction du problème d'URL de réinitialisation de mot de passe

## Problème identifié

L'URL généré dans l'email de réinitialisation de mot de passe pointait vers `http://localhost:5173` (port par défaut de Vite en développement) au lieu du port 80 configuré dans Docker.

## Corrections apportées

### 1. Modification du contrôleur d'authentification

**Fichier**: `api/controllers/authController.js`

- **Avant**: URL codée en dur `http://localhost:5173/reset-password?token=${resetToken}`
- **Après**: URL dynamique selon l'environnement avec fallbacks appropriés

```js
// URL frontend dynamique selon l'environnement
let frontendUrl;
if (process.env.NODE_ENV === "production") {
  frontendUrl = process.env.FRONTEND_URL || "https://supchat.com";
} else if (process.env.NODE_ENV === "test") {
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
} else {
  // Développement
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:80";
}

const emailHtml = renderToStaticMarkup(
  React.createElement(ResetPasswordEmail, {
    resetUrl: `${frontendUrl}/reset-password?token=${resetToken}`,
    userName: user.name || user.email,
  })
);
```

### 2. Ajout de la variable d'environnement

**Fichier**: `.env.example`

Ajout de la variable `FRONTEND_URL`:

```bash
# Frontend URL for email links (reset password, etc.)
FRONTEND_URL=http://localhost:80
```

### 3. Configuration Docker Compose

Configuration spécifique par environnement :

#### Développement (`docker-compose.yml`)

```yaml
# Frontend URL for email links (development)
- FRONTEND_URL=http://localhost:80
```

#### Production (`docker-compose.prod.yml`)

```yaml
# Frontend URL définie dans .env.production
- FRONTEND_URL=${FRONTEND_URL}
```

#### Tests (`docker-compose.test.yml`)

```yaml
# Frontend URL for email links (test environment)
- FRONTEND_URL=http://localhost:8080
```

## Configuration selon l'environnement

La solution utilise une logique intelligente qui s'adapte automatiquement :

### 🔧 Développement (`NODE_ENV=development`)

- **URL par défaut**: `http://localhost:80`
- **Port Docker**: 80
- **Configuration**: Automatique via docker-compose.yml

### 🧪 Tests (`NODE_ENV=test`)

- **URL par défaut**: `http://localhost:8080`
- **Port Docker**: 8080 (différent pour isolation)
- **Configuration**: Automatique via docker-compose.test.yml

### 🚀 Production (`NODE_ENV=production`)

- **URL par défaut**: `https://supchat.com`
- **Configuration**: Via variable `FRONTEND_URL` dans `.env.production`
- **Exemple**: `https://votre-domaine.com`

## Fallbacks de sécurité

Si `FRONTEND_URL` n'est pas définie, le système utilise des URLs par défaut appropriées :

```js
if (process.env.NODE_ENV === "production") {
  frontendUrl = process.env.FRONTEND_URL || "https://supchat.com";
} else if (process.env.NODE_ENV === "test") {
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
} else {
  // Développement
  frontendUrl = process.env.FRONTEND_URL || "http://localhost:80";
}
```

## Vérification

Pour vérifier que la correction fonctionne :

1. Consultez les logs de l'API après avoir demandé un reset de mot de passe
2. L'URL générée devrait utiliser le bon port (80 au lieu de 5173)
3. Le lien dans l'email devrait être accessible

## Architecture respectée

Cette correction respecte les principes de l'architecture SUPCHAT :

- ✅ Configuration par variables d'environnement
- ✅ Différentiation entre environnements (dev/test/prod)
- ✅ Pas de valeurs codées en dur
- ✅ Configuration Docker centralisée
- ✅ Compatibilité avec tous les environnements

## Files modifiés

- `api/controllers/authController.js` - Logique d'URL dynamique
- `.env.example` - Nouvelle variable d'environnement
- `docker-compose.yml` - Configuration développement
- `docker-compose.prod.yml` - Configuration production
- `docker-compose.test.yml` - Configuration tests
