# SUPCHAT Docker Manager - Version Modulaire

## 📁 Structure Modulaire

Le script `docker-manager.sh` a été restructuré en modules logiques pour une meilleure maintenabilité et organisation du code.

### Architecture des Modules

```
docker-manager/
├── utils.sh          # 🔧 Utilitaires de base, couleurs, fonctions communes
├── menu.sh           # 📋 Affichage des menus et navigation
├── environments.sh   # 🌍 Gestion des environnements (dev/prod/test)
├── services.sh       # ⚙️  Gestion des services Docker (start/stop/restart)
├── monitoring.sh     # 📊 Monitoring, logs et diagnostic
├── utilities.sh      # 🛠️  Utilitaires (backup, nettoyage, URLs)
└── tests.sh          # 🧪 Gestion des tests automatisés
```

### Fonctionnalités par Module

#### 🔧 utils.sh

- **Variables globales** : Couleurs, nom du projet, services
- **Fonctions communes** : pause, clear_input_buffer, show_header
- **Détection d'environnements** : detect_active_environments, select_environment
- **Vérifications** : check_prerequisites

#### 📋 menu.sh

- **Menu principal** : show_menu avec toutes les options
- **Menus post-démarrage** : post_start_menu, post_start_menu_prod
- **Navigation** : Gestion des choix utilisateur

#### 🌍 environments.sh

- **Démarrage complet** : start_development, start_production
- **Démarrage rapide** : quick_start_development, quick_start_production, quick_start_tests
- **Gestion des environnements** : Build + démarrage avec menus intégrés

#### ⚙️ services.sh

- **Gestion intelligente** : restart_service avec détection automatique d'environnement
- **Fonctions helper** : restart_service_in_env
- **CRUD services** : start_service, stop_service, build_service
- **Maintenance** : stop_all, full_restart

#### 📊 monitoring.sh

- **Logs** : view_logs, view_logs_prod, follow_logs
- **Shell** : open_shell avec options spécialisées par service
- **Ressources** : show_resources, diagnostic_services
- **Monitoring intelligent** : Détection automatique d'environnement

#### 🛠️ utilities.sh

- **Backup** : backup_database, backup_database_prod
- **URLs** : open_urls avec ouverture automatique de navigateur
- **Nettoyage** : cleanup avec options soft/complet
- **Multi-plateforme** : Support Windows/Linux/macOS

#### 🧪 tests.sh

- **Tests complets** : run_tests avec options multiples
- **Couverture** : Tests avec couverture de code
- **Debug** : Mode debug avec logs détaillés
- **Nettoyage** : Environnement de test isolé

## 🚀 Améliorations Apportées

### ✅ Problèmes Résolus

1. **🔄 Redémarrage de services** :

   - Détection automatique de l'environnement actif
   - Choix manuel si plusieurs environnements actifs
   - Vérification de l'état avant redémarrage
   - Messages d'erreur informatifs

2. **🎯 Gestion d'environnement** :

   - Sélection intelligente d'environnement
   - Support complet dev/prod/test
   - Pas de confusion entre les fichiers docker-compose

3. **🧹 Code propre** :
   - Élimination du code dupliqué
   - Fonctions réutilisables
   - Structure modulaire claire

### ✨ Nouvelles Fonctionnalités

1. **🔍 Détection intelligente** :

   - Auto-détection des environnements actifs
   - Messages d'aide contextuels
   - Validation des prérequis

2. **🛠️ Fonctions helper** :

   - `restart_service_in_env()` pour usage dans les menus
   - `select_environment()` pour choix automatique/manuel
   - `get_env_name()` pour nommage cohérent

3. **📱 Multi-plateforme** :
   - Support Windows (start), Linux (xdg-open), macOS (open)
   - Gestion des erreurs améliorée
   - Messages d'aide adaptatifs

## 🔧 Utilisation

### Lancement

```bash
./docker-manager.sh
```

### Structure des appels

Le script principal charge automatiquement tous les modules et les fonctions sont disponibles immédiatement.

### Exemple de l'option 8 (Redémarrer un service)

```bash
# Détection automatique de l'environnement
# Si un seul environnement actif → sélection automatique
# Si plusieurs → demande à l'utilisateur
# Vérification de l'état du service
# Redémarrage avec affichage du nouvel état
```

## 📝 Maintenance

### Ajouter une nouvelle fonctionnalité

1. Identifier le module approprié
2. Ajouter la fonction dans le module
3. Mettre à jour le menu si nécessaire
4. Tester la fonctionnalité

### Modifier une fonctionnalité existante

1. Localiser la fonction dans le bon module
2. Modifier uniquement le fichier concerné
3. Tester les interactions avec les autres modules

### Debug

- Chaque module peut être testé indépendamment
- Fonctions de diagnostic intégrées
- Messages d'erreur détaillés

## 🆕 Migration depuis v1.0

L'ancien script a été sauvegardé en `docker-manager-old.sh`.

### Avantages de la v2.0 :

- ✅ Code 5x plus maintenable
- ✅ Fonctionnalités robustes
- ✅ Gestion d'erreurs améliorée
- ✅ Support multi-environnement intelligent
- ✅ Pas de code dupliqué
- ✅ Structure modulaire extensible

La migration est transparente pour l'utilisateur - toutes les fonctionnalités existantes sont préservées et améliorées.
