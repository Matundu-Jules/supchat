// Test du validateur removeMemberParamSchema
const { removeMemberParamSchema } = require('./validators/workspaceValidators')

console.log('🔍 Test du validateur removeMemberParamSchema...')

// Test avec des paramètres valides
const validParams = {
    id: '684e3447d7cfbb5e452deba8',
    userId: '684ea6535e37e2a82fde8c75',
}

console.log('✅ Test avec paramètres valides:', validParams)
const validResult = removeMemberParamSchema.validate(validParams)
if (validResult.error) {
    console.error('❌ Erreur de validation:', validResult.error.message)
} else {
    console.log('✅ Validation réussie')
}

// Test avec paramètres invalides
const invalidParams = {
    id: 'invalid-id',
    userId: 'invalid-user-id',
}

console.log('\n❌ Test avec paramètres invalides:', invalidParams)
const invalidResult = removeMemberParamSchema.validate(invalidParams)
if (invalidResult.error) {
    console.log(
        '✅ Erreur détectée comme attendu:',
        invalidResult.error.message
    )
} else {
    console.error('❌ La validation devrait échouer mais elle a réussi')
}

console.log('\n🎉 Test du validateur terminé !')
