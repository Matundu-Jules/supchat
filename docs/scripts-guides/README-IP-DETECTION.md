# 🌐 SupChat - Détection Automatique d'IP et Configuration Réseau

Ce guide vous explique comment utiliser le système de détection automatique d'IP pour développer SupChat avec accès depuis mobile.

## 🚀 Scripts Disponibles

### 1. Mise à jour automatique des .env

```bash
# Détecte automatiquement votre IP locale et met à jour tous les .env
node scripts/update-env.js
```

### 2. Lancement complet de l'environnement

```bash
# Lance tous les services avec configuration automatique
node scripts/start-dev.js
```

### 3. Script PowerShell (Windows)

```powershell
# Menu interactif pour lancer les services
.\scripts\start-supchat.ps1
```

## 📁 Fichiers .env Générés

### api/.env

```bash
HOST_IP=192.168.1.100  # Votre IP locale détectée
PORT=3000
```

### web/.env

```bash
VITE_API_URL=http://192.168.1.100:3000
VITE_API_URL=http://192.168.1.100:3000/api
VITE_SOCKET_URL=http://192.168.1.100:3000
VITE_HOST_IP=192.168.1.100
```

### mobile/.env

```bash
EXPO_PUBLIC_HOST=192.168.1.100
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:3000
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3000
```

## 🔧 Utilisation des Fonctions dans le Code

### Serveur Express (api)

```javascript
// src/utils/networkUtils.js
const {
  getLocalIP,
  displayNetworkInfo,
  generateAllowedOrigins,
} = require("./utils/networkUtils");

// Obtenir l'IP locale
const localIP = getLocalIP();

// Générer les origines CORS automatiquement
const allowedOrigins = generateAllowedOrigins(3000);

// Afficher les infos de démarrage
displayNetworkInfo(3000);
```

### Client Web (web)

```typescript
// src/config/api.ts
import { BACKEND_URL, API_BASE_URL, SOCKET_URL } from "@/config/api";

// Les URLs sont automatiquement configurées via les variables d'environnement
console.log("Backend:", BACKEND_URL); // http://192.168.1.100:3000
console.log("API:", API_BASE_URL); // http://192.168.1.100:3000/api
```

### Client Mobile (mobile)

```typescript
// constants/network.ts
import {
  API_BASE_URL,
  WS_BASE_URL,
  debugNetworkConfig,
} from "@/constants/network";

// Debug de la configuration réseau
debugNetworkConfig();

// URLs automatiquement configurées
console.log("API:", API_BASE_URL); // http://192.168.1.100:3000/api
console.log("Socket:", WS_BASE_URL); // http://192.168.1.100:3000
```

## 📱 Test sur Mobile

### Étapes pour tester sur téléphone :

1. **Lancez la mise à jour des .env :**

   ```bash
   node scripts/update-env.js
   ```

2. **Vérifiez les URLs générées :**

   - Le script affiche les URLs dans la console
   - Votre IP locale est automatiquement détectée

3. **Lancez les services :**

   ```bash
   # Option 1: Tout en une fois
   node scripts/start-dev.js   # Option 2: Service par service
   npm run dev        # web
   npm start          # api
   npm start          # mobile
   ```

4. **Connectez-vous depuis votre mobile :**
   - **Client Web :** Ouvrez `http://VOTRE_IP:5173` dans le navigateur mobile
   - **Client Mobile :** L'app Expo utilise automatiquement l'IP détectée

## 🔍 Dépannage

### Problème : "localhost ne fonctionne pas sur mobile"

**Solution :** Lancez `node scripts/update-env.js` pour détecter automatiquement votre IP.

### Problème : "Connection refused"

**Solutions :**

1. Vérifiez que votre firewall Windows autorise les connexions sur le port 3000
2. Assurez-vous d'être sur le même réseau WiFi (ordinateur et mobile)
3. Relancez le script de détection d'IP

### Problème : "IP détectée incorrecte"

**Solution :** Modifiez manuellement les fichiers .env avec la bonne IP :

```bash
# Trouvez votre IP
ipconfig    # Windows
ifconfig    # Mac/Linux

# Ou utilisez la fonction dans Node.js
node -e "console.log(require('./api/src/utils/networkUtils').getLocalIP())"
```

## 🎯 Intégration avec les Tâches VS Code

Vous pouvez toujours utiliser vos tâches VS Code existantes après avoir lancé la mise à jour des .env :

1. `Ctrl+Shift+P` → "Tasks: Run Task"
2. Sélectionnez :
   - "Start Backend"
   - "Start Frontend Web"
   - "Start Mobile"
   - "Start DB (Docker Compose)"

## 📋 Checklist de Démarrage Rapide

- [ ] Lancez `node scripts/update-env.js`
- [ ] Vérifiez les logs pour voir l'IP détectée
- [ ] Démarrez les services avec `node scripts/start-dev.js` ou les tâches VS Code
- [ ] Testez l'accès depuis votre navigateur mobile
- [ ] Vérifiez que l'app Expo se connecte correctement

---

🎉 **Votre environnement SupChat est maintenant configuré automatiquement pour le développement mobile !**
