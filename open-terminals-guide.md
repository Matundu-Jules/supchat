# 🖥️ Guide pour ouvrir plusieurs terminaux dans VS Code

## ❌ Problème : Ctrl+Shift+` ne fonctionne pas

Si le raccourci ne fonctionne pas, voici plusieurs alternatives :

## ✅ **Méthode 1 : Menu VS Code**

1. **Menu Terminal** → **Nouveau Terminal**
2. Ou **View** → **Terminal** → **New Terminal**

## ✅ **Méthode 2 : Raccourci alternatif**

- Essayez : `Ctrl+Shift+ù` (sur clavier français)
- Ou : `Ctrl+`` (accent grave seul)

## ✅ **Méthode 3 : Palette de commandes**

1. `Ctrl+Shift+P` (ouvre la palette)
2. Tapez "terminal new"
3. Sélectionnez "Terminal: Create New Terminal"

## ✅ **Méthode 4 : Bouton +**

Dans le panneau terminal en bas, cliquez sur le **bouton +** à côté des onglets des terminaux

## ✅ **Méthode 5 : Clic droit**

1. Clic droit dans l'explorateur de fichiers
2. "Ouvrir dans le terminal intégré"

## 🎯 **Commandes à exécuter dans chaque terminal :**

```bash
# Terminal 1 - API
docker-compose logs -f api

# Terminal 2 - Web
docker-compose logs -f web

# Terminal 3 - Database
docker-compose logs -f db

# Terminal 4 - Monitoring
docker-compose logs -f cadvisor

# Terminal 5 - Mobile (si actif)
docker-compose logs -f mobile
```

## 💡 **Conseil :**

Renommez vos terminaux en cliquant droit sur l'onglet → "Rename" pour mieux les identifier !
