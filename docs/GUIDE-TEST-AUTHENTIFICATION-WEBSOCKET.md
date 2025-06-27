# Guide de Test : Authentification WebSocket

## Objectif

Diagnostiquer et corriger l'authentification WebSocket pour la messagerie temps réel de SUPCHAT.

## Problème Identifié

- **Erreur**: `useSocket.ts:25 [useSocket] Aucun token d'authentification trouvé`
- **Conséquence**: `TypeError: socket.on is not a function` dans `useMessages.ts`

## Corrections Apportées

### 1. Côté Frontend (`useSocket.ts`)

- ✅ Suppression de la récupération du token depuis `getCookie('access')`
- ✅ Utilisation de `withCredentials: true` pour les cookies HTTP-only
- ✅ Vérification de l'état d'authentification Redux avant connexion
- ✅ Ajout d'un état `isConnected` pour surveiller la connexion

### 2. Côté Backend (`socket.js`)

- ✅ Ajout d'une fonction `parseCookies()` pour extraire les cookies
- ✅ Modification du middleware d'authentification pour chercher le token dans les cookies HTTP-only
- ✅ Logs détaillés pour diagnostiquer l'authentification
- ✅ Support du token dans `socket.handshake.auth.token` (fallback)

### 3. Protection dans `useMessages.ts`

- ✅ Gestion défensive : vérification de `socket` et `isConnected` avant `socket.on()`
- ✅ Pas d'écoute des événements si la connexion WebSocket n'est pas établie

## Test 1 : Authentification Basic

1. Se connecter à l'application : http://localhost/login
2. Naviguer vers la page de test : http://localhost/websocket-test
3. Vérifier dans le composant de diagnostic :
   - ✅ **Authentification** : Connecté = ✓
   - ✅ **Cookies** : `access` = ✓ (présent), `refresh` = ✓ (présent)
   - ✅ **WebSocket** : Connexion = ✓ Connecté

## Test 2 : Logs Serveur

```bash
# Vérifier les logs d'authentification WebSocket côté serveur
docker-compose logs api | grep "WebSocket"
```

**Logs attendus :**

```
[WebSocket Auth] Headers: { cookie: 'access=...', auth: {} }
[WebSocket Auth] Cookies parsés: { access: 'jwt-token...', refresh: '...' }
[WebSocket Auth] Token trouvé: eyJhbGciOiJIUzI1NiIsInR5...
[WebSocket] Utilisateur authentifié: user@example.com (userId)
```

## Test 3 : Messagerie en Temps Réel

1. Aller dans un channel : http://localhost/workspaces/[ID]/channels/[CHANNEL_ID]
2. Ouvrir les outils de développement (F12) → Console
3. Envoyer un message
4. Vérifier dans la console :
   ```
   [useMessages] Nouveau message reçu: { ... }
   [useMessages] Confirmation envoi message: { success: true, message: {...} }
   ```

## Debug Avancé

### Si le token n'est pas trouvé dans les cookies :

```javascript
// Console développeur
document.cookie.split(";").forEach((c) => console.log(c.trim()));
```

### Si la connexion WebSocket échoue :

```bash
# Logs détaillés du serveur
docker-compose logs api --tail=50 | grep -E "(WebSocket|socket|auth)"
```

### Si les événements WebSocket ne fonctionnent pas :

1. Vérifier que `socket.connected` est `true`
2. Vérifier que les noms d'événements correspondent :
   - Client écoute : `new-message`, `message-updated`, `message-deleted`, `message-sent`
   - Serveur émet : `new-message`, `message-updated`, `message-deleted`, `message-sent`

## Status Actuel

- ✅ Hook `useSocket` corrigé pour l'authentification par cookies
- ✅ Middleware serveur corrigé pour extraire le token des cookies
- ✅ Protection défensive dans `useMessages`
- ✅ Composant de diagnostic créé
- ⏳ **À TESTER** : Fonctionnement complet avec utilisateur connecté

## Prochaines Étapes

1. Tester avec un utilisateur connecté
2. Vérifier la réception des messages temps réel
3. Corriger les éventuels problèmes identifiés
4. Supprimer les composants de test temporaires
5. Documenter la solution finale
