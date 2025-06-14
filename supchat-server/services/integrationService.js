const User = require("../models/User")

const getIntegrations = async (userId) => {
  const user = await User.findById(userId).select(
    "googleDrive githubToken"
  )
  return {
    googleDrive: !!(user && user.googleDrive && user.googleDrive.accessToken),
    github: !!(user && user.githubToken),
  }
}

const setGoogleDrive = async (userId, tokens) => {
  const user = await User.findById(userId)
  if (!user) return null
  user.googleDrive = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  }
  await user.save()
  return user
}

const removeGoogleDrive = async (userId) => {
  const user = await User.findById(userId)
  if (!user) return null
  user.googleDrive = undefined
  await user.save()
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
  const user = await User.findById(userId)
  if (!user) return null
  user.githubToken = undefined
  await user.save()
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
