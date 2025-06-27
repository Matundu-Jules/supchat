# 🟠 Roadmap de correction globale des tests ChannelsPage & Messagerie (SUPCHAT 2025)

## Objectif

Corriger l’ensemble des tests restants sur ChannelsPage (permissions, rôles, join requests, noReload, UnifiedChannelPage, messagerie temps réel) pour obtenir un passage 100% vert, en conformité avec les conventions SUPCHAT 2025 (Redux Toolkit, MSW 2.x, feedback UI, helpers de test, etc.).

---

## 📋 Étapes détaillées

### 1️⃣ Vérification et initialisation du store Redux de test

- [ ] Vérifier que tous les slices nécessaires sont bien présents dans le store de test :
  - `channelInvitations`, `channels`, `messages`, `channelRoles`, `feedbacks`, etc.
- [ ] Ajouter les slices manquants dans la configuration du store de test (mock ou vrai reducer selon besoin).
- [ ] S’assurer que l’état initial de chaque slice est cohérent avec les tests (éviter `undefined`).

### 2️⃣ Correction des helpers de test

- [ ] Vérifier que `renderWithProviders` est bien exporté/importé dans tous les tests concernés.
- [ ] Centraliser l’import du helper dans `@tests/test-utils`.
- [ ] Adapter les tests pour utiliser systématiquement ce helper (plus de render direct).

### 3️⃣ Correction des mocks et handlers MSW

- [ ] Vérifier la présence de tous les handlers nécessaires pour :
  - `GET /api/channels/join-requests`
  - `POST /api/channel-invitations/respond/:id`
  - `GET /api/channels/roles`
  - `GET /api/channels/messages`
  - `POST /api/channels/messages`
  - etc.
- [ ] Corriger les données de mock pour coller aux attentes des tests (structure, valeurs, permissions, etc.).
- [ ] S’assurer qu’aucune requête n’est "Unhandled" dans les logs MSW.

### 4️⃣ Correction des tests ChannelsPage (permissions, rôles, join requests, noReload)

- [ ] Adapter les assertions pour matcher le texte de feedback même s’il est fragmenté.
- [ ] Utiliser `waitFor` ou `findBy*` pour attendre l’apparition des éléments asynchrones.
- [ ] Vérifier la simulation des rôles utilisateurs (admin, viewer, etc.) dans le state mocké.
- [ ] Corriger les tests qui utilisent des sélecteurs sur des slices non initialisés.
- [ ] S’assurer que tous les tests utilisent bien les helpers et mocks globaux (socket, localStorage, matchMedia).

### 5️⃣ Correction des tests messagerie temps réel (Messaging.test.tsx)

- [ ] Vérifier l’initialisation du slice `messages` et des dépendances dans le store de test.
- [ ] Mock des endpoints MSW pour la messagerie (`GET/POST /api/channels/messages`).
- [ ] S’assurer que les tests simulent bien les événements socket nécessaires (mock global ou local).
- [ ] Adapter les assertions pour matcher les feedbacks et états UI attendus.

### 6️⃣ Correction des tests UnifiedChannelPage

- [ ] Vérifier que le composant UnifiedChannelPage utilise bien le store et les hooks typés.
- [ ] Corriger l’initialisation des props et du state pour éviter les erreurs de type.
- [ ] Adapter les tests pour utiliser les helpers globaux.

### 7️⃣ Correction des tests de feedback UI (FeedbackToast, etc.)

- [ ] S’assurer que les feedbacks sont bien initialisés dans le state de test.
- [ ] Adapter les assertions pour matcher les fragments de texte si besoin.
- [ ] Vérifier la gestion des feedbacks multiples (succès, erreur, etc.).

### 8️⃣ Lancer les tests et valider

- [ ] Lancer chaque test corrigé individuellement pour valider la correction.
- [ ] Lancer toute la suite de tests frontend pour valider la non-régression globale :
  ```bash
  docker compose -f docker-compose.test.yml --env-file .env.test run --rm web-test npm test -- --reporter=verbose
  ```
- [ ] Vérifier qu’il n’y a plus d’erreurs de type, de matcher ou de sélecteur Redux.

### 9️⃣ Documentation et commit

- [ ] Documenter chaque modification dans le changelog ou le README de corrections.
- [ ] Committer chaque étape avec un message explicite (ex : "fix(tests): correction store Redux test ChannelsPage.permissions").

---

## 🟢 Checklist finale

- [ ] Tous les tests passent sur ChannelsPage (permissions, rôles, join requests, noReload, UnifiedChannelPage, messagerie temps réel)
- [ ] Plus d’erreurs de types, de matchers ou de sélecteurs Redux
- [ ] MSW fonctionne avec la nouvelle syntaxe
- [ ] Setup global des tests conforme aux conventions SUPCHAT 2025
- [ ] Documentation à jour

---

> Cette roadmap doit être suivie strictement pour garantir la conformité, la robustesse et la maintenabilité des tests SUPCHAT.
