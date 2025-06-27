# 🔌 DIAGNOSTIC WEBSOCKET - PROBLÈME DE MESSAGES TEMPS RÉEL

**Date** : 22 juin 2025  
**Status** : 🔴 PROBLÈME CRITIQUE  
**Priorité** : HAUTE

---

## 🎯 SYMPTÔMES OBSERVÉS

### Comportement Actuel (Bugué) :

- ❌ Les messages envoyés n'apparaissent **PAS** en temps réel pour l'expéditeur
- ❌ Les messages envoyés n'apparaissent **PAS** en temps réel pour les autres clients
- ✅ Les messages sont bien **sauvegardés** en base de données
- ✅ Les messages apparaissent après **rechargement** de la page
- ✅ L'authentification WebSocket fonctionne
- ✅ La connexion WebSocket s'établit correctement

### Comportement Attendu :

- ✅ L'expéditeur voit son message immédiatement
- ✅ Les autres clients connectés au channel voient le message en temps réel
- ✅ Synchronisation parfaite entre tous les clients

---

## 🔍 FLUX DE DONNÉES ANALYSÉ

### 1. ENVOI DE MESSAGE (Frontend → Backend)

#### Frontend (`useMessages.ts`) :

```javascript
const send = async (text: string, file?: File | null) => {
  // 1. Envoyer via API (pour la persistance)
  await dispatch(addMessage({ channelId, text, file }));

  // 2. PROBLÈME : Double envoi supprimé ✅
  // socket.emit('send-message', {...}); // SUPPRIMÉ
};
```

#### API (`messageController.js`) :

```javascript
// 1. Validation et sauvegarde
const message = new Message(messageData);
await message.save();

// 2. Émission WebSocket
const io = getIo();
io.to(channelId).emit("new-message", message); // ✅ Corrigé
```

### 2. RÉCEPTION DE MESSAGE (Backend → Frontend)

#### Backend (`socket.js`) :

```javascript
// Auto-join des channels
socket.join(channelId); // ✅ Fonctionne

// Émission à tous les clients du channel
io.to(channelId).emit("new-message", message); // ✅ Devrait fonctionner
```

#### Frontend (`useMessages.ts`) :

```javascript
socket.on("new-message", (msg) => {
  console.log("🚀 NOUVEAU MESSAGE REÇU:", msg); // ❌ Jamais appelé
  dispatch(pushMessage(msg));
});
```

---

## 🐛 CAUSES POSSIBLES IDENTIFIÉES

### 1. **Problème de Joining des Channels**

```javascript
// socket.js - Auto-join lors de la connexion
const userChannels = await Channel.find({ members: socket.userId });
channelIds.forEach((channelId) => {
  socket.join(channelId); // ✅ Semble OK
});
```

**DIAGNOSTIC** : ✅ Probablement OK - Les logs montrent `channels-joined`

### 2. **Problème de Structure des Données**

```javascript
// Backend émet un objet Mongoose
io.to(channelId).emit("new-message", message);

// Frontend attend un objet JSON simple
socket.on("new-message", (msg) => {
  dispatch(pushMessage(msg)); // ❌ Possible problème de sérialisation
});
```

**DIAGNOSTIC** : 🔴 SUSPECT - Objet Mongoose vs JSON

### 3. **Problème d'Authentification WebSocket**

```javascript
// Backend vérifie le token JWT
socket.userId = user._id.toString();
socket.user = user;

// Frontend passe le token depuis les cookies
auth: {
  token: token;
}
```

**DIAGNOSTIC** : ✅ OK - L'authentification fonctionne

### 4. **Problème de Connexion Multi-Onglets**

- ✅ StrictMode désactivé
- ✅ Global socket instance
- ✅ Gestion défensive des connexions

**DIAGNOSTIC** : ✅ OK - Corrigé

### 5. **Problème de Redux State Management**

```javascript
// messagesSlice.ts - Protection anti-doublons
const exists = state.items.some((m) => m._id === action.payload._id);
if (!exists) {
  state.items.push(action.payload); // ❌ Possible problème d'ID
}
```

**DIAGNOSTIC** : 🔴 SUSPECT - Comparaison d'IDs

---

## 🧪 TESTS DE DIAGNOSTIC

### Test 1 : Vérification Émission Backend

```bash
# Dans les logs du backend, chercher :
🚀 [MessageController] Émission event new-message pour channel: XXX
✅ [MessageController] Event new-message émis avec succès
```

### Test 2 : Vérification Réception Frontend

```javascript
// Dans la console du navigateur :
socket.on("new-message", (msg) => {
  console.log("🚀 MESSAGE REÇU:", msg);
});
```

### Test 3 : Test Manuel WebSocket

```javascript
// Test direct dans la console :
socket.emit("send-message", {
  channelId: "XXX",
  content: "Test direct",
});
```

---

## 🔧 HYPOTHÈSES DE CORRECTION

### Hypothèse 1 : Problème de Sérialisation Mongoose

```javascript
// Au lieu de :
io.to(channelId).emit("new-message", message);

// Utiliser :
io.to(channelId).emit("new-message", {
  _id: message._id,
  text: message.text,
  userId: message.userId,
  channelId: message.channelId,
  createdAt: message.createdAt,
});
```

### Hypothèse 2 : Problème de Channel ID

```javascript
// Vérifier que le channelId utilisé pour l'émission
// correspond exactement à celui où les clients sont joints
console.log("Channel pour émission:", channelId);
console.log("Channels joints par socket:", Array.from(socket.rooms));
```

### Hypothèse 3 : Problème de Timing

```javascript
// Ajouter un délai pour s'assurer que la sauvegarde est terminée
await message.save();
setTimeout(() => {
  io.to(channelId).emit("new-message", message);
}, 100);
```

---

## 📊 PLAN DE TEST SYSTÉMATIQUE

### Étape 1 : Test en Isolation

1. ✅ Créer environnement de test propre
2. ✅ Utiliser `docker-compose.test.yml`
3. ✅ Tests unitaires WebSocket

### Étape 2 : Test Multi-Clients

1. 🔄 Ouvrir 2 onglets sur l'interface web
2. 🔄 Se connecter avec 2 comptes différents
3. 🔄 Envoyer message depuis onglet 1
4. 🔄 Vérifier réception sur onglet 2

### Étape 3 : Debug avec Logs

1. 🔄 Logs backend activés
2. 🔄 Logs frontend dans console navigateur
3. 🔄 Surveillance en temps réel

---

## 🚨 PROCHAINES ACTIONS PRIORITAIRES

1. **Corriger la sérialisation Mongoose** dans `messageController.js`
2. **Créer un test reproductible** du problème
3. **Vérifier la jointure des channels** dans `socket.js`
4. **Tester avec 2 clients réels** (multi-onglets)
5. **Valider la correction** avec tous les cas d'usage

---

**Statut** : 🔄 EN COURS DE DIAGNOSTIC  
**Prochaine étape** : Test reproductible en environnement Docker de test
