const Joi = require("joi");

const createChannelSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  workspaceId: Joi.string().hex().length(24).required(),
  description: Joi.string().max(500).allow(""),
  type: Joi.string().valid("public", "private").required()
});

const updateChannelSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(500).allow("")
}).min(1);

const channelIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

module.exports = {
  createChannelSchema,
  updateChannelSchema,
  channelIdParamSchema
};
