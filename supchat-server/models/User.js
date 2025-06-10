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
    googleId: String,
    facebookId: String,
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
})

module.exports = mongoose.model('User', UserSchema)
