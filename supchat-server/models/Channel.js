const mongoose = require('mongoose')

const ChannelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        type: {
            type: String,
            enum: ['public', 'private', 'direct'],
            default: 'public',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        invitations: [{ type: String }],
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    },
    { timestamps: true }
)

ChannelSchema.index({ name: 'text', description: 'text' })
ChannelSchema.index({ workspace: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Channel', ChannelSchema)
