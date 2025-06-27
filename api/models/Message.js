const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
    {
        // 🔧 CORRECTION: Champ unique pour le contenu textuel
        content: { type: String, required: true },
        text: { type: String }, // Garder pour compatibilité descendante - synchronisé avec content

        type: { type: String, default: 'text' },

        // 🔧 CORRECTION: Champs utilisateur unifiés
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Alias pour compatibilité

        // 🔧 CORRECTION: Champs channel unifiés
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel',
            required: true,
        },
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }, // Alias pour compatibilité

        // Fichiers
        file: String,
        filename: String,
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        mimetype: String,
        mimeType: String,
        size: Number,

        // Métadonnées
        hashtags: [String],
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        edited: { type: Boolean, default: false },
        editedAt: Date,

        // Réactions (nouveau champ pour les émojis)
        reactions: [
            {
                emoji: String,
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
)

// Index pour les recherches
MessageSchema.index({ content: 'text' })
MessageSchema.index({ hashtags: 1 })
MessageSchema.index({ channel: 1, createdAt: -1 })
MessageSchema.index({ userId: 1 })

// 🔧 MIDDLEWARE: Synchroniser les champs pour compatibilité
MessageSchema.pre('save', function (next) {
    // Synchroniser content et text
    if (this.content && !this.text) {
        this.text = this.content
    } else if (this.text && !this.content) {
        this.content = this.text
    }

    // Synchroniser userId et sender
    if (this.userId && !this.sender) {
        this.sender = this.userId
    } else if (this.sender && !this.userId) {
        this.userId = this.sender
    }

    // Synchroniser channel et channelId
    if (this.channel && !this.channelId) {
        this.channelId = this.channel
    } else if (this.channelId && !this.channel) {
        this.channel = this.channelId
    }

    // Nettoyer les tableaux vides
    if (this.hashtags && this.hashtags.length === 0) {
        this.hashtags = undefined
    }

    next()
})

module.exports = mongoose.model('Message', MessageSchema)
