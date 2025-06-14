const Joi = require('joi')

const updateProfileSchema = Joi.object({
    name: Joi.string().min(1).max(50),
    avatar: Joi.string().uri(),
}).min(1)

const updatePreferencesSchema = Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    status: Joi.string().valid('online', 'away', 'busy', 'offline'),
}).min(1)

module.exports = {
    updateProfileSchema,
    updatePreferencesSchema,
}
