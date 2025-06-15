# 🔧 GUIDE DE DÉPANNAGE - PERMISSIONS DES CANAUX

## 🚨 PROBLÈME : "Pas de droits après création d'un canal"

### ✅ SOLUTIONS IMPLÉMENTÉES

#### 1. **Amélioration de la détection du rôle**

- Vérification par ID ET par email
- Logique spéciale si pas d'owner défini
- Fallback pour les canaux publics

#### 2. **Solution de secours pour l'écriture**

- Si l'utilisateur n'est pas guest ET qu'il est connecté → peut écrire
- Variable `canActuallyWrite` utilisée au lieu de `canWriteMessages`

#### 3. **Debug en console**

- Logs détaillés des permissions dans la console du navigateur
- Affichage du rôle utilisateur dans l'interface

### 🔍 DIAGNOSTIC

Ouvrez la console du navigateur (F12) et regardez les logs "🔍 DEBUG PERMISSIONS" qui affichent :

- ID utilisateur
- Email utilisateur
- Propriétaire du canal
- Membres du canal
- Rôle calculé
- Permissions accordées

### 📱 INDICATEUR VISUEL

L'interface affiche maintenant le rôle dans l'en-tête du canal :

- **👑 Admin** - Peut tout faire
- **👤 Membre** - Peut lire/écrire, gérer ses messages
- **🔒 Invité** - Accès limité

### 🔧 SI LE PROBLÈME PERSISTE

1. **Vérifier dans la console :**

   ```
   channelOwner: { _id: "...", email: "..." }
   currentUserRole: "guest" | "member" | "admin"
   ```

2. **Solutions possibles :**

   - Le backend ne renvoie pas l'owner correctement
   - L'utilisateur n'est pas dans la liste des membres
   - Les IDs ne correspondent pas

3. **Solution temporaire :**
   - Rechargez la page après création du canal
   - Le système devrait vous donner les droits d'admin

### 🚀 PROCHAINES ÉTAPES

Si le problème persiste, il faut :

1. Vérifier l'API backend de création de canal
2. S'assurer que l'owner est correctement défini
3. Vérifier que l'utilisateur est ajouté aux membres avec le rôle admin

### 🎯 RÉSULTAT ATTENDU

Après création d'un canal, vous devriez :

- ✅ Voir "👑 Admin" dans l'en-tête
- ✅ Pouvoir écrire des messages
- ✅ Voir le bouton "Modifier"
- ✅ Avoir accès aux paramètres du canal
