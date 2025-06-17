# � SUPCHAT - Logs et Terminaux VS Code

## 🎯 Nouvelle Approche Simplifiée ✨

Depuis la dernière mise à jour, l'ouverture des terminaux de logs a été **considérablement améliorée** pour une expérience plus fiable et universelle.

### 🚀 Comment utiliser les terminaux de logs

1. **Lancez votre environnement** via `docker-manager.sh`
2. **Choisissez l'option 3** "Ouvrir les terminaux de logs VS Code" dans le menu post-démarrage
3. **Un guide s'ouvre automatiquement** dans VS Code avec toutes les instructions
4. **Suivez les instructions** pour créer vos terminaux avec les bonnes commandes

### 🖥️ Méthode Manuelle

Si vous préférez faire manuellement, voici les raccourcis clés :

#### Pour VS Code :
- **`Ctrl+Shift+\``** : Ouvrir un nouveau terminal
- **Clic droit sur l'onglet** : Renommer le terminal
- **`Ctrl+C`** : Arrêter le suivi des logs dans un terminal

#### Commandes de logs prêtes à copier :

**Développement :**
```bash
# API Backend
docker-compose logs -f api

# Web Frontend  
docker-compose logs -f web

# MongoDB Database
docker-compose logs -f db

# cAdvisor Monitoring
docker-compose logs -f cadvisor

# Mobile App (si lancé)
docker-compose logs -f mobile
```

**Production :**
```bash
# API Backend
docker-compose -f docker-compose.prod.yml logs -f api

# Web Frontend
docker-compose -f docker-compose.prod.yml logs -f web

# MongoDB Database
docker-compose -f docker-compose.prod.yml logs -f db

# cAdvisor Monitoring  
docker-compose -f docker-compose.prod.yml logs -f cadvisor
```

## 📋 Fonctionnalités

### Terminaux Ouverts Automatiquement

#### Environnement Développement

- **API Backend** : `docker-compose logs -f api`
- **Web Frontend** : `docker-compose logs -f web`
- **MongoDB Database** : `docker-compose logs -f db`
- **cAdvisor Monitoring** : `docker-compose logs -f cadvisor`
- **Mobile App** : `docker-compose logs -f mobile` (si disponible)

#### Environnement Production

- **API Backend** : `docker-compose -f docker-compose.prod.yml logs -f api`
- **Web Frontend** : `docker-compose -f docker-compose.prod.yml logs -f web`
- **MongoDB Database** : `docker-compose -f docker-compose.prod.yml logs -f db`
- **cAdvisor Monitoring** : `docker-compose -f docker-compose.prod.yml logs -f cadvisor`

#### Environnement Test

- **API Backend Test** : `docker-compose -f docker-compose.test.yml logs -f api`
- **MongoDB Test** : `docker-compose -f docker-compose.test.yml logs -f db-test`

## 🔧 Prérequis

### Obligatoires

- **VS Code** installé et disponible via la commande `code`
- **Docker** et **Docker Compose** fonctionnels
- **Services SUPCHAT** démarrés

### Windows Spécifique

- **PowerShell** (inclus dans Windows 10/11)
- **Politique d'exécution** PowerShell permissive (le script gère automatiquement avec `-ExecutionPolicy Bypass`)

### Linux/macOS Spécifique

- Un terminal graphique : `gnome-terminal`, `xterm`, `konsole`, ou `terminator`

## 🎯 Avantages

### ✅ Surveillance Centralisée

- Tous les logs de tous les services visibles simultanément
- Identification rapide des erreurs entre services
- Monitoring en temps réel du trafic API/Frontend

### ✅ Développement Efficace

- Debug facilité avec logs multi-services
- Détection immédiate des erreurs de compilation/runtime
- Suivi des requêtes HTTP en temps réel

### ✅ Production Monitoring

- Surveillance continue des services en production
- Détection rapide des pannes ou erreurs
- Logs persistants même après fermeture accidentelle

## 🚨 Dépannage

### VS Code ne s'ouvre pas automatiquement

```bash
# Vérifier que VS Code est dans le PATH
code --version

# Si erreur, installer/réinstaller VS Code et cocher "Add to PATH"
```

### PowerShell bloqué par les politiques d'exécution

```powershell
# Vérifier la politique actuelle
Get-ExecutionPolicy

# Temporairement autoriser les scripts locaux
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Terminaux vides ou erreurs Docker

```bash
# Vérifier que les services sont démarrés
docker-compose ps

# Si aucun service, démarrer d'abord
docker-compose up -d
```

### Logs ne s'affichent pas

```bash
# Vérifier les logs manuellement
docker-compose logs api

# Si vide, le service peut ne pas être démarré correctement
docker-compose restart api
```

## 📝 Commandes Manuelles de Fallback

Si l'ouverture automatique échoue, utilisez ces commandes manuelles :

### Développement

```bash
docker-compose logs -f api      # Backend
docker-compose logs -f web      # Frontend
docker-compose logs -f db       # Database
docker-compose logs -f cadvisor # Monitoring
```

### Production

```bash
docker-compose -f docker-compose.prod.yml logs -f api      # Backend
docker-compose -f docker-compose.prod.yml logs -f web      # Frontend
docker-compose -f docker-compose.prod.yml logs -f db       # Database
docker-compose -f docker-compose.prod.yml logs -f cadvisor # Monitoring
```

## 🎯 Noms de Terminaux Suggérés

Pour une meilleure organisation, vous pouvez renommer vos terminaux (clic droit sur l'onglet) :
- **API-Backend** pour `docker-compose logs -f api`
- **Web-Frontend** pour `docker-compose logs -f web`
- **MongoDB** pour `docker-compose logs -f db`
- **cAdvisor** pour `docker-compose logs -f cadvisor`
- **Mobile-App** pour `docker-compose logs -f mobile`

## 📋 Workflow Typique

1. **Démarrer l'environnement** : `./docker-manager.sh` → Option 1 ou 2
2. **Ouvrir le guide** : Option 3 dans le menu post-démarrage
3. **Créer les terminaux** : `Ctrl+Shift+\`` plusieurs fois dans VS Code
4. **Copier les commandes** : Une par terminal depuis le guide ouvert
5. **Surveiller en temps réel** : Chaque terminal montre les logs d'un service

## 🔧 Avantages de Cette Nouvelle Approche

- ✅ **Universelle** : Fonctionne sur tous les OS et configurations VS Code
- ✅ **Fiable** : Pas de dépendance à l'API VS Code qui peut changer
- ✅ **Intuitive** : Instructions claires avec émojis et explications
- ✅ **Flexible** : Vous choisissez quels terminaux ouvrir
- ✅ **Compatible** : Marche même si la CLI `code` n'est pas installée

## 💡 Conseils Pro

- **Gardez le guide ouvert** : Le fichier temporaire reste accessible pendant votre session
- **Organisez vos terminaux** : Renommez-les pour une identification rapide
- **Utilisez les raccourcis** : `Ctrl+Shift+\`` devient votre meilleur ami
- **Surveillez les erreurs** : Les logs en temps réel vous alertent immédiatement

---

**🎉 Profitez de votre développement SUPCHAT avec une visibilité complète sur tous vos services !**
