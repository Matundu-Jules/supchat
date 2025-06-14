const userService = require('../services/userService')

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getById(req.user.id)
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body)
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.getPreferences = async (req, res) => {
    try {
        const user = await userService.getById(req.user.id)
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json({ theme: user.theme, status: user.status })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updatePreferences = async (req, res) => {
    try {
        const user = await userService.updatePreferences(req.user.id, req.body)
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json({ theme: user.theme, status: user.status })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.exportUserData = async (req, res) => {
    try {
        const data = await userService.exportData(req.user.id)
        if (!data) return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json(data)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
