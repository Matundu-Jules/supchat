# Guide de Configuration Réseau - Client Web SupChat

## 🎯 Objectif

Ce guide vous aide à configurer le client web pour fonctionner sur différents environnements réseau (localhost, IP du PC, serveur distant).

## 🚀 Configuration Rapide

### Option 1: Script Automatique (Recommandé)

**Sur Windows (PowerShell) :**

```powershell
.\find-ip.ps1
```

**Sur Linux/macOS (Bash) :**

```bash
chmod +x find-ip.sh
./find-ip.sh
```

### Option 2: Configuration Manuelle

1. **Copiez le fichier d'exemple :**

   ```bash
   cp .env.example .env
   ```

2. **Éditez le fichier .env :** ```bash
   # Remplacez localhost par l'IP de votre PC
   VITE_BACKEND_URL=http://192.168.1.100:3000
   VITE_API_URL=http://192.168.1.100:3000
   VITE_WEBSOCKET_URL=http://192.168.1.100:3000
   VITE_GOOGLE_REDIRECT_URI=http://192.168.1.100:3000/api/auth/google/callback
   VITE_FACEBOOK_REDIRECT_URI=http://192.168.1.100:3000/api/auth/facebook/callback
   ```

   ```

## 🔧 Variables d'Environnement

| Variable                     | Description                                  | Exemple                                            |
| ---------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `VITE_BACKEND_URL`           | URL du serveur backend (pour proxy Vite)     | `http://localhost:3000`                            |
| `VITE_API_URL`               | URL de l'API pour les appels côté client     | `http://localhost:3000`                            |
| `VITE_WEBSOCKET_URL`         | URL WebSocket pour les connexions temps réel | `http://localhost:3000`                            |
| `VITE_GOOGLE_CLIENT_ID`      | Client ID Google OAuth                       | `123456-abc.apps.googleusercontent.com`            |
| `VITE_FACEBOOK_APP_ID`       | App ID Facebook OAuth                        | `123456789012345`                                  |
| `VITE_GOOGLE_REDIRECT_URI`   | URL de redirection Google                    | `http://localhost:3000/api/auth/google/callback`   |
| `VITE_FACEBOOK_REDIRECT_URI` | URL de redirection Facebook                  | `http://localhost:3000/api/auth/facebook/callback` |

## 🛡️ Sécurité

### ✅ Exposé côté client (préfixe VITE\_)

- Client ID Google/Facebook
- URLs publiques
- Configuration d'environnement

### ❌ NE JAMAIS exposer côté client

- JWT secrets
- Client secrets OAuth
- Mots de passe base de données
- Clés API privées

**Ces secrets doivent être dans le serveur backend uniquement !**

## 🌐 Scénarios de Déploiement

### 1. Développement Local (localhost)

```bash
VITE_BACKEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
VITE_WEBSOCKET_URL=http://localhost:3000
```

### 2. Test sur iPhone/Appareil Mobile

```bash
# Remplacez par l'IP de votre PC
VITE_BACKEND_URL=http://192.168.1.100:3000
VITE_API_URL=http://192.168.1.100:3000
VITE_WEBSOCKET_URL=http://192.168.1.100:3000
```

### 3. Serveur de Développement

```bash
VITE_BACKEND_URL=http://dev-server:3000
VITE_API_URL=http://dev-server:3000
VITE_WEBSOCKET_URL=http://dev-server:3000
```

### 4. Production

```bash
VITE_BACKEND_URL=https://api.supchat.com
VITE_API_URL=https://api.supchat.com
VITE_WEBSOCKET_URL=https://api.supchat.com
```

## 🔄 Redémarrage après Changement

```bash
# Arrêtez le serveur de développement (Ctrl+C)
# Puis redémarrez
npm run dev
```

## 🐛 Dépannage

### Problème: "Proxy error" ou "ECONNREFUSED"

**Solution :** Vérifiez que le serveur backend tourne et que l'URL dans `VITE_BACKEND_URL` est correcte.

### Problème: OAuth ne fonctionne pas

**Solution :**

1. Vérifiez les URLs de redirection dans la console Google/Facebook
2. Mettez à jour les variables `VITE_*_REDIRECT_URI`
3. Assurez-vous que le serveur backend gère ces URLs

### Problème: "Network Error" sur mobile

**Solution :**

1. Vérifiez que le PC et le mobile sont sur le même réseau WiFi
2. Utilisez l'IP du PC au lieu de localhost
3. Vérifiez que le firewall n'bloque pas le port 3000

## 📱 Test sur Appareil Mobile

1. **Connectez l'appareil au même réseau WiFi que le PC**
2. **Trouvez l'IP du PC :**
   - Windows : `ipconfig`
   - macOS/Linux : `ifconfig` ou `ip addr`
3. **Utilisez le script automatique ou mettez à jour manuellement le .env**
4. **Redémarrez le serveur de développement**
5. **Accédez à `http://IP_DU_PC:5173` depuis le mobile**

## 🔗 Liens Utiles

- [Configuration OAuth Google](https://console.developers.google.com/)
- [Configuration OAuth Facebook](https://developers.facebook.com/)
- [Documentation Vite Proxy](https://vitejs.dev/config/server-options.html#server-proxy)
