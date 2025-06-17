const User = require('../models/User')

const getById = (id) => {
    return User.findById(id).select(
        '-password -resetPasswordToken -resetPasswordExpires'
    )
}

const updateProfile = async (id, { name, avatar }) => {
    const user = await User.findById(id)
    if (!user) return null
    if (name !== undefined) user.name = name
    if (avatar !== undefined) user.avatar = avatar
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

const updatePreferences = async (id, { theme, status }) => {
    const user = await User.findById(id)
    if (!user) return null
    if (theme !== undefined) user.theme = theme
    if (status !== undefined) user.status = status
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
