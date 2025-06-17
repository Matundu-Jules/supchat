# 🚀 SUPCHAT Docker Manager

Scripts de gestion complets pour l'environnement Docker de SUPCHAT.

## 📁 Fichiers disponibles

- **`docker-manager.sh`** - Script Bash/Linux/macOS
- **`docker-manager.ps1`** - Script PowerShell/Windows
- **`docker-manager.bat`** - Script Batch/Windows (fallback)

## 🎯 Fonctionnalités

### 🌟 **ENVIRONNEMENTS COMPLETS**

- **Développement** : Hot reload, nodemon, volumes mappés
- **Production** : Images optimisées, health checks, Nginx

### 🔧 **GESTION DES SERVICES**

- Démarrer/Arrêter/Redémarrer services individuels
- Builder services en mode dev ou prod
- Status en temps réel

### 📊 **MONITORING & LOGS**

- Visualisation des logs par service
- Logs en temps réel (follow)
- État détaillé des containers
- Utilisation des ressources (CPU, RAM, disque)

### 🛠️ **OUTILS AVANCÉS**

- Shell interactif dans les containers
- Backup automatique MongoDB
- Nettoyage complet du projet
- Restart intelligent
- Ouverture automatique des URLs

## 🚀 Utilisation

### **Windows (Méthode recommandée)**

```batch
# Double-cliquer sur le fichier ou en ligne de commande
docker-manager.bat
```

### **Windows (PowerShell)**

```powershell
# Ouvrir PowerShell en tant qu'administrateur
cd d:\Projets\SUPINFO\3PROJ-Groupe\supchat-1

# Exécuter le script
.\docker-manager.ps1
```

### **Linux/macOS (Bash)**

```bash
# Se placer dans le répertoire du projet
cd /path/to/supchat-1

# Exécuter le script
./docker-manager.sh
```

## 🎮 Interface du menu

```
╔══════════════════════════════════════════════════════════════╗
║                    🚀 SUPCHAT DOCKER MANAGER                ║
║                                                              ║
║              Gestion complète de l'environnement Docker     ║
╚══════════════════════════════════════════════════════════════╝

📊 État actuel des containers:
════════════════════════════════════════════════════════

ENVIRONNEMENTS:
  1) 🚀 Lancer TOUT en DÉVELOPPEMENT (hot reload)
  2) 🏭 Lancer TOUT en PRODUCTION (optimisé)

GESTION DES SERVICES:
  3) 🔧 Démarrer un service spécifique
  4) ⏹️  Arrêter un service spécifique
  5) 🔄 Redémarrer un service spécifique
  6) 🏗️  Builder/Rebuilder un service

MONITORING & LOGS:
  7) 📊 Voir l'état des containers
  8) 📝 Voir les logs d'un service
  9) 📈 Suivre les logs en temps réel
 10) 🖥️  Ouvrir un shell dans un container

MAINTENANCE:
 11) 🛑 Arrêter TOUS les services
 12) 🧹 Nettoyage complet (containers + images)
 13) 🔄 Restart complet (stop + build + start)

UTILITAIRES:
 14) 💾 Backup de la base de données
 15) 📦 Voir l'utilisation des ressources
 16) 🌐 Ouvrir les URLs de l'application

 0) ❌ Quitter
```

## 🎯 Cas d'usage principaux

### **Développement quotidien**

1. `1` → Lancer tout en développement
2. `8` → Voir les logs pour déboguer
3. `5` → Redémarrer un service après modification

### **Tests en production**

1. `2` → Lancer tout en production
2. `16` → Ouvrir les URLs pour tester
3. `15` → Vérifier les ressources

### **Maintenance**

1. `14` → Backup de la DB
2. `12` → Nettoyage complet
3. `13` → Restart complet

## 🌐 URLs de l'application

| Service        | URL                              | Description                 |
| -------------- | -------------------------------- | --------------------------- |
| **Frontend**   | http://localhost:80              | Interface utilisateur React |
| **API**        | http://localhost:3000            | Backend Node.js/Express     |
| **API Health** | http://localhost:3000/api/health | Health check                |
| **API Docs**   | http://localhost:3000/api-docs   | Documentation Swagger       |
| **MongoDB**    | localhost:27017                  | Base de données             |
| **cAdvisor**   | http://localhost:8080            | Monitoring containers       |

## 🔐 Prérequis

- **Docker** installé et démarré
- **Docker Compose** installé
- Être dans le répertoire racine du projet SUPCHAT
- **Windows** : PowerShell 5.0+ ou PowerShell Core
- **Linux/macOS** : Bash 4.0+

## 🚨 Dépannage

### **"Docker command not found"**

- Vérifier que Docker est installé et dans le PATH
- Redémarrer le terminal après installation

### **"Permission denied"**

- **Linux/macOS** : `chmod +x docker-manager.sh`
- **Windows** : Exécuter PowerShell en administrateur

### **"docker-compose.yml not found"**

- Vérifier que vous êtes dans le bon répertoire
- Le script doit être exécuté depuis la racine du projet

## 🎨 Fonctionnalités spéciales

### **Auto-détection de l'environnement**

- Détecte automatiquement l'OS
- Adapte les commandes selon le système

### **Gestion intelligente des shells**

- Shell adapté selon le container (sh, bash, mongosh)
- Vérification de l'état avant connexion

### **Backup automatique**

- Horodatage automatique
- Compression des backups
- Stockage dans `./backups/`

### **Ouverture automatique des URLs**

- Détection du navigateur par défaut
- Support multi-OS (xdg-open, open, start)

## 📝 Notes importantes

- Les volumes sont préservés entre les redémarrages
- Les backups sont créés dans le dossier `./backups/`
- Le nettoyage complet supprime TOUTES les données
- En mode développement, le code est synchronisé en temps réel

## 🤝 Support

Pour toute question ou problème, consultez :

- `docs/docker-development-production-guide.md`
- `docs/docker-harmonisation-complete.md`
- Les logs des containers via le menu option 8
