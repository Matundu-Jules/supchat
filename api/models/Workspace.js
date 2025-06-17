const mongoose = require('mongoose')

const WorkspaceSchema = new mongoose.Schema({
    name: String,
    description: String,
    isPublic: { type: Boolean, default: true },
    type: { type: String, enum: ['public', 'private'], default: 'public' },
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

// Middleware pour synchroniser isPublic et type
WorkspaceSchema.pre('save', function (next) {
    if (this.isModified('isPublic') || this.isModified('type')) {
        if (this.type) {
            this.isPublic = this.type === 'public'
        } else if (this.isPublic !== undefined) {
            this.type = this.isPublic ? 'public' : 'private'
        }
    }
    next()
})

module.exports = mongoose.model('Workspace', WorkspaceSchema)
