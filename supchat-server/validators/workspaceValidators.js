const Joi = require('joi')

// Fonction de sanitisation XSS
const sanitizeString = (value, helpers) => {
    if (typeof value !== 'string') return value;
    
    // Remplace les caractères dangereux
    const sanitized = value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    return sanitized;
}

const createWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(50).custom(sanitizeString).required(),
    description: Joi.string().max(500).custom(sanitizeString).allow(''),
    isPublic: Joi.boolean(),
    type: Joi.string().valid('public', 'private'),
})

const updateWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(50).custom(sanitizeString),
    description: Joi.string().max(500).custom(sanitizeString).allow(''),
    isPublic: Joi.boolean(),
}).min(1)

const inviteToWorkspaceSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid('membre', 'admin', 'moderateur').optional(),
})

const joinWorkspaceSchema = Joi.object({
    inviteCode: Joi.string().required(),
})

const requestJoinWorkspaceSchema = Joi.object({
    message: Joi.string().max(500).allow(''),
})

const workspaceIdParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
})

const requestUserIdParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
    requestUserId: Joi.string().hex().length(24).required(),
})

const removeMemberParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
    userId: Joi.string().hex().length(24).required(),
})

module.exports = {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteToWorkspaceSchema,
    joinWorkspaceSchema,
    requestJoinWorkspaceSchema,
    workspaceIdParamSchema,
    requestUserIdParamSchema,
    removeMemberParamSchema,
}
