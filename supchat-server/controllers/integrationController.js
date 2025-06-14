const { google } = require("googleapis")
const { Octokit } = require("@octokit/rest")
const integrationService = require("../services/integrationService")

const driveScopes = ["https://www.googleapis.com/auth/drive.file"]

const driveClient = new google.auth.OAuth2(
  process.env.GDRIVE_CLIENT_ID,
  process.env.GDRIVE_CLIENT_SECRET,
  process.env.GDRIVE_REDIRECT_URI
)

exports.linkGoogleDrive = async (req, res) => {
  try {
    const { code } = req.body
    const { tokens } = await driveClient.getToken(code)
    await integrationService.setGoogleDrive(req.user.id, tokens)
    res.status(200).json({ message: "Google Drive linked" })
  } catch (error) {
    res.status(500).json({ message: "Failed to link Google Drive", error })
  }
}

exports.unlinkGoogleDrive = async (req, res) => {
  try {
    await integrationService.removeGoogleDrive(req.user.id)
    res.status(200).json({ message: "Google Drive unlinked" })
  } catch (error) {
    res.status(500).json({ message: "Failed to unlink Google Drive", error })
  }
}

exports.linkGithub = async (req, res) => {
  try {
    const { token } = req.body
    const octokit = new Octokit({ auth: token })
    await octokit.request("GET /user")
    await integrationService.setGithub(req.user.id, token)
    res.status(200).json({ message: "GitHub linked" })
  } catch (error) {
    res.status(500).json({ message: "Failed to link GitHub", error })
  }
}

exports.unlinkGithub = async (req, res) => {
  try {
    await integrationService.removeGithub(req.user.id)
    res.status(200).json({ message: "GitHub unlinked" })
  } catch (error) {
    res.status(500).json({ message: "Failed to unlink GitHub", error })
  }
}

exports.linkGoogleAccount = async (req, res) => {
  try {
    const { googleId } = req.body
    await integrationService.setGoogleId(req.user.id, googleId)
    res.status(200).json({ message: 'Google account linked' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to link Google account', error })
  }
}

exports.unlinkGoogleAccount = async (req, res) => {
  try {
    await integrationService.removeGoogleId(req.user.id)
    res.status(200).json({ message: 'Google account unlinked' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink Google account', error })
  }
}

exports.linkFacebookAccount = async (req, res) => {
  try {
    const { facebookId } = req.body
    await integrationService.setFacebookId(req.user.id, facebookId)
    res.status(200).json({ message: 'Facebook account linked' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to link Facebook account', error })
  }
}

exports.unlinkFacebookAccount = async (req, res) => {
  try {
    await integrationService.removeFacebookId(req.user.id)
    res.status(200).json({ message: 'Facebook account unlinked' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink Facebook account', error })
  }
}

exports.listIntegrations = async (req, res) => {
  try {
    const integrations = await integrationService.getIntegrations(req.user.id)
    res.json(integrations)
  } catch (error) {
    res.status(500).json({ message: "Failed to load integrations", error })
  }
}
