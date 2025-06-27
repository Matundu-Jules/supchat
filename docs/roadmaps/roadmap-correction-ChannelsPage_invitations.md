# 🟢 Roadmap de correction des tests ChannelsPage.invitations (SUPCHAT)

## Objectif

Corriger tous les problèmes restants sur le test `ChannelsPage.invitations.test.tsx` pour obtenir un passage 100% vert, en conformité avec les conventions SUPCHAT 2025 (Redux Toolkit, MSW 2.x, feedback UI, etc.).

---

## 📋 Étapes détaillées

### 1️⃣ Vérification des handlers MSW

- [x] Ajouter/adapter les handlers pour :
  - `GET /api/csrf-token`
  - `POST /api/channel-invitations/respond/:id`
- [x] Vérifier que tous les endpoints utilisés dans le test sont bien mockés (aucune requête "Unhandled request" dans les logs MSW)

### 2️⃣ Correction du feedback UI

- [x] Vérifier que le composant affiche bien les messages de succès attendus après acceptation/refus d'invitation
  - Texte exact attendu : "invitation acceptée" / "invitation refusée"
  - Si le texte est fragmenté, adapter le matcher dans le test (`getByText` avec fonction)
- [x] S'assurer que le feedback est bien rendu dans le DOM après l'action utilisateur

### 3️⃣ Correction du test ChannelsPage.invitations.test.tsx

- [x] Adapter les assertions pour matcher le texte de feedback même s'il est fragmenté
- [x] Utiliser `waitFor` pour attendre l'apparition du feedback
- [x] Vérifier l'utilisation de `userEvent.setup()`

### 4️⃣ Vérification du setup global

- [x] Vérifier que le setup global (`src/tests/setup.ts`) importe bien `@testing-library/jest-dom/vitest` et configure MSW
- [x] Vérifier la présence des mocks globaux nécessaires (socket, localStorage, matchMedia)

### 5️⃣ Lancer les tests et valider

- [ ] Lancer le test spécifique corrigé :
  ```bash
  docker compose -f docker-compose.test.yml --env-file .env.test run --rm web-test npm test -- src/tests/pages/ChannelsPage/ChannelsPage.invitations.test.tsx --reporter=verbose
  ```
- [ ] Vérifier qu'il n'y a plus d'erreurs de type ou de matcher
- [ ] Si tout passe, lancer tous les tests frontend pour valider la non-régression

### 6️⃣ Documentation et commit

- [ ] Documenter chaque modification dans le changelog ou le README de corrections
- [ ] Committer chaque étape avec un message explicite

---

## 🟢 Checklist finale

- [ ] Tous les tests passent sur `ChannelsPage.invitations.test.tsx`
- [ ] Plus d'erreurs de types ou de matchers
- [ ] MSW fonctionne avec la nouvelle syntaxe
- [ ] Setup global des tests conforme aux conventions SUPCHAT 2025
- [ ] Documentation à jour

---

> Cette roadmap doit être suivie strictement pour garantir la conformité et la robustesse des tests SUPCHAT.
