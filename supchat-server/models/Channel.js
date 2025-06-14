const mongoose = require('mongoose')

const ChannelSchema = new mongoose.Schema({
    name: String,
    description: String,
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    type: { type: String, enum: ['public', 'private'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invitations: [{ type: String }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
})

ChannelSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Channel', ChannelSchema)
