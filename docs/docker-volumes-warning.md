# ⚠️ ATTENTION : Gestion des Volumes Docker dans SUPCHAT

## 🚨 **IMPORTANT : Le nettoyage "complet" supprime TOUTES les données !**

### 📊 **Ce que contiennent tes volumes :**

#### **`mongo-data`** (Volume principal)

- ✅ **Contenu** : Toute la base de données MongoDB
- ✅ **Données** : Utilisateurs, messages, channels, workspaces, fichiers
- ⚠️ **Suppression** : Perte TOTALE de toutes les données utilisateur

#### **Volumes de développement**

- ✅ **Contenu** : Code source mappé (hot reload)
- ✅ **Emplacement** : `./web`, `./api`, `./mobile`
- ✅ **Sécurité** : Ces volumes pointent vers ton code local (pas de perte)

## 🛡️ **Nouvelles options de nettoyage dans le script :**

### **Option 1 : Nettoyage SOFT** ⭐ (Recommandé)

```bash
docker-compose down  # Pas de -v = volumes préservés
```

**Supprime :**

- ✅ Containers
- ✅ Images du projet
- ✅ Réseaux

**PRÉSERVE :**

- ✅ **Base de données** (mongo-data)
- ✅ **Tous les volumes**
- ✅ **Toutes les données utilisateur**

### **Option 2 : Nettoyage COMPLET** 💥 (Destructeur)

```bash
docker-compose down -v  # Le -v supprime les volumes !
```

**Supprime :**

- ❌ Containers
- ❌ Images du projet
- ❌ Réseaux
- ❌ **TOUS LES VOLUMES**
- ❌ **BASE DE DONNÉES COMPLÈTE**

## 🔧 **Dans le script mis à jour :**

### **Menu option 12 - Nouvelles options :**

```
🧹 Options de nettoyage du projet...
════════════════════════════════════════════════════════
  1) 🔄 Nettoyage SOFT (containers + images, GARDE les volumes)
  2) 💥 Nettoyage COMPLET (containers + images + volumes - PERTE DE DONNÉES)
  3) 📊 Voir ce qui sera supprimé
  0) ❌ Annuler
```

### **Sécurités ajoutées :**

#### **Nettoyage SOFT :**

- ✅ Message de confirmation simple
- ✅ Indication claire que les données sont préservées

#### **Nettoyage COMPLET :**

- ⚠️ **Confirmation renforcée** : il faut taper `DELETE`
- ⚠️ **Messages d'avertissement** multiples
- ⚠️ **Suggestion de backup** avant suppression

#### **Option d'analyse :**

- 📊 **Option 3** : Voir ce qui sera supprimé AVANT de le faire
- 📊 **Analyse des containers**, images, et volumes
- 📊 **Information sur le contenu des volumes**

## 💾 **Recommandations :**

### **Avant un nettoyage complet :**

1. **Backup obligatoire** : Utilise l'option `14) Backup de la base de données`
2. **Vérification** : Utilise l'option `3) Voir ce qui sera supprimé`
3. **Double-vérification** : Es-tu SÛR de vouloir perdre toutes les données ?

### **Usage quotidien :**

- **Développement** : Utilise le nettoyage **SOFT** (option 1)
- **Reset total** : Seulement si tu veux repartir de zéro
- **Production** : JAMAIS de nettoyage complet sans backup

### **Récupération après nettoyage complet :**

Si tu as fait un nettoyage complet par erreur :

1. ❌ **Données perdues** : Impossible de récupérer sans backup
2. ✅ **Redémarrage** : Lance l'option `1) Développement` ou `2) Production`
3. ✅ **Base vide** : Une nouvelle base MongoDB sera créée
4. ✅ **Restore backup** : Si tu as un backup, utilise-le pour restaurer

## 🎯 **Cas d'usage par option :**

### **Nettoyage SOFT (option 1) :**

- 🔄 **Rebuild complet** sans perdre les données
- 🔄 **Problème d'images** corrompues
- 🔄 **Reset de configuration** containers
- 🔄 **Nettoyage de développement** quotidien

### **Nettoyage COMPLET (option 2) :**

- 💥 **Projet de test** qu'on veut reset
- 💥 **Données de test** à supprimer
- 💥 **Démo** avec données fictives
- 💥 **Développement** : Reset total pour tests

## 📋 **Résumé des commandes Docker :**

```bash
# SOFT - Préserve les volumes
docker-compose down
docker-compose -f docker-compose.prod.yml down

# COMPLET - Supprime les volumes
docker-compose down -v
docker-compose -f docker-compose.prod.yml down -v

# Voir les volumes
docker volume ls
docker-compose config --volumes
```

**Le script te protège maintenant avec des confirmations claires ! 🛡️**
