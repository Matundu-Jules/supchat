const mongoose = require('mongoose')

const WorkspaceSchema = new mongoose.Schema({
    name: String,
    description: String,
    isPublic: { type: Boolean, default: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    invitations: [{ type: String }],
    joinRequests: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            requestedAt: { type: Date, default: Date.now },
            message: { type: String, default: '' },
        },
    ],
})

module.exports = mongoose.model('Workspace', WorkspaceSchema)
