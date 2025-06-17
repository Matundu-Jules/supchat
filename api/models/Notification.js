const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    type: {
        type: String,
        enum: [
            'mention',
            'message',
            'new_message',
            'workspace_invite',
            'channel_invite',
            'join_request',
            'join_approved',
            'join_rejected',
            'direct_message',
        ],
        required: true,
    },
    title: { type: String }, // Titre de la notification
    message: { type: String }, // Message descriptif de la notification
    data: { type: mongoose.Schema.Types.Mixed }, // Données supplémentaires (workspaceName, etc.)
    read: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Notification', NotificationSchema)
