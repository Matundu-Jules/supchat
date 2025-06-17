# 🚨 IMPORTANT - Configuration après le nettoyage de sécurité

## Que s'est-il passé ?

Un nettoyage de sécurité a été effectué pour supprimer des mots de passe qui avaient été exposés dans l'historique Git. L'historique a été réécrit pour des raisons de sécurité.

## Actions requises pour les développeurs

### 1. Récupérer la nouvelle version

Si vous aviez déjà cloné le repository :

```bash
# Sauvegarder vos changements locaux si nécessaire
git stash

# Récupérer la nouvelle version nettoyée
git fetch origin
git reset --hard origin/master

# Restaurer vos changements si nécessaire
git stash pop
```

### 2. Configuration de l'environnement

1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Remplissez le fichier `.env` avec vos vraies valeurs de configuration :
   - JWT_SECRET : Générez une clé secrète forte
   - MONGO_INITDB_ROOT_PASSWORD : Votre mot de passe MongoDB
   - GMAIL_USER et GMAIL_PASS : Pour l'envoi d'emails
   - Etc.

### 3. Démarrage du projet

```bash
# Démarrer la base de données
docker-compose up db

# Installer les dépendances (si nécessaire)
npm run install:all

# Démarrer le backend
npm run start:api

# Démarrer le frontend web
npm run start:web

# Démarrer l'app mobile
npm run start:mobile
```

## Sécurité

- ❌ Ne jamais commiter de fichiers `.env`
- ❌ Ne jamais commiter de mots de passe en clair
- ✅ Utiliser `.env.example` pour documenter les variables nécessaires
- ✅ Utiliser des mots de passe forts pour la production

## Questions ?

En cas de problème, contactez Jules ou consultez la documentation dans `/docs/`.
