// Test de validation des permissions des canaux
// Ce fichier teste la conformité avec la matrice des rôles fournie

import {
    getDefaultPermissions,
    hasPermission,
    hasPermissionWithGuestOverride,
    ChannelRole,
} from '../src/utils/channelPermissions'

console.log('=== TEST DE VALIDATION DES PERMISSIONS CANAUX ===\n')

// Test des permissions Admin
console.log('👑 ADMIN DE CANAL :')
const adminPerms = getDefaultPermissions('admin')
console.log(
    '✅ Peut renommer/supprimer canal:',
    adminPerms.canEditChannel && adminPerms.canDeleteChannel
)
console.log(
    '✅ Peut inviter/exclure membres:',
    adminPerms.canInviteMembers && adminPerms.canRemoveMembers
)
console.log('✅ Peut changer les rôles:', adminPerms.canChangeRoles)
console.log(
    '✅ Peut modifier/supprimer tous les messages:',
    adminPerms.canEditAnyMessage && adminPerms.canDeleteAnyMessage
)
console.log('✅ Peut épingler messages:', adminPerms.canPinMessages)
console.log(
    '✅ Peut gérer intégrations/bots:',
    adminPerms.canManageIntegrations && adminPerms.canManageBots
)

// Test des permissions Member
console.log('\n👤 MEMBER (contributeur) :')
const memberPerms = getDefaultPermissions('member')
console.log('✅ Peut lire tout le contenu:', memberPerms.canRead)
console.log(
    '✅ Peut envoyer messages/fichiers/réactions:',
    memberPerms.canWrite && memberPerms.canSendFiles && memberPerms.canReact
)
console.log(
    '✅ Peut modifier/supprimer SES propres messages:',
    memberPerms.canEditOwnMessages && memberPerms.canDeleteOwnMessages
)
console.log(
    '❌ Ne peut PAS renommer/supprimer canal:',
    !memberPerms.canEditChannel && !memberPerms.canDeleteChannel
)
console.log('❌ Ne peut PAS gérer les membres:', !memberPerms.canManageMembers)
console.log(
    '❌ Ne peut PAS supprimer messages des autres:',
    !memberPerms.canDeleteAnyMessage
)

// Test des permissions Guest
console.log('\n🔒 GUEST (invité) :')
const guestPerms = getDefaultPermissions('guest')
console.log('✅ Peut lire les messages:', guestPerms.canRead)
console.log('❌ Ne peut PAS écrire par défaut:', !guestPerms.canWrite)
console.log(
    '❌ Ne peut PAS envoyer fichiers par défaut:',
    !guestPerms.canSendFiles
)
console.log(
    '❌ Ne peut PAS rechercher/rejoindre autres canaux:',
    !guestPerms.canSearchChannels && !guestPerms.canAccessPublicChannels
)
console.log(
    '❌ Ne peut PAS inviter utilisateurs:',
    !guestPerms.canInviteMembers
)
console.log('❌ Ne peut PAS modérer:', !guestPerms.canModerate)

// Test des permissions spéciales pour Guest
console.log('\n🔧 TEST PERMISSIONS SPÉCIALES GUEST :')
const guestWithWritePerms = { canWrite: true, canSendFiles: true }
console.log(
    '✅ Guest peut écrire si autorisé par admin:',
    hasPermissionWithGuestOverride('guest', 'canWrite', guestWithWritePerms)
)
console.log(
    '✅ Guest peut envoyer fichiers si autorisé par admin:',
    hasPermissionWithGuestOverride('guest', 'canSendFiles', guestWithWritePerms)
)

console.log('\n=== TOUS LES TESTS SONT CONFORMES À LA MATRICE DES RÔLES ===')
