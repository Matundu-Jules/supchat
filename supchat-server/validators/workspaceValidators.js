const Joi = require('joi')

const createWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(500).allow(''),
    isPublic: Joi.boolean(),
})

const updateWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(500).allow(''),
    isPublic: Joi.boolean(),
}).min(1)

const inviteToWorkspaceSchema = Joi.object({
    email: Joi.string().email().required(),
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

module.exports = {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteToWorkspaceSchema,
    joinWorkspaceSchema,
    requestJoinWorkspaceSchema,
    workspaceIdParamSchema,
    requestUserIdParamSchema,
}
