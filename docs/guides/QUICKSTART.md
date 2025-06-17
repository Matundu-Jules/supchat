# 🚀 SupChat - Guide de Démarrage Rapide

## 📋 Prérequis

- Docker & Docker Compose installés
- Ports 80, 3000, 27017 disponibles

## 🚀 Démarrage Ultra-Rapide

### Option 1: Script automatisé (Recommandé)

**Linux/Mac/WSL:**

```bash
# Démarrage complet avec données de test
./supchat-manager.sh start

# Voir tous les services
./supchat-manager.sh status

# Voir les logs en temps réel
./supchat-manager.sh logs
```

**Windows PowerShell:**

```powershell
# Démarrage complet avec données de test
.\supchat-manager.ps1 start

# Voir tous les services
.\supchat-manager.ps1 status
```

### Option 2: Docker Compose manuel

```bash
# Démarrer les services principaux
docker-compose up -d db api web

# Initialiser les données de test
docker-compose up test-data-init

# Voir les logs
docker-compose logs -f
```

## 🌐 Accès à l'Application

Une fois démarré, accédez à:

- **Interface Web**: http://localhost
- **API**: http://localhost:3000
- **Documentation API**: http://localhost:3000/api-docs

## 👤 Comptes de Test Pré-créés

L'initialisation crée automatiquement ces comptes:

| Email                      | Mot de passe | Rôle   | Description                         |
| -------------------------- | ------------ | ------ | ----------------------------------- |
| `admin@admin.fr`           | `admin`      | Admin  | Accès complet à tous les workspaces |
| `john.doe@example.com`     | `user`       | Membre | Utilisateur standard                |
| `jane.smith@example.com`   | `user`       | Membre | Utilisateur standard                |
| `alice.martin@example.com` | `user`       | Membre | Utilisateur standard                |
| `bob.wilson@example.com`   | `user`       | Membre | Utilisateur standard                |

## 🏢 Workspaces Créés Automatiquement

- **Workspace Public Test** (Public) - Propriétaire: Admin
- **Workspace Privé Équipe** (Privé) - Propriétaire: John Doe
- **Marketing & Communication** (Public) - Propriétaire: Jane Smith
- **Projet Secret** (Privé) - Propriétaire: Alice Martin

Chaque workspace contient des channels par défaut:

- `général` (public)
- `annonces` (public)
- `équipe-core` (privé, membres limités)

## 🔧 Commandes de Gestion

### Script de gestion (supchat-manager)

```bash
./supchat-manager.sh start      # Démarre tout + données de test
./supchat-manager.sh stop       # Arrête tous les services
./supchat-manager.sh restart    # Redémarre tous les services
./supchat-manager.sh reset      # Reset complet (supprime tout)
./supchat-manager.sh status     # État des services
./supchat-manager.sh logs       # Logs en temps réel
./supchat-manager.sh init-data  # Réinitialise les données de test
./supchat-manager.sh clean      # Nettoie Docker
./supchat-manager.sh help       # Aide
```

### Docker Compose natif

```bash
# Services principaux
docker-compose up -d db api web mobile

# Données de test
docker-compose up test-data-init

# Arrêt
docker-compose stop

# Reset complet
docker-compose down -v
```

## 🐛 Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les ports
./supchat-manager.sh status

# Voir les erreurs
./supchat-manager.sh logs

# Reset complet
./supchat-manager.sh reset
```

### Données de test manquantes

```bash
# Réinitialiser les données
./supchat-manager.sh init-data
```

### Problème de permissions admin

L'admin (`admin@admin.fr`) devrait voir TOUS les workspaces (publics + privés). Si ce n'est pas le cas:

1. Vérifiez que vous êtes bien connecté comme admin
2. Rechargez la page (F5)
3. Vérifiez la console du navigateur (F12) pour les erreurs
4. Réinitialisez les données: `./supchat-manager.sh init-data`

## 📱 Architecture

```
Frontend Web (React/Vite) :80
        ↓
Backend API (Node.js/Express) :3000
        ↓
Base de données (MongoDB) :27017
```

## 🔒 Sécurité

- JWT pour l'authentification
- CSRF protection activée
- Variables d'environnement sécurisées
- Validation côté serveur
- Rate limiting sur les APIs

## 📚 Documentation Complète

- **API Docs**: http://localhost:3000/api-docs (après démarrage)
- **Tests**: Voir `/docs/tests-documentation.md`
- **Docker**: Voir `/docs/docker-development-production-guide.md`

## 🆘 Support

Si vous rencontrez des problèmes:

1. Consultez les logs: `./supchat-manager.sh logs`
2. Vérifiez le statut: `./supchat-manager.sh status`
3. Essayez un reset: `./supchat-manager.sh reset`

---

**Démarrage en 30 secondes:**

```bash
git clone <repo>
cd supchat
./supchat-manager.sh start
# Ouvrir http://localhost
# Se connecter: admin@admin.fr / admin
```
