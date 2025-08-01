const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        role: {
            type: String,
            enum: ['admin', 'membre', 'invité'],
            default: 'membre',
        },
        password: String,
        hasPassword: { type: Boolean, default: false }, // Indique si l'utilisateur a défini un mot de passe
        avatar: String,
        bio: String,
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        status: {
            type: String,
            enum: ['online', 'busy', 'away', 'offline'],
            default: 'online',
        },
        googleId: String,
        facebookId: String,
        googleDrive: {
            accessToken: String,
            refreshToken: String,
        },
        githubToken: String,
        tokenVersion: { type: Number, default: 0 },
        notificationPrefs: {
            type: mongoose.Schema.Types.Mixed,
            default: {
                mentions: true,
                directMessages: true,
                channelMessages: true,
                emailNotifications: true,
                pushNotifications: true,
            },
        },
        channelNotificationPrefs: [
            {
                channelId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Channel',
                },
                mode: {
                    type: String,
                    enum: ['all', 'mentions', 'mute'],
                    default: 'all',
                },
            },
        ],
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
