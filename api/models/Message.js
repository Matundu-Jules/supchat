const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
    {
        text: String,
        content: String,
        type: { type: String, default: 'text' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
        channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
        createdAt: { type: Date, default: Date.now },
        file: String,
        filename: String,
        fileUrl: String, // Ajouté pour compatibilité avec les tests
        fileName: String, // Ajouté pour compatibilité avec les tests
        fileSize: Number, // Ajouté pour compatibilité avec les tests
        mimetype: String,
        mimeType: String, // Ajouté pour compatibilité avec les tests
        size: Number,
        hashtags: [String],
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        edited: { type: Boolean, default: false },
        editedAt: Date,
    },
    { timestamps: true }
)

// Index textuel seulement sur le champ text
MessageSchema.index({ text: 'text' })
// Index simple sur hashtags (pas d'index de texte sur les tableaux)
MessageSchema.index({ hashtags: 1 })
// Index pour les requêtes par canal
MessageSchema.index({ channelId: 1, createdAt: -1 })

// Middleware pour éviter les tableaux vides qui peuvent causer des problèmes avec les index
MessageSchema.pre('save', function (next) {
    if (this.hashtags && this.hashtags.length === 0) {
        this.hashtags = undefined
    }
    next()
})

module.exports = mongoose.model('Message', MessageSchema)
