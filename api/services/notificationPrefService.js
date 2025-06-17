const User = require('../models/User')

const getByUser = async (userId) => {
    const user = await User.findById(userId)
        .select('notificationPrefs')
        .populate('notificationPrefs.channelId', 'name')
    return user ? user.notificationPrefs : []
}

const setPreference = async (userId, channelId, mode) => {
    const user = await User.findById(userId)
    if (!user) return null
    const existing = user.notificationPrefs.find(
        (p) => String(p.channelId) === String(channelId)
    )
    if (existing) {
        existing.mode = mode
    } else {
        user.notificationPrefs.push({ channelId, mode })
    }
    await user.save()
    return user.notificationPrefs
}

module.exports = {
    getByUser,
    setPreference,
}
