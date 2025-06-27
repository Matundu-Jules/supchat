# 🛣️ Roadmap refonte Channels Web SUPCHAT 2025

## Objectif

Compléter, corriger et fiabiliser toute la gestion des channels côté web (permissions, invitations, rôles, demandes d’adhésion, cohérence API, feedbacks UI, tests) selon les conventions SUPCHAT 2025.

---

## 📋 Roadmap détaillée (liste à cocher)

- [x] **Cartographie des routes API**
  - [x] Lister toutes les routes backend liées aux channels, invitations, rôles, demandes
  - [x] Vérifier cohérence des payloads et réponses
- [x] **Types TypeScript**
  - [x] Mettre à jour/centraliser tous les types channels, invitations, rôles, demandes dans `web/src/types/`
  - [x] Synchroniser avec les modèles backend
- [x] **Redux Toolkit**
  - [x] Refactoriser/compléter les slices channels, invitations, demandes, rôles
    - [x] channelsSlice : CRUD, join/leave, statuts par channel, feedbacks détaillés
    - [x] channelInvitationsSlice : gestion des invitations (envoi, acceptation, refus, statut)
    - [x] channelJoinRequestsSlice : gestion des demandes d’adhésion (envoi, acceptation, refus, statut)
    - [x] channelRolesSlice : gestion des rôles (promotion, rétrogradation, droits)
  - [x] Ajouter les actions asynchrones manquantes (inviter, accepter/refuser, demander à rejoindre, promote/demote, etc.)
    - [x] inviteToChannel (POST /channels/:id/invite)
    - [x] accept/decline invitation (à prévoir côté API si besoin)
    - [x] requestJoinChannel (POST /channels/:id/join)
    - [x] promote/demote member (PUT /channels/:id/members/:userId/role)
    - [x] removeMember (DELETE /channels/:id/members/:userId)
    - [x] fetchInvitations, fetchJoinRequests, fetchRoles (GET)
- [x] **Hooks métier**
  - [x] Refondre `useChannelsPageLogic` pour intégrer toute la logique manquante (permissions, invitations, demandes, rôles)
    - [x] 1. Intégrer les nouveaux selectors/slices Redux (invitations, demandes d’adhésion, rôles)
    - [x] 2. Ajouter la logique de permissions (lecture des rôles, vérification des droits avant action)
    - [x] 3. Ajouter la gestion des invitations (affichage, acceptation/refus, feedbacks)
    - [x] 4. Ajouter la gestion des demandes d’adhésion (affichage, acceptation/refus, feedbacks)
    - [x] 5. Ajouter la gestion des rôles (promotion/rétrogradation, feedbacks)
    - [x] 6. Centraliser les feedbacks utilisateur pour chaque action
    - [x] 7. Exposer toutes les actions et états nécessaires à l’UI
  - [x] Gérer les feedbacks (succès/erreur) pour chaque action
- [x] **UI/UX**
  - [x] Afficher les invitations en attente (accepter/refuser)
    - [x] Section "Invitations" sur la page ChannelsPage si invitations présentes
    - [x] Boutons "Accepter" et "Refuser" pour chaque invitation (handlers reliés)
    - [x] Feedback utilisateur après action (succès/erreur)
  - [x] Afficher bouton "Rejoindre" sur channels publics si non membre
    - [x] Bouton visible uniquement si user non membre d’un channel public
    - [x] Désactiver le bouton si une demande d’adhésion est déjà en attente
  - [x] Afficher badge "En attente" si demande d’adhésion en cours
    - [x] Badge visible à côté du bouton ou du nom du channel si joinRequest en attente
  - [x] Afficher/activer la gestion des rôles (promotion/rétrogradation)
    - [x] Pour les admins : boutons "Promouvoir"/"Rétrograder" à côté de chaque membre
    - [x] Actions reliées à handlePromoteMember/handleDemoteMember
  - [x] Afficher les feedbacks utilisateur (succès/erreur)
    - [x] Affichage des feedbacks centralisés (feedbacks.invitation, feedbacks.joinRequest, feedbacks.role, etc.)
    - [x] Utilisation d’alertes/toasts visibles
  - [x] Désactiver/masquer les actions non autorisées selon le rôle réel
    - [x] Utilisation des helpers de permissions (canInvite, canPromote, canRemove, etc.) pour conditionner l’affichage ou l’activation des actions
- [x] **Sécurité & Permissions**
  - [x] Vérifier les droits côté UI AVANT chaque action
  - [x] S’assurer que la logique métier respecte les permissions backend
- [x] **Tests automatisés (Vitest + MSW)**
  - [x] Générer et implémenter les fichiers de tests manquants pour :
    - [x] Invitations (envoi, acceptation, refus)
    - [ ] Demandes d’adhésion (envoi, acceptation, refus)
    - [ ] Gestion des rôles (promotion/rétrogradation)
    - [ ] UI conditionnelle (boutons/actions selon permissions)
  - [ ] Vérifier qu’aucun test n’existe déjà pour ces workflows dans `web/src/tests/pages/ChannelsPage/` et les autres dossiers de tests
  - [ ] Utiliser les helpers validés (`renderWithProviders`, mocks MSW, etc.)
  - [ ] Respecter la structure SUPCHAT (Vitest + MSW, pas de test manuel, pas de .env hors racine)
  - [ ] Lancer tous les tests via Docker Compose test et vérifier la robustesse/couverture
- [ ] **Validation finale**
  - [ ] Lancer tous les tests via Docker Compose test
  - [ ] Vérifier la couverture et la robustesse des workflows
- [ ] **Documentation rapide**
  - [ ] Documenter les nouveaux workflows dans `docs/`

---

**Cette roadmap servira de fil conducteur pour la refonte complète de la gestion des channels web SUPCHAT.**
