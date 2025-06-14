const prefService = require('../services/notificationPrefService')

exports.getPrefs = async (req, res) => {
    try {
        const prefs = await prefService.getByUser(req.user.id)
        res.json(prefs)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.setPref = async (req, res) => {
    try {
        const { channelId, mode } = req.body
        const prefs = await prefService.setPreference(req.user.id, channelId, mode)
        res.json(prefs)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
