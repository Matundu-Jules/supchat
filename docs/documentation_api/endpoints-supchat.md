# SUPCHAT API – Cartographie complète des endpoints (mise à jour 28/06/2025)

Ce document recense tous les endpoints REST de l’API SUPCHAT, leur organisation par domaine, et les conventions d’accès (auth, sécurité, uploads, intégrations, etc.).

---

## Authentification (`/auth`)

- POST /auth/register : inscription
- POST /auth/login : connexion
- POST /auth/logout : déconnexion
- POST /auth/logout-all : déconnexion toutes sessions
- GET /auth/me : infos utilisateur connecté
- PATCH /auth/me/password : changer mot de passe
- POST /auth/set-password : définir mot de passe (social login)
- DELETE /auth/me : supprimer compte
- POST /auth/google-login : login Google
- POST /auth/facebook-login : login Facebook
- POST /auth/forgot-password : mot de passe oublié
- POST /auth/reset-password : reset mot de passe
- POST /auth/refresh : refresh JWT

## Workspaces (`/workspaces`)

- POST /workspaces/ : créer workspace
- GET /workspaces/ : workspaces de l’utilisateur
- GET /workspaces/public : workspaces publics
- GET /workspaces/:id : workspace par ID
- GET /workspaces/:id/members : membres d’un workspace
- GET /workspaces/:id/public : infos publiques
- PUT /workspaces/:id : MAJ workspace
- DELETE /workspaces/:id : supprimer workspace
- POST /workspaces/:id/invite : inviter membre
- POST /workspaces/join : rejoindre via code
- POST /workspaces/:id/request-join : demander à rejoindre
- GET /workspaces/:id/join-requests : demandes en attente
- POST /workspaces/:id/join-requests/:requestUserId/approve : approuver demande
- POST /workspaces/:id/join-requests/:requestUserId/reject : rejeter demande
- DELETE /workspaces/:id/members/:userId : retirer membre
- POST /workspaces/:id/invite-guest : inviter invité
- POST /workspaces/:id/channels : créer channel dans workspace
- GET /workspaces/:id/channels : channels du workspace
- GET /workspaces/:id/search/messages : recherche messages
- POST /workspaces/:id/invite-link : générer lien d’invitation
- POST /workspaces/join/:inviteCode : rejoindre via lien
- DELETE /workspaces/:id/leave : quitter workspace

## Channels (`/channels`)

- POST /channels/ : créer channel
- GET /channels/ : lister channels
- GET /channels/:id : channel par ID
- PUT /channels/:id : MAJ channel
- DELETE /channels/:id : supprimer channel
- POST /channels/:id/invite : inviter membre
- POST /channels/:id/join : rejoindre channel
- DELETE /channels/:id/leave : quitter channel
- GET /channels/:id/members : membres du channel
- PUT /channels/:id/members/:userId/role : MAJ rôle membre
- DELETE /channels/:id/members/:userId : retirer membre
- POST /channels/:id/members : ajouter membre
- POST /channels/:id/messages : envoyer message
- GET /channels/:id/messages : messages du channel
- POST /channels/:id/messages/upload : upload fichier
- PUT /channels/:id/notification-settings : MAJ notifications
- POST /channels/:channelId/invitations : créer invitation enrichie
- GET /channels/:channelId/invitations : lister invitations
- POST /channels/invitations/respond/:invitationId : répondre invitation

## Messages (`/messages`)

- POST /messages/ : envoyer message (upload possible)
- GET /messages/channel/:channelId : messages d’un channel
- GET /messages/:id : message par ID
- PUT /messages/:id : MAJ message (upload possible)
- DELETE /messages/:id : supprimer message
- POST /messages/:id/reactions : ajouter réaction
- DELETE /messages/:id/reactions : retirer réaction

## Utilisateur (`/user`)

- GET /user/profile : profil utilisateur
- PUT /user/profile : MAJ profil
- PUT /user/email : MAJ email
- POST /user/avatar : upload avatar
- DELETE /user/avatar : supprimer avatar
- GET /user/preferences : préférences
- PUT /user/preferences : MAJ préférences
- GET /user/export : exporter données

## Permissions (`/permissions`)

- POST /permissions/ : créer permission
- GET /permissions/check : vérifier permission
- POST /permissions/set : set permission
- GET /permissions/ : lister permissions
- GET /permissions/:id : permission par ID
- PUT /permissions/:id : MAJ permission
- DELETE /permissions/:id : supprimer permission

## Notifications (`/notifications`)

- GET /notifications/ : notifications utilisateur
- PUT /notifications/:id/read : marquer comme lue
- PUT /notifications/read-all : tout marquer comme lu
- DELETE /notifications/:id : supprimer notification
- GET /notifications/preferences : préférences notifications
- PUT /notifications/preferences : MAJ préférences

## Préférences de notification (`/notification-prefs`)

- GET /notification-prefs/ : préférences
- PUT /notification-prefs/ : MAJ préférences

## Recherche (`/search`)

- GET /search/ : recherche simple
- GET /search/advanced : recherche avancée

## Intégrations (`/integrations`)

- GET /integrations/ : lister intégrations
- POST/DELETE /integrations/google-drive : lier/délier Google Drive
- POST /integrations/google-drive/connect : connecter Google Drive
- POST /integrations/google-drive/share : partager fichier
- POST/DELETE /integrations/github : lier/délier GitHub
- POST /integrations/github/connect : connecter GitHub
- POST /integrations/github/webhook : webhook GitHub
- POST /integrations/teams/connect : connecter Teams
- DELETE /integrations/:id : supprimer intégration
- POST/DELETE /integrations/google : lier/délier Google
- POST/DELETE /integrations/facebook : lier/délier Facebook

## Bots (`/bots`)

- POST /bots/reminder/create : créer rappel
- POST /bots/poll/create : créer sondage
- POST /bots/poll/:id/vote : voter sondage
- POST /bots/custom/webhook : webhook custom

## Réactions (`/reactions`)

- POST /reactions/ : ajouter réaction
- GET /reactions/:messageId : réactions d’un message
- DELETE /reactions/:id : supprimer réaction

## Health

- GET /health : health check

---

**Conventions :**

- Tous les endpoints sont sécurisés par authMiddleware sauf exceptions publiques.
- Organisation stricte par domaine métier.
- Uploads sécurisés via Multer.
- Permissions et intégrations gérées par endpoints dédiés.
- Voir conventions et sécurité dans la documentation projet.
