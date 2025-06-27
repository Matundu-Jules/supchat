const mongoose = require('mongoose')

const ChannelInvitationSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    invitedAt: {
        type: Date,
        default: Date.now,
    },
    respondedAt: {
        type: Date,
    },
})

module.exports = mongoose.model('ChannelInvitation', ChannelInvitationSchema)
