const User = require('../models/User')

const getIntegrations = async (userId) => {
    const user = await User.findById(userId).select('googleDrive githubToken')
    return {
        googleDrive: !!(
            user &&
            user.googleDrive &&
            user.googleDrive.accessToken
        ),
        github: !!(user && user.githubToken),
    }
}

const setGoogleDrive = async (userId, tokens) => {
    const user = await User.findById(userId)
    if (!user) return null

    // Support pour les formats : { access_token, refresh_token } ou { accessToken, refreshToken }
    user.googleDrive = {
        accessToken: tokens.access_token || tokens.accessToken,
        refreshToken: tokens.refresh_token || tokens.refreshToken,
    }
    await user.save()
    return user
}

const removeGoogleDrive = async (userId) => {
    const userBefore = await User.findById(userId).select('googleDrive')

    const user = await User.findByIdAndUpdate(
        userId,
        { $unset: { googleDrive: 1 } },
        { new: true }
    )

    return user
}

const setGithub = async (userId, token) => {
    const user = await User.findById(userId)
    if (!user) return null
    user.githubToken = token
    await user.save()
    return user
}

const removeGithub = async (userId) => {
    const userBefore = await User.findById(userId).select('githubToken')

    const user = await User.findByIdAndUpdate(
        userId,
        { $unset: { githubToken: 1 } },
        { new: true }
    )

    return user
}

const setGoogleId = async (userId, googleId) => {
    const user = await User.findById(userId)
    if (!user) return null
    user.googleId = googleId
    await user.save()
    return user
}

const removeGoogleId = async (userId) => {
    const user = await User.findById(userId)
    if (!user) return null
    user.googleId = undefined
    await user.save()
    return user
}

const setFacebookId = async (userId, fbId) => {
    const user = await User.findById(userId)
    if (!user) return null
    user.facebookId = fbId
    await user.save()
    return user
}

const removeFacebookId = async (userId) => {
    const user = await User.findById(userId)
    if (!user) return null
    user.facebookId = undefined
    await user.save()
    return user
}

module.exports = {
    getIntegrations,
    setGoogleDrive,
    removeGoogleDrive,
    setGithub,
    removeGithub,
    setGoogleId,
    removeGoogleId,
    setFacebookId,
    removeFacebookId,
}
