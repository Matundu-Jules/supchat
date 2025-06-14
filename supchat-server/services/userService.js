const User = require('../models/User')

const getById = (id) => {
    return User.findById(id).select('-password -resetPasswordToken -resetPasswordExpires')
}

const updateProfile = async (id, { name, avatar }) => {
    const user = await User.findById(id)
    if (!user) return null
    if (name !== undefined) user.name = name
    if (avatar !== undefined) user.avatar = avatar
    await user.save()
    return user
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

module.exports = {
    getById,
    updateProfile,
    updatePreferences,
    exportData,
}
