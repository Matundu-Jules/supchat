# 🧪 TEST - Lancement Automatique des Logs VS Code

## 📝 Résumé des Améliorations

Le script `docker-manager.sh` a été amélioré pour automatiser l'ouverture des terminaux de logs VS Code :

### ✨ Nouvelles Fonctionnalités

1. **🚀 Lancement automatique** : Le script peut maintenant lancer automatiquement les tâches VS Code
2. **🎯 Choix utilisateur** : Option entre lancement automatique ou instructions manuelles
3. **🛡️ Fallback robuste** : Si l'auto-launch échoue, instructions manuelles affichées
4. **🔧 Détection VS Code CLI** : Vérification et aide pour installer la commande `code`

### 🎮 Comment Tester

#### 1. **Lancer le script**

```bash
./docker-manager.sh
```

#### 2. **Choisir l'option logs**

- Démarrez un environnement (option 1 ou 2)
- Sélectionnez l'option `11) 🖥️ Ouvrir terminaux de logs VS Code`

#### 3. **Tester le lancement automatique**

- Le script vous propose :
  - `1) 🚀 Lancement automatique (tâche VS Code)`
  - `2) 📋 Instructions manuelles (copier-coller)`

#### 4. **Scénarios de test**

##### ✅ **Scénario 1 : VS Code CLI disponible**

- Choisissez l'option `1`
- Le script devrait :
  - Détecter la commande `code`
  - Ouvrir VS Code dans le workspace
  - Afficher les instructions pour lancer la tâche

##### ❌ **Scénario 2 : VS Code CLI non disponible**

- Si `code` n'est pas dans le PATH
- Le script devrait :
  - Afficher un message d'erreur
  - Donner les instructions pour installer VS Code CLI
  - Faire un fallback vers les instructions manuelles

##### 📋 **Scénario 3 : Choix manuel**

- Choisissez l'option `2`
- Le script devrait afficher les instructions manuelles complètes

## 🎯 Tâches VS Code Disponibles

Le script utilise ces tâches (créées dans `.vscode/tasks.json`) :

### Développement

- **🚀 Ouvrir TOUS les Logs (Développement)**
  - API, Web, DB, cAdvisor, Mobile (si disponible)
  - Commandes : `docker-compose logs -f <service>`

### Production

- **🏭 Ouvrir TOUS les Logs (Production)**
  - API, Web, DB, cAdvisor
  - Commandes : `docker-compose -f docker-compose.prod.yml logs -f <service>`

## 🔧 Résolution de Problèmes

### ❓ **VS Code CLI non trouvé**

```bash
# Dans VS Code :
# 1. Ctrl+Shift+P
# 2. Tapez : "Shell Command: Install 'code' command in PATH"
# 3. Redémarrez le terminal
```

### ❓ **Tâche VS Code non trouvée**

- Vérifiez que `.vscode/tasks.json` existe
- Les tâches sont sensibles aux émojis et espaces
- Noms exacts :
  - `🚀 Ouvrir TOUS les Logs (Développement)`
  - `🏭 Ouvrir TOUS les Logs (Production)`

### ❓ **Services non démarrés**

- Lancez d'abord un environnement (option 1 ou 2)
- Vérifiez l'état avec `docker-compose ps`

## 📊 Résultat Attendu

Quand tout fonctionne :

1. **5 terminaux séparés** s'ouvrent dans VS Code
2. **Chaque terminal** suit un service spécifique
3. **Logs en temps réel** avec `docker-compose logs -f`
4. **Pas de fenêtres fractionnées** - chaque log a son terminal

## 🎉 Avantages

- ✅ **Un clic** au lieu de 5 commandes manuelles
- ✅ **Automatisation complète** du workflow logs
- ✅ **Environnement propre** - tous les logs visibles simultanément
- ✅ **Workflow de développement optimisé**
