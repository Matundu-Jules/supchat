const Notification = require('../models/Notification')
const User = require('../models/User')

exports.getNotifications = async (req, res) => {
    try {
        const { read } = req.query
        const filter = { userId: req.user.id }

        if (read === 'false') {
            filter.read = false
        }

        const notifs = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .populate('messageId')
            .populate('workspaceId', 'name')
            .populate('channelId', 'name')
        res.status(200).json(notifs)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' })
        }

        res.status(200).json({ message: 'Notification lue', notification })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        )
        res.status(200).json({
            message: 'Toutes les notifications marquées comme lues',
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params
        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        })

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' })
        }

        res.status(200).json({ message: 'Notification supprimée' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.getNotificationPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            'notificationPrefs'
        )
        const preferences = {
            mentions: true,
            directMessages: true,
            channelMessages: true,
            emailNotifications: true,
            ...user.notificationPrefs,
        }
        res.status(200).json({ preferences })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { preferences } = req.body
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { notificationPrefs: preferences },
            { new: true }
        ).select('notificationPrefs')

        res.status(200).json({ preferences: user.notificationPrefs })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updateChannelNotificationSettings = async (req, res) => {
    try {
        const { channelId } = req.body
        const { settings } = req.body

        // Ici vous pouvez implémenter la logique pour les paramètres de notification par channel
        // Pour l'instant, on retourne une réponse de base
        res.status(200).json({
            message: 'Paramètres de notification mis à jour',
            settings,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
