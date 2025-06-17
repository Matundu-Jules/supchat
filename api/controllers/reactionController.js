const Reaction = require('../models/Reaction')
const Message = require('../models/Message')
const { getIo } = require('../socket')

exports.addReaction = async (req, res) => {
    try {
        const { emoji } = req.body
        const messageId = req.params.id // Récupère l'ID du message depuis les paramètres de route
        if (!messageId || !emoji) {
            return res
                .status(400)
                .json({ message: 'messageId et emoji requis' })
        } // Remplacer la réaction existante si elle existe
        const existing = await Reaction.findOneAndDelete({
            messageId,
            userId: req.user.id,
        })

        const reaction = new Reaction({ messageId, userId: req.user.id, emoji })
        await reaction.save()
        const msg = await Message.findById(messageId)
        if (msg) {
            getIo()
                .to(String(msg.channelId || msg.channel))
                .emit('reactionAdded', reaction)
        }
        return res.status(201).json({ reaction })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

exports.removeReaction = async (req, res) => {
    try {
        const messageId = req.params.id // Récupère l'ID du message depuis les paramètres de route
        const reaction = await Reaction.findOneAndDelete({
            messageId,
            userId: req.user.id,
        })
        if (!reaction) {
            return res.status(404).json({ message: 'Reaction non trouvée' })
        }

        const msg = await Message.findById(messageId)
        if (msg) {
            getIo()
                .to(String(msg.channelId || msg.channel))
                .emit('reactionRemoved', {
                    _id: reaction._id,
                    messageId: messageId,
                })
        }
        res.status(200).json({ message: 'Reaction supprimee' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}

exports.getReactionsByMessage = async (req, res) => {
    try {
        const { messageId } = req.params
        const reactions = await Reaction.find({ messageId })
        res.status(200).json(reactions)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.', error })
    }
}
