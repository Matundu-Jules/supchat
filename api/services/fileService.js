const fs = require('fs')
const path = require('path')

/**
 * Service de gestion des fichiers uploadés
 */
class FileService {
    /**
     * Supprime un fichier de manière sécurisée
     * @param {string} filePath - Chemin relatif du fichier (ex: "/uploads/123-avatar.jpg")
     * @returns {boolean} - True si supprimé avec succès, false sinon
     */
    static deleteFile(filePath) {
        try {
            // Vérifier que le chemin est valide et dans le dossier uploads
            if (!filePath || typeof filePath !== 'string') {
                console.warn(
                    'FileService.deleteFile: Chemin invalide',
                    filePath
                )
                return false
            }

            // Extraire le nom du fichier depuis l'URL relative
            let filename = filePath
            if (filePath.startsWith('/uploads/')) {
                filename = filePath.replace('/uploads/', '')
            }

            // Construire le chemin absolu sécurisé
            const uploadsDir = path.join(__dirname, '../uploads')
            const absolutePath = path.resolve(uploadsDir, filename)

            // Vérification de sécurité : s'assurer que le fichier est dans uploads/
            if (!absolutePath.startsWith(uploadsDir)) {
                console.warn(
                    "FileService.deleteFile: Tentative d'accès en dehors du dossier uploads",
                    absolutePath
                )
                return false
            }

            // Vérifier que le fichier existe
            if (!fs.existsSync(absolutePath)) {
                console.info(
                    'FileService.deleteFile: Fichier inexistant',
                    absolutePath
                )
                return false
            }

            // Supprimer le fichier
            fs.unlinkSync(absolutePath)
            console.info(
                'FileService.deleteFile: Fichier supprimé avec succès',
                filename
            )
            return true
        } catch (error) {
            console.error(
                'FileService.deleteFile: Erreur lors de la suppression',
                error.message
            )
            return false
        }
    }

    /**
     * Supprime l'ancien avatar d'un utilisateur
     * @param {string} oldAvatarPath - Ancien chemin de l'avatar
     * @returns {boolean} - True si supprimé avec succès, false sinon
     */
    static deleteOldAvatar(oldAvatarPath) {
        // Ne pas supprimer si pas d'ancien avatar ou si c'est l'avatar par défaut
        if (
            !oldAvatarPath ||
            oldAvatarPath === '' ||
            oldAvatarPath === '/uploads/default-avatar.png'
        ) {
            return false
        }

        return this.deleteFile(oldAvatarPath)
    }

    /**
     * Nettoie les anciens fichiers d'avatars orphelins (optionnel, pour maintenance)
     * @param {number} daysOld - Nombre de jours pour considérer un fichier comme ancien
     * @returns {number} - Nombre de fichiers supprimés
     */
    static cleanupOldFiles(daysOld = 30) {
        try {
            const uploadsDir = path.join(__dirname, '../uploads')
            const files = fs.readdirSync(uploadsDir)
            let deletedCount = 0
            const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000

            files.forEach((file) => {
                const filePath = path.join(uploadsDir, file)
                const stats = fs.statSync(filePath)

                // Supprimer si le fichier est ancien et n'est pas un avatar par défaut
                if (
                    stats.mtime.getTime() < cutoffDate &&
                    !file.startsWith('default-')
                ) {
                    try {
                        fs.unlinkSync(filePath)
                        deletedCount++
                        console.info(
                            `FileService.cleanupOldFiles: Fichier ancien supprimé: ${file}`
                        )
                    } catch (error) {
                        console.error(
                            `FileService.cleanupOldFiles: Erreur suppression ${file}:`,
                            error.message
                        )
                    }
                }
            })

            console.info(
                `FileService.cleanupOldFiles: ${deletedCount} fichiers anciens supprimés`
            )
            return deletedCount
        } catch (error) {
            console.error(
                'FileService.cleanupOldFiles: Erreur lors du nettoyage',
                error.message
            )
            return 0
        }
    }

    /**
     * Valide qu'un fichier uploadé est une image valide
     * @param {Object} file - Objet file de Multer
     * @returns {boolean} - True si valide
     */
    static isValidImageFile(file) {
        if (!file) return false

        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ]

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        const fileExtension = path.extname(file.originalname).toLowerCase()

        return (
            allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(fileExtension)
        )
    }
}

module.exports = FileService
