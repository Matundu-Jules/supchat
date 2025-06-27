# 🔧 Guide de Debug - Messagerie WebSocket SUPCHAT

## ✅ Corrections Appliquées

### 1. **Authentification WebSocket**

- ✅ Ajout du token JWT dans `useSocket.ts`
- ✅ Récupération du token depuis les cookies
- ✅ Gestion des erreurs de connexion

### 2. **Synchronisation des Événements**

- ✅ Noms d'événements uniformisés :
  - `new-message` (serveur → client)
  - `message-updated` (serveur → client)
  - `message-deleted` (serveur → client)
  - `message-sent` (serveur → client)

### 3. **Modèle Message Unifié**

- ✅ Champs synchronisés automatiquement
- ✅ Support des réactions
- ✅ Compatibilité descendante

### 4. **Structure de Données Cohérente**

- ✅ Format uniforme pour tous les messages WebSocket
- ✅ Champs author/userId harmonisés
- ✅ Support channel/channelId

## 🧪 Comment Tester

### 1. **Utiliser le Composant de Test**

Dans n'importe quelle page de votre app, ajoutez temporairement :

```tsx
import MessageTester from "@components/testing/MessageTester";

// Dans votre composant
<MessageTester channelId="VOTRE_CHANNEL_ID" userId="VOTRE_USER_ID" />;
```

### 2. **Tests Manuels**

1. **Connexion WebSocket** :

   - Vérifiez que le status indique "Connected ✅"
   - Les logs doivent montrer "Socket connecté"

2. **Envoi de Messages** :

   - Testez "Envoyer (API)" → doit persister en DB
   - Testez "Test WebSocket" → test direct WebSocket
   - Vérifiez les confirmations dans les logs

3. **Réception de Messages** :
   - Ouvrez 2 onglets avec le même channel
   - Envoyez un message dans un onglet
   - Vérifiez qu'il apparaît dans l'autre

### 3. **Debugging Avancé**

#### Console Navigateur :

```javascript
// Vérifier la connexion WebSocket
console.log("Socket connecté:", socket.connected);
console.log("Socket ID:", socket.id);

// Écouter tous les événements
const originalEmit = socket.emit;
socket.emit = function (...args) {
  console.log("🚀 Émis:", args);
  return originalEmit.apply(this, args);
};

const originalOn = socket.on;
socket.on = function (event, handler) {
  console.log("👂 Écoute:", event);
  return originalOn.call(this, event, (...args) => {
    console.log("📥 Reçu:", event, args);
    return handler(...args);
  });
};
```

#### Côté Serveur (logs Docker) :

```bash
# Voir les logs WebSocket
docker-compose logs -f api | grep -i socket

# Voir tous les logs API
docker-compose logs -f api
```

## 🔍 Points de Vérification

### ❌ Problèmes Courants

1. **"Authentication error: No token provided"**

   - ➡️ Vérifiez que l'utilisateur est connecté
   - ➡️ Vérifiez les cookies dans DevTools

2. **Messages pas reçus en temps réel**

   - ➡️ Vérifiez les noms d'événements
   - ➡️ Vérifiez que le client rejoint bien le channel

3. **Erreur "Channel non trouvé"**
   - ➡️ Vérifiez l'ID du channel
   - ➡️ Vérifiez les permissions utilisateur

### ✅ Signes de Bon Fonctionnement

1. **Connexion** :

   - Status "Connected ✅"
   - Log "channels-joined" avec liste des channels

2. **Messages** :

   - Confirmation "message-sent" après envoi
   - Réception "new-message" sur les autres clients
   - Persistance en base de données

3. **Performances** :
   - Messages affichés instantanément
   - Pas d'erreurs dans la console
   - Synchronisation parfaite multi-clients

## 🚀 Optimisations Appliquées

### Performance

- ✅ Évitement des doublons de messages
- ✅ Gestion efficace des timeouts typing
- ✅ Nettoyage automatique des listeners

### Sécurité

- ✅ Validation des permissions par channel
- ✅ Authentification JWT obligatoire
- ✅ Validation côté serveur des données

### Robustesse

- ✅ Gestion des déconnexions réseau
- ✅ Fallback sur l'API si WebSocket échoue
- ✅ Synchronisation automatique des champs

## 📊 Monitoring

### Métriques à Surveiller

- Nombre de connexions WebSocket actives
- Latence des messages (envoi → réception)
- Taux d'erreurs de connexion
- Messages perdus/dupliqués

### Commandes de Debug

```bash
# Stats connexions WebSocket (dans l'API)
curl http://localhost:3001/api/debug/websocket-stats

# Vérifier la santé de l'API
curl http://localhost:3001/api/health

# Logs temps réel
docker-compose logs -f api | grep "new-message\|message-sent\|Socket"
```

## 🎯 Prochaines Étapes

1. **Tests d'Intégration** : Lancez les tests WebSocket existants
2. **Tests de Charge** : Testez avec plusieurs utilisateurs simultanés
3. **Optimisation** : Ajustez les timeouts selon vos besoins
4. **Monitoring** : Ajoutez des métriques de performance

---

**🔧 Note** : Supprimez le composant `MessageTester` une fois les tests terminés pour éviter qu'il reste en production.
