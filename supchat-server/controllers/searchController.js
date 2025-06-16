const Message = require('../models/Message')
const Channel = require('../models/Channel')
const FileMeta = require('../models/FileMeta')
const User = require('../models/User')

exports.search = async (req, res) => {
    try {
        const keywords = req.query.q
        if (!keywords || keywords.trim() === '') {
            return res.status(400).json({ message: 'Paramètre q requis' })
        }

        const query = { $text: { $search: keywords } }
        const projection = { score: { $meta: 'textScore' } }

        const [messages, channels, files, users] = await Promise.all([
            Message.find(query, projection)
                .sort({ score: { $meta: 'textScore' } })
                .limit(20),
            Channel.find(query, projection)
                .sort({ score: { $meta: 'textScore' } })
                .limit(20),
            FileMeta.find(query, projection)
                .sort({ score: { $meta: 'textScore' } })
                .limit(20),
            User.find({
                $or: [
                    { name: { $regex: keywords, $options: 'i' } },
                    { username: { $regex: keywords, $options: 'i' } },
                    { email: { $regex: keywords, $options: 'i' } },
                ],
            })
                .select('name username email')
                .limit(20),
        ])

        res.json({ messages, channels, files, users })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.searchMessages = async (req, res) => {
    try {
        const { q: keywords, workspace } = req.query
        if (!keywords || keywords.trim() === '') {
            return res.status(400).json({ message: 'Paramètre q requis' })
        }

        const query = {
            $text: { $search: keywords },
        }

        if (workspace) {
            // Trouver les channels de ce workspace puis chercher les messages
            const channels = await Channel.find({ workspace }).select('_id')
            const channelIds = channels.map((c) => c._id)
            query.channelId = { $in: channelIds }
        }

        const projection = { score: { $meta: 'textScore' } }

        const messages = await Message.find(query, projection)
            .sort({ score: { $meta: 'textScore' } })
            .populate('userId', 'name username')
            .populate('channelId', 'name')
            .limit(50)

        res.json({ messages })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
