# 🛣️ Roadmap Correction Tests Join Requests ChannelsPage (SUPCHAT 2025)

## Objectif

Corriger et fiabiliser les tests automatisés de la gestion des demandes d’adhésion (join requests) sur la page ChannelsPage, en s’alignant sur la structure et les patterns validés du fichier ChannelsPage.invitations.test.tsx.

---

## 📋 Étapes détaillées

1. **Analyse comparative**

   - [x] Étudier la structure du test invitations (store, MSW, route, preloadedState)
   - [x] Identifier les écarts dans ChannelsPage.joinRequests.test.tsx

2. **Préparation des mocks et fixtures**

   - [x] Définir des données de test joinRequests et channels typées, cohérentes avec l’API attendue
   - [x] Préparer un utilisateur de test (user) avec le bon rôle et ID

---

3. **Configuration du store Redux**

   - [x] Utiliser `configureStore` avec tous les reducers nécessaires (auth, channels, channelJoinRequests, etc.)
   - [x] Initialiser le preloadedState avec :
     - auth (user connecté, isAuthenticated)
     - channelJoinRequests (items, loading, error, statusById)
     - channels (items, loading, error, etc.)
     - autres slices si besoin (roles, notifications, etc.)

---

4. **Mock des routes API avec MSW**

   - [x] Mocker la route `*/workspaces/*/channels` pour retourner `{ channels }`
   - [x] Mocker la route `*/channel-join-requests` pour retourner `{ joinRequests }`
   - [x] Mocker les routes POST pour accept/refuse/join avec un retour de succès

5. **Rendu du composant avec contexte réaliste**

   - [x] Utiliser la fonction `render` validée SUPCHAT
   - [x] Passer le store configuré et la route `/workspaces/ws1/channels` à `render`

6. **Écriture des tests**

   - [x] Vérifier l’affichage des demandes d’adhésion en attente
   - [x] Tester l’acceptation/refus d’une demande (feedback UI)
   - [x] Tester l’envoi d’une demande d’adhésion à un channel public (feedback UI)
   - [ ] ⚠️ Correction à apporter : simuler la sélection d’un canal public (ex : "general") dans chaque test avant toute vérification, pour déclencher l’affichage attendu (pattern invitations).

7. **Validation et robustesse**

   - [ ] S’assurer que tous les tests passent dans l’environnement Docker
   - [ ] Vérifier la couverture et la robustesse des workflows (feedbacks, edge cases)

8. **Documentation**
   - [ ] Documenter la structure du test, les patterns utilisés et les conventions SUPCHAT respectées

---

## 🔎 Synthèse analyse comparative (Copilot)

### Structure ChannelsPage.invitations.test.tsx

- Helpers SUPCHAT (`render`), MSW, Redux Toolkit, slices Redux, types stricts
- Données de test typées localement (invitations, channels)
- Store Redux configuré explicitement avec slices et preloadedState
- Handlers MSW configurés dans `beforeEach` pour toutes les routes attendues
- Rendu du composant avec helpers validés, store et route passée
- Tests : affichage, interactions, feedback UI, edge cases

### Structure ChannelsPage.joinRequests.test.tsx

- Helpers SUPCHAT (`render`), MSW, fixtures channels/joinRequests, React Testing Library
- Données de test importées depuis fixtures (pas de typage strict visible)
- Handlers MSW configurés dans `beforeEach` (routes join requests)
- Pas de configuration explicite du store Redux ni de preloadedState
- Rendu du composant sans store personnalisé ni route passée
- Tests : affichage, interactions (accepter/refuser/join), feedback UI

### Écarts identifiés

- Store Redux non injecté ni configuré dans joinRequests (vs invitations)
- Données de test : importées, mais typage strict à vérifier
- Route non passée explicitement au helper `render`
- Handlers MSW : syntaxe différente (routes `/api/channels` vs `*/workspaces/*/channels`)
- Pas de configuration fine des slices Redux (auth, channelJoinRequests, etc.)

### Recommandation

- S’aligner sur la structure invitations : store Redux configuré, preloadedState, helpers validés, typage strict, MSW v2, route explicite.
- S’aligner strictement sur la structure du test invitations pour garantir la robustesse et la maintenabilité.
- Utiliser les helpers validés (`render`, storeOverride, route, mocks MSW v2).
- Respecter la convention SUPCHAT (aucun any, typage strict, pas de mock global non typé).
- Toute modification doit être consignée dans la roadmap et la documentation technique.

_(Ajouté automatiquement par Copilot pour traçabilité et suivi de la démarche)_

---

**Cette roadmap servira de guide pour toute correction ou refonte des tests join requests ChannelsPage SUPCHAT.**
