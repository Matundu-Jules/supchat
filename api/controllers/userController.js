const userService = require('../services/userService')
const FileService = require('../services/fileService')

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getById(req.user.id)
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
            })

        res.json({
            success: true,
            data: user,
            message: 'Profil récupéré avec succès',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message,
            timestamp: new Date().toISOString(),
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        // Filtrer les valeurs null et undefined pour éviter les erreurs de validation
        const updateData = {}
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== null && req.body[key] !== undefined) {
                updateData[key] = req.body[key]
            }
        })

        const user = await userService.updateProfile(req.user.id, updateData)
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
            })

        res.json({
            success: true,
            data: user,
            message: 'Profil mis à jour avec succès',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message,
            timestamp: new Date().toISOString(),
        })
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
        // Filtrer les valeurs null et undefined pour éviter les erreurs de validation
        const updateData = {}
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== null && req.body[key] !== undefined) {
                updateData[key] = req.body[key]
            }
        })

        const user = await userService.updatePreferences(
            req.user.id,
            updateData
        )
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
            })

        res.json({
            success: true,
            data: {
                theme: user.theme,
                status: user.status,
            },
            message: 'Préférences mises à jour avec succès',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message,
            timestamp: new Date().toISOString(),
        })
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
            return res.status(400).json({
                success: false,
                message: 'Fichier manquant',
                timestamp: new Date().toISOString(),
            })
        }

        // Valider que c'est une image valide
        if (!FileService.isValidImageFile(req.file)) {
            // Supprimer le fichier uploadé invalide
            FileService.deleteFile(`/uploads/${req.file.filename}`)
            return res.status(400).json({
                success: false,
                message:
                    'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.',
                timestamp: new Date().toISOString(),
            })
        }
        const newAvatarUrl = `/uploads/${req.file.filename}`

        // Mettre à jour l'avatar et récupérer l'ancien chemin
        const result = await userService.updateAvatar(req.user.id, newAvatarUrl)
        if (!result) {
            // Si erreur, supprimer le nouveau fichier uploadé
            FileService.deleteFile(newAvatarUrl)
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
                timestamp: new Date().toISOString(),
            })
        }

        // Supprimer l'ancien avatar s'il existe
        if (result.oldAvatarPath) {
            FileService.deleteOldAvatar(result.oldAvatarPath)
        }
        res.json({
            success: true,
            data: {
                avatar: result.user.avatar,
            },
            message: 'Avatar mis à jour avec succès',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('uploadAvatar error:', error) // En cas d'erreur, nettoyer le fichier uploadé
        if (req.file) {
            FileService.deleteFile(`/uploads/${req.file.filename}`)
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message,
            timestamp: new Date().toISOString(),
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
            return res.status(400).json({
                message: 'Email déjà utilisé ou utilisateur introuvable',
            })
        res.json({ email: user.email })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}
