# Guide de Test - Correction Préférences Utilisateur

## 🧪 Tests à Effectuer

### **Test 1 : Correction du Problème Principal**

**OBJECTIF** : Vérifier que les préférences de l'utilisateur précédent ne persistent plus

**ÉTAPES** :

1. **Démarrer l'environnement de développement** :

   ```bash
   cd /c/dev/projects/supinfo/supchat
   ./docker-manager.sh
   # Choisir option 1: Démarrer en mode Développement
   ```

2. **Se connecter avec le premier utilisateur** :

   - Email : `alice@test.com` / Mot de passe : `password123`
   - Changer le thème vers `dark`
   - Changer le statut vers `busy`

3. **Se déconnecter** (bouton déconnexion)

4. **Se connecter avec un second utilisateur** :

   - Email : `bob@test.com` / Mot de passe : `password123`
   - **✅ VÉRIFIER** : Le thème doit être celui de Bob (pas dark d'Alice)
   - **✅ VÉRIFIER** : Le statut doit être celui de Bob (pas busy d'Alice)

5. **AUCUN REFRESH NÉCESSAIRE** : Les valeurs doivent être correctes immédiatement

### **Test 2 : Persistance des Préférences Individuelles**

**OBJECTIF** : Vérifier que chaque utilisateur garde ses propres préférences

**ÉTAPES** :

1. **Alice** : Se connecter, mettre thème `dark`, statut `away`
2. **Bob** : Se connecter, mettre thème `light`, statut `busy`
3. **Alice** : Se reconnecter → Doit avoir `dark` + `away`
4. **Bob** : Se reconnecter → Doit avoir `light` + `busy`

### **Test 3 : Synchronisation Multi-Onglets**

**OBJECTIF** : Vérifier la synchronisation entre plusieurs onglets

**ÉTAPES** :

1. **Onglet 1** : Se connecter avec Alice
2. **Onglet 2** : Se connecter avec Alice (même compte)
3. **Onglet 1** : Changer le thème vers `dark`
4. **Onglet 2** : **✅ VÉRIFIER** → Le thème doit se synchroniser

### **Test 4 : Mobile (Optionnel)**

**OBJECTIF** : Vérifier le comportement sur mobile

**ÉTAPES** :

1. Démarrer l'app mobile
2. Se connecter avec Alice → mettre thème `dark`
3. Se déconnecter
4. Se connecter avec Bob → **✅ VÉRIFIER** que le thème n'est pas `dark`

## 🔍 Points d'Attention

### **Signaux de Problème** :

- ❌ Thème/statut de l'utilisateur précédent visible après login
- ❌ Nécessité de refresh pour voir les bonnes valeurs
- ❌ Erreurs dans la console liées aux préférences

### **Signaux de Succès** :

- ✅ Chaque utilisateur voit immédiatement ses propres préférences
- ✅ Pas de refresh nécessaire lors du changement d'utilisateur
- ✅ localStorage organisé par `user_${userId}_theme` et `user_${userId}_status`
- ✅ Synchronisation correcte multi-onglets pour le même utilisateur

## 🐛 Debug

### **Console de Debug** :

Ajouter temporairement dans la console du navigateur :

```javascript
// Voir les préférences stockées
Object.keys(localStorage).filter((key) => key.startsWith("user_"));

// Voir l'état Redux
window.__REDUX_DEVTOOLS_EXTENSION__ &&
  console.log("Redux State:", store.getState().preferences);
```

### **Comptes de Test Disponibles** :

Disponibles dans `test-accounts.json` :

- alice@test.com / password123
- bob@test.com / password123
- charlie@test.com / password123

## 📝 Rapport de Test

**Date** : ******\_******
**Testeur** : ******\_******

| Test                                              | Statut   | Commentaires |
| ------------------------------------------------- | -------- | ------------ |
| Test 1 - Pas de persistance utilisateur précédent | ⬜ ✅ ❌ |              |
| Test 2 - Préférences individuelles                | ⬜ ✅ ❌ |              |
| Test 3 - Synchronisation multi-onglets            | ⬜ ✅ ❌ |              |
| Test 4 - Mobile (optionnel)                       | ⬜ ✅ ❌ |              |

**Commentaires généraux** :

---

---
