# 🔒 GUIDE DE SÉCURITÉ - SupChat Détection IP Automatique

## ⚠️ AVERTISSEMENTS CRITIQUES

### 🚨 **DÉVELOPPEMENT UNIQUEMENT**

- ❌ **NE JAMAIS utiliser ces scripts en production**
- ❌ **NE JAMAIS exposer d'IP publiques**
- ❌ **NE JAMAIS commit les fichiers .env générés**

### 🚨 **VARIABLES CLIENT EXPOSÉES**

- ⚠️ Les variables `VITE_*` sont **INCLUSES** dans le bundle client
- ⚠️ Les variables `EXPO_PUBLIC_*` sont **VISIBLES** côté mobile
- ⚠️ **Aucun secret** ne doit être mis dans ces variables

## ✅ MESURES DE SÉCURITÉ IMPLÉMENTÉES

### 1. **Validation des IP**

```javascript
// Seules les IP privées (RFC 1918) sont autorisées
- 10.0.0.0/8       (10.x.x.x)
- 172.16.0.0/12    (172.16-31.x.x)
- 192.168.0.0/16   (192.168.x.x)
```

### 2. **Environnement restreint**

```javascript
// Scripts désactivés automatiquement en production
ALLOWED_ENVIRONMENTS: ["development", "dev", "local"];
```

### 3. **CORS sécurisé**

```javascript
// Origines restreintes aux IP privées uniquement
// Rate limiting activé
// Headers de sécurité appliqués
```

### 4. **Debug masqué**

```javascript
// Pas d'IP complètes affichées
// Hash pour identification
// Composants désactivés en production
```

## 🛡️ UTILISATION SÉCURISÉE

### Scripts sécurisés disponibles :

```bash
# Mise à jour sécurisée des .env (IP privées uniquement)
node scripts/secure-update-env.js

# Test de connectivité avec validation
node scripts/test-connection.js

# Variables npm sécurisées
npm run secure-env    # Version sécurisée
npm run test-connection
```

### Validation automatique :

```bash
# Le script vérifie automatiquement :
✅ Environnement = développement
✅ IP dans plage privée
✅ Interface réseau autorisée
✅ Pas de secrets exposés
```

## 🔧 CONFIGURATION PRODUCTION

### 1. **Variables d'environnement production**

```bash
# supchat-server/.env.production
NODE_ENV=production
ALLOWED_ORIGINS=https://votre-domaine.com,https://app.votre-domaine.com
HTTPS_PORT=443
SSL_CERT=/path/to/cert.pem
SSL_KEY=/path/to/key.pem

# ❌ PAS d'IP locale en production
# ❌ PAS de variables VITE_* avec IP
```

### 2. **Client-web production**

```bash
# client-web/.env.production
VITE_BACKEND_URL=https://api.votre-domaine.com
VITE_API_URL=https://api.votre-domaine.com/api
VITE_SOCKET_URL=wss://api.votre-domaine.com

# ✅ HTTPS uniquement
# ✅ Domaines publics sécurisés
```

### 3. **Client-mobile production**

```bash
# client-mobile/.env.production
EXPO_PUBLIC_API_URL=https://api.votre-domaine.com/api
EXPO_PUBLIC_SOCKET_URL=wss://api.votre-domaine.com

# ✅ HTTPS/WSS uniquement
# ✅ Certificats SSL valides
```

## 🚦 CHECKLIST DE SÉCURITÉ

### Avant chaque déploiement :

- [ ] ✅ Variables de développement supprimées
- [ ] ✅ HTTPS configuré et testé
- [ ] ✅ Certificats SSL valides
- [ ] ✅ CORS restreint aux domaines autorisés
- [ ] ✅ Composants de debug désactivés
- [ ] ✅ Logs de production configurés
- [ ] ✅ Firewall et sécurité réseau
- [ ] ✅ Rate limiting activé
- [ ] ✅ Monitoring de sécurité en place

### Audit de sécurité :

```bash
# Vérification automatique des fuites
npm run security-audit

# Scan des secrets exposés
npm run scan-secrets

# Test de pénétration basic
npm run security-test
```

## 🔍 DETECTION DES PROBLÈMES

### Signaux d'alarme :

```bash
❌ IP publique détectée
❌ Variables sensibles en client
❌ HTTP en production
❌ CORS trop permissif
❌ Debug actif en production
❌ Certificats invalides
```

### Monitoring recommandé :

```bash
✅ Logs de connexions suspectes
✅ Tentatives d'accès non autorisées
✅ Utilisation anormale de ressources
✅ Erreurs de certificats SSL
✅ Violations de CORS
```

## 📞 EN CAS DE PROBLÈME

### Incident de sécurité détecté :

1. **Arrêt immédiat** des services exposés
2. **Audit complet** des logs d'accès
3. **Rotation** des secrets et certificats
4. **Mise à jour** des configurations
5. **Test complet** avant redémarrage

### Contacts d'urgence :

- Équipe DevOps : [contact-devops]
- Responsable sécurité : [contact-security]
- Documentation : [lien-wiki-security]

---

## 🎯 RÉSUMÉ EXÉCUTIF

### ✅ **DÉVELOPPEMENT SÉCURISÉ**

- Scripts avec validation IP privée
- Debug masqué et conditionnel
- CORS restreint automatiquement
- Variables d'environnement isolées

### ⚠️ **PRODUCTION OBLIGATOIRE**

- HTTPS uniquement
- Configuration manuelle
- Monitoring de sécurité
- Audit régulier

**🔒 La sécurité est la responsabilité de tous !**
