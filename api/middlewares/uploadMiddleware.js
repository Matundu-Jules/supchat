const multer = require('multer')
const path = require('path')
const FileService = require('../services/fileService')

/**
 * Middleware de gestion d'erreurs Multer
 * Gère les erreurs communes de Multer et nettoie les fichiers en cas d'erreur
 */
const handleMulterError = (error, req, res, next) => {
    // Si ce n'est pas une erreur Multer, passer au middleware suivant
    if (
        !(error instanceof multer.MulterError) &&
        !error.message.includes('Format de fichier')
    ) {
        return next(error)
    }

    // Nettoyer le fichier uploadé en cas d'erreur
    if (req.file) {
        FileService.deleteFile(`/uploads/${req.file.filename}`)
    }

    // Gestion des erreurs Multer spécifiques
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message:
                        'Fichier trop volumineux. Taille maximum autorisée: 5MB',
                    error: 'FILE_TOO_LARGE',
                })

            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Trop de fichiers. Un seul fichier autorisé.',
                    error: 'TOO_MANY_FILES',
                })

            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Champ de fichier inattendu.',
                    error: 'UNEXPECTED_FILE',
                })

            case 'LIMIT_PART_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Trop de parties dans la requête multipart.',
                    error: 'TOO_MANY_PARTS',
                })

            case 'LIMIT_FIELD_KEY':
                return res.status(400).json({
                    success: false,
                    message: 'Nom de champ trop long.',
                    error: 'FIELD_NAME_TOO_LONG',
                })

            case 'LIMIT_FIELD_VALUE':
                return res.status(400).json({
                    success: false,
                    message: 'Valeur de champ trop longue.',
                    error: 'FIELD_VALUE_TOO_LONG',
                })

            case 'LIMIT_FIELD_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Trop de champs dans la requête.',
                    error: 'TOO_MANY_FIELDS',
                })

            default:
                return res.status(400).json({
                    success: false,
                    message: "Erreur lors de l'upload du fichier.",
                    error: 'UPLOAD_ERROR',
                })
        }
    }

    // Gestion des erreurs de format de fichier
    if (error.message.includes('Format de fichier')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            error: 'INVALID_FILE_TYPE',
        })
    }

    // Autres erreurs
    return res.status(500).json({
        success: false,
        message: "Erreur interne lors de l'upload.",
        error: 'INTERNAL_ERROR',
    })
}

/**
 * Configuration Multer standardisée pour les avatars
 */
const createAvatarUploadConfig = (uploadDir) => {
    const storage = multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            // Générer un nom de fichier unique et sécurisé
            const timestamp = Date.now()
            const random = Math.round(Math.random() * 1e9)
            const userId = req.user?.id || 'unknown'
            const extension = path.extname(file.originalname).toLowerCase()

            // Nettoyer le nom original pour éviter les caractères dangereux
            const safeName = file.originalname
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .substring(0, 50) // Limiter la longueur

            cb(
                null,
                `avatar-${userId}-${timestamp}-${random}-${safeName}${extension}`
            )
        },
    })

    const fileFilter = (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ]

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        const fileExtension = path.extname(file.originalname).toLowerCase()

        if (
            allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(fileExtension)
        ) {
            cb(null, true)
        } else {
            cb(
                new Error(
                    'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.'
                ),
                false
            )
        }
    }

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
            files: 1,
            fields: 10,
            fieldNameSize: 50,
            fieldSize: 1024,
        },
    })
}

module.exports = {
    handleMulterError,
    createAvatarUploadConfig,
}
