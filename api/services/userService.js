const User = require('../models/User')

const getById = (id) => {
    return User.findById(id).select(
        '-password -resetPasswordToken -resetPasswordExpires'
    )
}

const updateProfile = async (id, updateData) => {
    const user = await User.findById(id)
    if (!user) return null

    // Champs autorisés pour la mise à jour du profil
    const allowedFields = ['name', 'avatar', 'bio', 'status', 'theme']

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            user[field] = updateData[field]
        }
    })

    // Gérer les préférences si elles sont fournies
    if (updateData.preferences) {
        if (updateData.preferences.theme !== undefined) {
            user.theme = updateData.preferences.theme
        }
        // On peut étendre ici pour d'autres préférences
    }

    await user.save()
    return user
}

/**
 * Met à jour l'avatar et retourne l'ancien chemin pour suppression
 * @param {string} id - ID de l'utilisateur
 * @param {string} newAvatarPath - Nouveau chemin de l'avatar
 * @returns {Object} - { user, oldAvatarPath }
 */
const updateAvatar = async (id, newAvatarPath) => {
    const user = await User.findById(id)
    if (!user) return null

    const oldAvatarPath = user.avatar // Sauvegarder l'ancien chemin
    user.avatar = newAvatarPath
    await user.save()

    return {
        user,
        oldAvatarPath,
    }
}

const updatePreferences = async (id, updateData) => {
    const user = await User.findById(id)
    if (!user) return null

    if (updateData.theme !== undefined) user.theme = updateData.theme
    if (updateData.status !== undefined) user.status = updateData.status

    await user.save()
    return user
}

const exportData = async (id) => {
    const user = await User.findById(id).lean()
    if (!user) return null
    delete user.password
    delete user.resetPasswordToken
    delete user.resetPasswordExpires
    return user
}

const updateEmail = async (id, newEmail) => {
    const existing = await User.findOne({ email: newEmail })
    if (existing) return null
    const user = await User.findById(id)
    if (!user) return null
    user.email = newEmail
    await user.save()
    return user
}

module.exports = {
    getById,
    updateProfile,
    updateAvatar,
    updatePreferences,
    exportData,
    updateEmail,
}
