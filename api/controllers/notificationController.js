const Notification = require('../models/Notification')
const User = require('../models/User')

exports.getNotifications = async (req, res) => {
    try {
        const { unread } = req.query
        const filter = { userId: req.user.id }

        if (unread === 'true') {
            filter.read = false
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .populate('messageId')
            .populate('workspaceId', 'name')
            .populate('channelId', 'name')
        res.status(200).json({ notifications })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params

        // D'abord vérifier si la notification existe
        const notification = await Notification.findById(id)

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' })
        }

        // Vérifier si la notification appartient à l'utilisateur connecté
        if (String(notification.userId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Accès refusé' })
        }

        notification.read = true
        await notification.save()

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

        // Créer un objet de préférences par défaut
        const defaultPreferences = {
            mentions: true,
            directMessages: true,
            channelMessages: true,
            emailNotifications: true,
            pushNotifications: true,
        }

        // Si l'utilisateur a des préférences personnalisées, les utiliser
        let preferences = defaultPreferences
        if (
            user.notificationPrefs &&
            typeof user.notificationPrefs === 'object' &&
            !Array.isArray(user.notificationPrefs)
        ) {
            preferences = { ...defaultPreferences, ...user.notificationPrefs }
        }

        res.status(200).json({ preferences })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { preferences } = req.body

        // Stocker les préférences comme un objet simple plutôt qu'un tableau
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    notificationPrefs: preferences,
                },
            },
            { new: true }
        ).select('notificationPrefs')

        res.status(200).json({ preferences: user.notificationPrefs })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updateChannelNotificationSettings = async (req, res) => {
    try {
        const { id: channelId } = req.params
        const { enabled, allMessages, mentions } = req.body

        // Déterminer le mode basé sur les paramètres
        let mode = 'mute'
        if (enabled) {
            if (allMessages) {
                mode = 'all'
            } else if (mentions) {
                mode = 'mentions'
            }
        }

        // Mettre à jour ou créer la préférence pour ce channel
        const user = await User.findById(req.user.id)

        if (!user.channelNotificationPrefs) {
            user.channelNotificationPrefs = []
        }

        const existingPrefIndex = user.channelNotificationPrefs.findIndex(
            (pref) => String(pref.channelId) === String(channelId)
        )

        if (existingPrefIndex >= 0) {
            user.channelNotificationPrefs[existingPrefIndex].mode = mode
        } else {
            user.channelNotificationPrefs.push({ channelId, mode })
        }

        await user.save()

        // Retourner les paramètres sous le format attendu par les tests
        const settings = {
            enabled,
            allMessages: allMessages || false,
            mentions: mentions || false,
        }

        res.status(200).json({
            message: 'Paramètres de notification mis à jour',
            settings,
        })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
