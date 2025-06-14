const Joi = require('joi')

const updateProfileSchema = Joi.object({
    name: Joi.string().min(1).max(50),
    avatar: Joi.string().uri(),
}).min(1)

const updatePreferencesSchema = Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    status: Joi.string().valid('online', 'away', 'busy', 'offline'),
}).min(1)

const updateEmailSchema = Joi.object({
    email: Joi.string().email().required(),
})

module.exports = {
    updateProfileSchema,
    updatePreferencesSchema,
    updateEmailSchema,
}
