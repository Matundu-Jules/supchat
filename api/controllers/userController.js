const userService = require('../services/userService')
const FileService = require('../services/fileService')

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getById(req.user.id)
        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body)
        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.getPreferences = async (req, res) => {
    try {
        const user = await userService.getById(req.user.id)
        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json({ theme: user.theme, status: user.status })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.updatePreferences = async (req, res) => {
    try {
        const user = await userService.updatePreferences(req.user.id, req.body)
        if (!user)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json({ theme: user.theme, status: user.status })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.exportUserData = async (req, res) => {
    try {
        const data = await userService.exportData(req.user.id)
        if (!data)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        res.json(data)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

exports.uploadAvatar = async (req, res) => {
    try {
        // Vérifier la présence du fichier
        if (!req.file) {
            return res.status(400).json({ message: 'Fichier manquant' })
        }

        // Valider que c'est une image valide
        if (!FileService.isValidImageFile(req.file)) {
            // Supprimer le fichier uploadé invalide
            FileService.deleteFile(`/uploads/${req.file.filename}`)
            return res.status(400).json({
                message:
                    'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.',
            })
        }

        const newAvatarUrl = `/uploads/${req.file.filename}`

        // Mettre à jour l'avatar et récupérer l'ancien chemin
        const result = await userService.updateAvatar(req.user.id, newAvatarUrl)
        if (!result) {
            // Si erreur, supprimer le nouveau fichier uploadé
            FileService.deleteFile(newAvatarUrl)
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }

        // Supprimer l'ancien avatar s'il existe
        if (result.oldAvatarPath) {
            FileService.deleteOldAvatar(result.oldAvatarPath)
        }

        res.json({
            avatar: result.user.avatar,
            message: 'Avatar mis à jour avec succès',
        })
    } catch (error) {
        console.error('uploadAvatar error:', error)

        // En cas d'erreur, nettoyer le fichier uploadé
        if (req.file) {
            FileService.deleteFile(`/uploads/${req.file.filename}`)
        }

        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

exports.deleteAvatar = async (req, res) => {
    try {
        // Récupérer l'utilisateur pour obtenir l'ancien avatar
        const currentUser = await userService.getById(req.user.id)
        if (!currentUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }

        const oldAvatarPath = currentUser.avatar

        // Mettre à jour l'avatar à vide
        const result = await userService.updateAvatar(req.user.id, '')
        if (!result) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }

        // Supprimer l'ancien fichier avatar s'il existe
        if (oldAvatarPath) {
            FileService.deleteOldAvatar(oldAvatarPath)
        }

        res.json({
            avatar: '',
            message: 'Avatar supprimé avec succès',
        })
    } catch (error) {
        console.error('deleteAvatar error:', error)
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message,
        })
    }
}

exports.updateEmail = async (req, res) => {
    try {
        const user = await userService.updateEmail(req.user.id, req.body.email)
        if (!user)
            return res
                .status(400)
                .json({
                    message: 'Email déjà utilisé ou utilisateur introuvable',
                })
        res.json({ email: user.email })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
