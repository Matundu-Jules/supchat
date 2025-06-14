const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: {
        type: String,
        enum: ['admin', 'membre', 'invité'],
        default: 'membre',
    },
    password: String,
    avatar: String,
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
    },
    status: {
        type: String,
        enum: ['online', 'away', 'busy', 'offline'],
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
    notificationPrefs: [
        {
            channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
            mode: {
                type: String,
                enum: ['all', 'mentions', 'mute'],
                default: 'all',
            },
        },
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
})

module.exports = mongoose.model('User', UserSchema)
