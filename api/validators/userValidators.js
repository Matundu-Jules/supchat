const Joi = require('joi')

const updateProfileSchema = Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(500).allow('').optional(),
    status: Joi.string().valid('online', 'busy', 'away', 'offline').optional(),
    theme: Joi.string().valid('light', 'dark').optional(),
    preferences: Joi.object({
        notifications: Joi.boolean().optional(),
        theme: Joi.string().valid('light', 'dark').optional(),
    }).optional(),
}).min(1)

const updatePreferencesSchema = Joi.object({
    theme: Joi.string().valid('light', 'dark').optional(),
    status: Joi.string().valid('online', 'busy', 'away', 'offline').optional(),
}).min(1)

const updateEmailSchema = Joi.object({
    email: Joi.string().email().required(),
})

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().when('$hasPassword', {
        is: true,
        then: Joi.required().messages({
            'any.required': 'Le mot de passe actuel est requis',
        }),
        otherwise: Joi.optional(),
    }),
    oldPassword: Joi.string().when('$hasPassword', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.optional(),
    }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
            'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères',
            'string.pattern.base':
                'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
            'any.required': 'Le nouveau mot de passe est requis',
        }),
})

const setPasswordSchema = Joi.object({
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
            'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères',
            'string.pattern.base':
                'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
            'any.required': 'Le mot de passe est requis',
        }),
})

module.exports = {
    updateProfileSchema,
    updatePreferencesSchema,
    updateEmailSchema,
    changePasswordSchema,
    setPasswordSchema,
}
