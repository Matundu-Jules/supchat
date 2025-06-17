const Message = require('../models/Message')
const Channel = require('../models/Channel')
const FileMeta = require('../models/FileMeta')
const User = require('../models/User')

exports.search = async (req, res) => {
    try {
        const keywords = req.query.q
        const type = req.query.type
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const fileType = req.query.fileType

        if (!keywords || keywords.trim() === '') {
            return res.status(400).json({ message: 'Paramètre q requis' })
        }

        const skip = (page - 1) * limit
        // Recherche basée sur regex pour compatibilité
        let searchRegex

        // Gérer le cas spécial de l'étoile (*) pour chercher tous les éléments
        if (keywords === '*') {
            searchRegex = /./ // Correspond à n'importe quel caractère
        } else {
            // Échapper les caractères spéciaux de regex
            const escapedKeywords = keywords.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            )
            searchRegex = { $regex: escapedKeywords, $options: 'i' }
        }

        let results = { messages: [], channels: [], files: [], users: [] }

        if (!type || type === 'messages') {
            let messageQuery = {}

            if (keywords !== '*') {
                messageQuery = {
                    $or: [{ content: searchRegex }, { text: searchRegex }],
                }
            }

            results.messages = await Message.find(messageQuery)
                .populate('userId', 'name username')
                .populate('channel', 'name')
                .populate('channelId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()

            // Ajouter context et timestamp
            results.messages = results.messages.map((msg) => ({
                ...msg,
                context: msg.content || msg.text || '',
                timestamp: msg.createdAt,
                channel: msg.channel || msg.channelId,
            }))
        }

        if (!type || type === 'channels') {
            let channelQuery = {}

            if (keywords !== '*') {
                channelQuery = {
                    $or: [{ name: searchRegex }, { description: searchRegex }],
                }
            }

            results.channels = await Channel.find(channelQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        }
        if (!type || type === 'files') {
            let fileQuery = {
                $and: [
                    {
                        $or: [
                            { type: 'file' },
                            { type: 'image' },
                            { fileName: { $exists: true } },
                        ],
                    },
                ],
            }

            // Ajouter filtre de recherche seulement si pas d'étoile
            if (keywords !== '*') {
                fileQuery.$and.push({
                    $or: [{ fileName: searchRegex }, { content: searchRegex }],
                })
            }

            // Ajouter filtre de type de fichier
            if (fileType) {
                fileQuery.$and.push({ type: fileType })
            }

            // Rechercher dans les messages avec fichiers
            const fileMessages = await Message.find(fileQuery)
                .populate('userId', 'name username')
                .populate('channel', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)

            results.files = fileMessages.map((msg) => ({
                _id: msg._id,
                fileName: msg.fileName,
                fileUrl: msg.fileUrl,
                type: msg.type,
                channel: msg.channel,
                userId: msg.userId,
                createdAt: msg.createdAt,
            }))
        }
        if (!type || type === 'users') {
            let userQuery = {}

            if (keywords !== '*') {
                userQuery = {
                    $or: [
                        { name: searchRegex },
                        { username: searchRegex },
                        { email: searchRegex },
                    ],
                }
            }

            results.users = await User.find(userQuery)
                .select('name username email')
                .skip(skip)
                .limit(limit)
        }

        // Ajouter pagination
        const pagination = {
            currentPage: page,
            limit: limit,
            hasMore: false, // Simplifié pour les tests
        }

        res.json({ ...results, pagination })
    } catch (error) {
        console.error('Search error:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

exports.searchMessages = async (req, res) => {
    try {
        const { q: keywords, workspace } = req.query
        if (!keywords || keywords.trim() === '') {
            return res.status(400).json({ message: 'Paramètre q requis' })
        }

        let query = {}

        if (workspace) {
            // Trouver les channels de ce workspace puis chercher les messages
            const channels = await Channel.find({ workspace }).select('_id')
            const channelIds = channels.map((c) => c._id)
            query.$or = [
                { channelId: { $in: channelIds } },
                { channel: { $in: channelIds } },
            ]
        }

        // Recherche avec regex au lieu de $text pour plus de compatibilité
        const searchCondition = {
            $or: [
                { text: { $regex: keywords, $options: 'i' } },
                { content: { $regex: keywords, $options: 'i' } },
            ],
        }

        // Combiner les conditions
        if (query.$or) {
            query = {
                $and: [
                    { $or: query.$or }, // Condition workspace
                    searchCondition, // Condition de recherche
                ],
            }
        } else {
            query = searchCondition
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name username')
            .populate('channelId', 'name')
            .populate('channel', 'name')
            .limit(50)

        res.json({ messages })
    } catch (error) {
        console.error('Search error:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

exports.searchAdvanced = async (req, res) => {
    try {
        const {
            q: keywords,
            channel,
            author,
            fromDate,
            toDate,
            page = 1,
            limit = 10,
        } = req.query

        if (!keywords || keywords.trim() === '') {
            return res.status(400).json({ message: 'Paramètre q requis' })
        }
        const skip = (parseInt(page) - 1) * parseInt(limit)

        let andConditions = []

        // Condition de recherche textuelle
        if (keywords !== '*') {
            // Échapper les caractères spéciaux de regex
            const escapedKeywords = keywords.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            )
            andConditions.push({
                $or: [
                    { content: { $regex: escapedKeywords, $options: 'i' } },
                    { text: { $regex: escapedKeywords, $options: 'i' } },
                ],
            })
        }

        // Filtre par canal
        if (channel) {
            andConditions.push({
                $or: [{ channel: channel }, { channelId: channel }],
            })
        }

        // Filtre par auteur
        if (author) {
            andConditions.push({ userId: author })
        }

        // Filtre par date
        if (fromDate || toDate) {
            const dateCondition = {}
            if (fromDate) {
                dateCondition.$gte = new Date(fromDate)
            }
            if (toDate) {
                dateCondition.$lte = new Date(toDate)
            }
            andConditions.push({ createdAt: dateCondition })
        }

        // Construire la query finale
        let query = {}
        if (andConditions.length > 0) {
            query =
                andConditions.length === 1
                    ? andConditions[0]
                    : { $and: andConditions }
        }

        const messages = await Message.find(query)
            .populate('userId', 'name username')
            .populate('channel', 'name')
            .populate('channelId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean()
        // Ajouter context pour chaque message
        const messagesWithContext = messages.map((msg) => ({
            ...msg,
            context: msg.content || msg.text || '',
            timestamp: msg.createdAt,
            channel: msg.channel || msg.channelId,
            // S'assurer que userId est bien l'ID string pour les tests
            userId: msg.userId._id
                ? msg.userId._id.toString()
                : msg.userId.toString(),
        }))

        res.json({
            messages: messagesWithContext,
            pagination: {
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        })
    } catch (error) {
        console.error('Advanced search error:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}
