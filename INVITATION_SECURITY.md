# Gestion des Invitations - Utilisateurs Existants Uniquement

## Vue d'ensemble

Le système SupChat ne permet d'inviter que des utilisateurs qui possèdent déjà un compte sur la plateforme. Cette restriction garantit que seuls les utilisateurs vérifiés et authentifiés peuvent rejoindre des workspaces.

## Fonctionnalités

### Vérification Côté Backend

1. **Invitation Standard (`/api/workspaces/:id/invite`)**

   - Vérifie que l'email fourni correspond à un utilisateur existant
   - Retourne une erreur 400 si l'utilisateur n'existe pas
   - Message d'erreur : "Cette adresse email ne correspond à aucun utilisateur inscrit. Seuls les utilisateurs ayant un compte peuvent être invités."

2. **Invitation d'Invités (`/api/workspaces/:id/invite-guest`)**
   - Même vérification que pour les invitations standards
   - Applique également les restrictions d'accès aux channels spécifiés

### Gestion Côté Frontend

1. **Messages d'Erreur Informatifs**

   - Affichage d'un message clair expliquant pourquoi l'invitation a échoué
   - Suggestion implicite que la personne doit d'abord créer un compte

2. **Validation Email**
   - Validation basique du format email avant envoi
   - Empêche les requêtes inutiles pour des emails mal formatés

## Utilisation

### Pour les Administrateurs

Lorsque vous tentez d'inviter quelqu'un :

1. **Si l'utilisateur existe** : L'invitation est envoyée et la personne recevra une notification
2. **Si l'utilisateur n'existe pas** : Un message d'erreur s'affiche indiquant que la personne doit d'abord créer un compte

### Workflow Recommandé

1. Demander à la personne de créer un compte sur SupChat
2. Une fois le compte créé, procéder à l'invitation
3. La personne recevra une notification et pourra rejoindre le workspace

## Tests

Des tests automatisés vérifient que :

- Les invitations d'utilisateurs non-existants sont rejetées
- Les messages d'erreur appropriés sont retournés
- Les invitations d'utilisateurs existants fonctionnent normalement
- Cette restriction s'applique aussi bien aux invitations standards qu'aux invitations d'invités

## Sécurité

Cette approche améliore la sécurité en :

- Empêchant l'envoi d'invitations à des adresses email non vérifiées
- Garantissant que tous les membres ont été authentifiés
- Évitant le spam d'invitations vers des adresses inexistantes
