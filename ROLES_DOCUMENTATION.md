# Système de Rôles et Permissions - SupChat

## Vue d'ensemble

SupChat implémente un système de rôles hiérarchiques avec des permissions granulaires selon le tableau de référence suivant :

## Rôles par défaut

### **Admin** (ou Owner)

**Peut faire :**

- Créer/supprimer des channels
- Gérer les membres (inviter, exclure, changer de rôle)
- Modifier les paramètres du workspace (nom, logo, intégrations, plan de facturation)
- Exporter ou supprimer les données du workspace
- Voir et modérer tout le contenu

**Ne peut pas faire :**

- Aucune restriction

### **Member** (Membre)

**Peut faire :**

- Accéder aux channels publics
- Rejoindre les channels privés où il est invité
- Envoyer des messages, réagir, partager des fichiers
- Créer des channels _privés_ dont il devient propriétaire
- Voir la liste complète des membres du workspace

**Ne peut pas faire :**

- Changer la configuration globale du workspace
- Gérer les rôles des autres
- Voir les channels privés auxquels il n'est pas invité
- Créer des channels publics

### **Guest** (Invité)

**Peut faire :**

- Accéder à un sous-ensemble précis de channels (souvent privés) où il est explicitement invité
- Envoyer des messages et des fichiers dans ces channels
- Réagir aux messages dans ses channels autorisés

**Ne peut pas faire :**

- Créer des channels
- Consulter la liste complète des membres
- Voir les channels publics hors de son périmètre
- Accéder aux channels non autorisés

## Structure technique

### Modèle Permission

```javascript
{
  userId: ObjectId,
  workspaceId: ObjectId,
  role: "admin" | "membre" | "invité",
  channelRoles: [
    {
      channelId: ObjectId,
      role: "admin" | "membre" | "invité"
    }
  ],
  permissions: {
    canPost: Boolean,
    canDeleteMessages: Boolean,
    canManageMembers: Boolean,
    canManageChannels: Boolean,
    canCreateChannels: Boolean,
    canViewAllMembers: Boolean,
    canViewPublicChannels: Boolean,
    canUploadFiles: Boolean,
    canReact: Boolean,
  }
}
```

### Permissions par défaut par rôle

#### Admin

```javascript
{
  canPost: true,
  canDeleteMessages: true,
  canManageMembers: true,
  canManageChannels: true,
  canCreateChannels: true,
  canViewAllMembers: true,
  canViewPublicChannels: true,
  canUploadFiles: true,
  canReact: true,
}
```

#### Membre

```javascript
{
  canPost: true,
  canDeleteMessages: false,
  canManageMembers: false,
  canManageChannels: false,
  canCreateChannels: true, // Seulement channels privés
  canViewAllMembers: true,
  canViewPublicChannels: true,
  canUploadFiles: true,
  canReact: true,
}
```

#### Invité

```javascript
{
  canPost: true,
  canDeleteMessages: false,
  canManageMembers: false,
  canManageChannels: false,
  canCreateChannels: false,
  canViewAllMembers: false,
  canViewPublicChannels: false, // Ne voit que ses channels autorisés
  canUploadFiles: true,
  canReact: true,
}
```

## API Endpoints

### Inviter un invité avec accès limité

```
POST /api/workspaces/:id/invite-guest
Body: {
  email: string,
  allowedChannels: string[] // IDs des channels autorisés
}
```

### Gestion des permissions

```
GET /api/permissions?workspaceId=:id
PUT /api/permissions/:permissionId
DELETE /api/permissions/:permissionId
```

## Logique de contrôle d'accès

### Channels

- **Publics** : Accessibles aux admins et membres, pas aux invités sauf si explicitement membres
- **Privés** : Accessibles uniquement aux membres explicites

### Membres du workspace

- **Admins/Membres** : Peuvent voir tous les membres
- **Invités** : Ne peuvent pas voir la liste complète

### Création de channels

- **Admins** : Peuvent créer tous types de channels
- **Membres** : Peuvent créer uniquement des channels privés
- **Invités** : Ne peuvent pas créer de channels

## Implémentation

### Services

- `rolePermissionService.js` : Logique des permissions par rôle
- `workspaceService.js` : Gestion des invitations et permissions
- `channelService.js` : Contrôle d'accès aux channels

### Contrôleurs

- Validation des permissions avant chaque action
- Filtrage des données selon le rôle
- Messages d'erreur appropriés

### Frontend

- Composant `GuestInviteManager` : Interface pour inviter des invités
- Masquage conditionnel des fonctionnalités selon les permissions
- Gestion des erreurs de permissions

## Tests

Les tests couvrent :

- Permissions par rôle
- Accès aux channels selon le type et le rôle
- Création de channels avec restrictions
- Visibilité des membres du workspace
- Invitation d'invités avec accès limité

Fichier de test : `tests/roles/rolePermissions.test.js`
