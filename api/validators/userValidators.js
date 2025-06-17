const Joi = require('joi')

const updateProfileSchema = Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(500).allow('').optional(),
    status: Joi.string()
        .valid('Disponible', 'Occupé', 'Absent', 'Ne pas déranger')
        .optional(),
    theme: Joi.string().valid('light', 'dark').optional(),
    preferences: Joi.object({
        notifications: Joi.boolean().optional(),
        theme: Joi.string().valid('light', 'dark').optional(),
    }).optional(),
}).min(1)

const updatePreferencesSchema = Joi.object({
    theme: Joi.string().valid('light', 'dark').optional(),
    status: Joi.string()
        .valid('Disponible', 'Occupé', 'Absent', 'Ne pas déranger')
        .optional(),
}).min(1)

const updateEmailSchema = Joi.object({
    email: Joi.string().email().required(),
})

module.exports = {
    updateProfileSchema,
    updatePreferencesSchema,
    updateEmailSchema,
}
