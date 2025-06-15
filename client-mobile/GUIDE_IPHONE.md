# 📱 Guide pour tester sur iPhone

## 🚀 ÉTAPES RAPIDES

### 1. Trouver ton IP

**Windows:**

```bash
powershell -ExecutionPolicy Bypass -File find-ip.ps1
```

**Mac/Linux:**

```bash
bash find-ip.sh
```

**Manuellement:**

- Windows: `ipconfig`
- Mac: `ifconfig en0`
- Linux: `hostname -I`

### 2. Mettre à jour le .env

Modifie le fichier `.env` avec ton IP:

```env
EXPO_PUBLIC_HOST=192.168.1.100
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000
```

### 3. Redémarrer Expo

```bash
npx expo start -c
```

### 4. Scanner le QR code depuis ton iPhone

## ⚠️ PROBLÈMES COURANTS

### iPhone ne se connecte pas

- ✅ iPhone et PC sur le même WiFi
- ✅ Firewall Windows désactivé temporairement
- ✅ IP correcte dans le .env
- ✅ Serveur backend qui tourne (port 3000)

### Erreur "Network request failed"

- ✅ Vérifie l'IP dans les logs de l'app
- ✅ Teste l'URL API dans le navigateur: `http://TON_IP:3000/api/auth/me`
- ✅ Redémarre le serveur backend

### Debug

L'app affiche les infos réseau dans la console au démarrage:

```
📡 Configuration réseau:
API_BASE_URL: http://192.168.1.100:3000/api
Platform: ios
```

## 🔄 CHANGEMENT RAPIDE D'IP

Si tu changes de réseau, utilise une de ces configurations:

**WiFi maison (exemple):**

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

**WiFi bureau (exemple):**

```env
EXPO_PUBLIC_API_URL=http://192.168.0.100:3000/api
```

**Hotspot mobile:**

```env
EXPO_PUBLIC_API_URL=http://192.168.43.1:3000/api
```

## 🎯 CHECKLIST DE TEST

- [ ] Backend tourne sur `http://localhost:3000`
- [ ] IP trouvée avec le script
- [ ] .env mis à jour avec la bonne IP
- [ ] Expo redémarré avec `-c`
- [ ] iPhone connecté au même WiFi
- [ ] QR code scanné depuis iPhone
- [ ] App se connecte et affiche les workspaces
