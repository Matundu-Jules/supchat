const Message = require('../models/Message')

// Modèles simplifiés pour les tests
const reminders = new Map()
const polls = new Map()

exports.createReminder = async (req, res) => {
    try {
        const {
            message,
            scheduledFor,
            channelId,
            recurring,
            recurringPattern,
        } = req.body

        const reminder = {
            _id: Date.now().toString(),
            message,
            scheduledFor: new Date(scheduledFor),
            channelId,
            recurring: recurring || false,
            recurringPattern,
            active: true,
            userId: req.user.id,
            createdAt: new Date(),
        }

        // Stocker le rappel
        reminders.set(reminder._id, reminder)

        res.status(201).json({ reminder })
    } catch (error) {
        res.status(500).json({ message: 'Failed to create reminder', error })
    }
}

exports.createPoll = async (req, res) => {
    try {
        const { question, options, channelId, allowMultiple, expiresAt } =
            req.body

        const poll = {
            _id: Date.now().toString(),
            question,
            options: options.map((option) => ({
                text: option,
                votes: [],
            })),
            channelId,
            allowMultiple: allowMultiple || false,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdBy: req.user.id,
            createdAt: new Date(),
        }

        // Stocker le sondage
        polls.set(poll._id, poll)

        // Créer un message de sondage
        const message = await Message.create({
            content: `📊 Sondage: ${question}`,
            type: 'poll',
            userId: req.user.id,
            channel: channelId,
            pollId: poll._id,
            createdAt: new Date(),
        })

        res.status(201).json({ poll, message })
    } catch (error) {
        res.status(500).json({ message: 'Failed to create poll', error })
    }
}

exports.votePoll = async (req, res) => {
    try {
        const { id } = req.params
        const { optionIndex } = req.body

        const poll = polls.get(id)
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' })
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ message: 'Invalid option index' })
        }

        // Ajouter le vote
        const userId = req.user.id
        if (!poll.options[optionIndex].votes.includes(userId)) {
            poll.options[optionIndex].votes.push(userId)
        }

        polls.set(id, poll)

        res.status(200).json({ poll })
    } catch (error) {
        res.status(500).json({ message: 'Failed to vote', error })
    }
}

exports.customWebhook = async (req, res) => {
    try {
        const { botId, channelId, message, data } = req.body

        // Créer un message bot
        await Message.create({
            content: message,
            type: 'bot',
            channel: channelId,
            userId: null, // Message système
            botId,
            botData: data,
            createdAt: new Date(),
        })

        res.status(200).json({ message: 'Webhook processed successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to process webhook', error })
    }
}
