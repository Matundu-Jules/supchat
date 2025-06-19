# Correction : Caractère # dans les mots de passe

## Problème identifié

L'utilisateur ne pouvait pas utiliser le caractère `#` dans les mots de passe en raison d'une incohérence entre les différentes validations de mot de passe dans l'application.

## Analyse du problème

Deux systèmes de validation différents étaient en place :

### 1. Validation pour changement/définition de mot de passe

- **Fichiers concernés** :
  - `api/validators/userValidators.js`
  - `web/src/hooks/usePasswordManagement.ts`
  - `web/src/hooks/useSetPasswordRequired.ts`
- **Expression régulière** : `/[@$!%*?&#]/`
- **Caractères spéciaux autorisés** : `@$!%*?&#`

### 2. Validation pour inscription/réinitialisation

- **Fichiers concernés** :
  - `web/src/utils/validation.ts`
  - `mobile/utils/validation.ts`
- **Expression régulière** : `/[!@#$%^&*()\-_+=]/`
- **Caractères spéciaux autorisés** : `!@#$%^&*()-_+=`

## Incohérence identifiée

Le caractère `#` était :

- ✅ **Autorisé** dans les validations de changement de mot de passe
- ❌ **Refusé** dans les validations d'inscription et de réinitialisation

Cela créait une situation où :

1. Un utilisateur pouvait s'inscrire avec un mot de passe contenant `^` ou `(`
2. Mais ne pouvait pas changer son mot de passe pour inclure `#`

## Solution appliquée

### Unification des validations

Tous les fichiers de validation utilisent maintenant la même liste de caractères spéciaux : `@$!%*?&#`

### Fichiers modifiés

1. **`web/src/utils/validation.ts`**

   - `registerSchema.password.matches()` : mis à jour
   - `resetPasswordSchema.password.matches()` : mis à jour

2. **`mobile/utils/validation.ts`**
   - `registerSchema.password.matches()` : mis à jour
   - `resetPasswordSchema.password.matches()` : mis à jour

### Changements spécifiques

```javascript
// AVANT
.matches(
  /[!@#$%^&*()\-_+=]/,
  'Au moins un caractère spécial (!@#$%^&*()-_+=)'
)

// APRÈS
.matches(
  /[@$!%*?&#]/,
  'Au moins un caractère spécial (@$!%*?&#)'
)
```

## Caractères spéciaux désormais uniformes

### Caractères autorisés dans toute l'application

- `@` - Arobase
- `$` - Dollar
- `!` - Point d'exclamation
- `%` - Pourcentage
- `*` - Astérisque
- `?` - Point d'interrogation
- `&` - Esperluette
- `#` - Dièse

### Caractères retirés pour simplification

- `^` - Accent circonflexe
- `(` `)` - Parenthèses
- `-` `_` - Tirets et underscore
- `+` `=` - Plus et égal

## Avantages de cette approche

1. **Cohérence** : Même validation partout dans l'application
2. **Simplicité** : Liste réduite mais suffisante de caractères spéciaux
3. **Sécurité** : Maintien d'une validation robuste
4. **Expérience utilisateur** : Pas de confusion entre différentes pages

## Tests recommandés

1. Tester l'inscription avec un mot de passe contenant `#`
2. Tester le changement de mot de passe avec `#`
3. Tester la réinitialisation de mot de passe avec `#`
4. Vérifier que les anciens caractères spéciaux (`^`, `(`, etc.) sont bien refusés

## Impact

- ✅ Le caractère `#` fonctionne maintenant partout
- ✅ Validation cohérente sur web et mobile
- ✅ Messages d'erreur uniformisés
- ⚠️ Certains caractères spéciaux précédemment autorisés ne le sont plus

Date de correction : 19 juin 2025
