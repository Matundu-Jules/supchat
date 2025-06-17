# Guide de Création des Comptes de Test - SupChat

## 🎯 Comptes à Créer

Voici les comptes de test à créer manuellement via l'interface web :

### 📋 Liste des Comptes

| Email                     | Mot de passe | Nom           | Role  |
| ------------------------- | ------------ | ------------- | ----- |
| admin@admin.fr            | admin        | Admin         | admin |
| john.doe@example.com      | user         | John Doe      | user  |
| jane.smith@example.com    | user         | Jane Smith    | user  |
| alice.martin@example.com  | user         | Alice Martin  | user  |
| bob.wilson@example.com    | user         | Bob Wilson    | user  |
| charlie.brown@example.com | user         | Charlie Brown | user  |
| david.taylor@example.com  | user         | David Taylor  | user  |
| emma.garcia@example.com   | user         | Emma Garcia   | user  |

## 🚀 Instructions

### 1. Accéder à l'application

- Ouvrez votre navigateur
- Allez sur : http://localhost (ou l'URL de votre frontend)

### 2. Créer le compte Admin

1. Cliquez sur "S'inscrire"
2. Remplissez :
   - **Nom** : Admin
   - **Email** : admin@admin.fr
   - **Mot de passe** : admin
   - **Confirmer** : admin
3. Cliquez sur "Créer le compte"

### 3. Créer les autres comptes

Répétez l'opération pour chaque compte de la liste ci-dessus.

### 4. Test du toggle Privacy

Une fois connecté avec le compte admin :

1. Allez dans "Workspaces"
2. Créez un nouveau workspace privé
3. Modifiez-le pour le passer en public
4. Vérifiez que le changement persiste après refresh (F5)

## 📝 Script Alternative (avec CSRF)

Si vous voulez automatiser, voici un script qui gère le CSRF :

\`\`\`bash

# Obtenir le token CSRF

CSRF_TOKEN=$(curl -s http://localhost:3000/api/csrf-token | grep -o '"csrfToken":"[^"]\*"' | cut -d'"' -f4)

# Créer un utilisateur avec CSRF

curl -X POST "http://localhost:3000/api/auth/register" \
 -H "Content-Type: application/json" \
 -H "X-CSRF-Token: $CSRF_TOKEN" \
 -d '{"name": "Admin", "email": "admin@admin.fr", "password": "admin"}'
\`\`\`

## 🎉 Données de Test Suggérées

Une fois les comptes créés, vous pouvez créer :

### Workspaces

1. **"Workspace Public Test"** (public) - Owner: admin@admin.fr
2. **"Équipe Dev"** (privé) - Owner: john.doe@example.com
3. **"Marketing"** (public) - Owner: jane.smith@example.com
4. **"Projet Secret"** (privé) - Owner: alice.martin@example.com

### Channels (dans chaque workspace)

- **général** (public)
- **annonces** (public)
- **équipe-core** (privé, seulement 2-3 membres)

### Messages de test

- "Bonjour tout le monde ! 👋"
- "Comment ça va aujourd'hui ?"
- "Réunion prévue à 14h en salle de conférence"
- "N'oubliez pas de valider vos timesheet 📝"

## ✅ Vérifications

1. **Login/Logout** fonctionne pour tous les comptes
2. **Toggle Privacy** fonctionne et persiste
3. **Création de workspaces** fonctionne
4. **Permissions** sont respectées (privé vs public)
5. **Messages** s'affichent en temps réel

---

**Note** : Ce guide est temporaire. Une fois que le problème de CSRF sera résolu, nous automatiserons la création des comptes via le docker-compose.
