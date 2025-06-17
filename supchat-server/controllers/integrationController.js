const { google } = require('googleapis')
const { Octokit } = require('@octokit/rest')
const integrationService = require('../services/integrationService')

const driveScopes = ['https://www.googleapis.com/auth/drive.file']

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
        res.status(200).json({ message: 'Google Drive linked' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to link Google Drive', error })
    }
}

exports.unlinkGoogleDrive = async (req, res) => {
    try {
        await integrationService.removeGoogleDrive(req.user.id)
        res.status(200).json({ message: 'Google Drive unlinked' })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to unlink Google Drive',
            error,
        })
    }
}

exports.linkGithub = async (req, res) => {
    try {
        const { token } = req.body
        const octokit = new Octokit({ auth: token })
        await octokit.request('GET /user')
        await integrationService.setGithub(req.user.id, token)
        res.status(200).json({ message: 'GitHub linked' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to link GitHub', error })
    }
}

exports.unlinkGithub = async (req, res) => {
    try {
        await integrationService.removeGithub(req.user.id)
        res.status(200).json({ message: 'GitHub unlinked' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to unlink GitHub', error })
    }
}

exports.linkGoogleAccount = async (req, res) => {
    try {
        const { googleId } = req.body
        await integrationService.setGoogleId(req.user.id, googleId)
        res.status(200).json({ message: 'Google account linked' })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to link Google account',
            error,
        })
    }
}

exports.unlinkGoogleAccount = async (req, res) => {
    try {
        await integrationService.removeGoogleId(req.user.id)
        res.status(200).json({ message: 'Google account unlinked' })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to unlink Google account',
            error,
        })
    }
}

exports.linkFacebookAccount = async (req, res) => {
    try {
        const { facebookId } = req.body
        await integrationService.setFacebookId(req.user.id, facebookId)
        res.status(200).json({ message: 'Facebook account linked' })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to link Facebook account',
            error,
        })
    }
}

exports.unlinkFacebookAccount = async (req, res) => {
    try {
        await integrationService.removeFacebookId(req.user.id)
        res.status(200).json({ message: 'Facebook account unlinked' })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to unlink Facebook account',
            error,
        })
    }
}

exports.listIntegrations = async (req, res) => {
    try {
        // Retourner la liste des intégrations disponibles avec leur statut
        const integrations = [
            { type: 'google-drive', name: 'Google Drive', connected: false },
            { type: 'github', name: 'GitHub', connected: false },
            {
                type: 'microsoft-teams',
                name: 'Microsoft Teams',
                connected: false,
            },
        ]

        res.json({ integrations })
    } catch (error) {
        res.status(500).json({ message: 'Failed to load integrations', error })
    }
}

exports.connectGoogleDrive = async (req, res) => {
    try {
        const { authCode, workspaceId } = req.body

        // Simuler la connexion Google Drive
        const integration = {
            _id: Date.now().toString(),
            type: 'google-drive',
            connected: true,
            userId: req.user.id,
            workspaceId,
            createdAt: new Date(),
        }

        res.status(200).json({ integration })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to connect Google Drive',
            error,
        })
    }
}

exports.shareGoogleDriveFile = async (req, res) => {
    try {
        const { fileId, fileName, channelId } = req.body
        const Message = require('../models/Message')

        // Créer un message de partage de fichier
        const message = await Message.create({
            content: `Fichier partagé depuis Google Drive: ${fileName}`,
            type: 'file_share',
            userId: req.user.id,
            channel: channelId,
            fileName,
            fileUrl: `https://drive.google.com/file/d/${fileId}`,
            createdAt: new Date(),
        })

        res.status(201).json({ message })
    } catch (error) {
        res.status(500).json({ message: 'Failed to share file', error })
    }
}

exports.connectGithub = async (req, res) => {
    try {
        const { repositoryUrl, accessToken, workspaceId, channelId } = req.body

        // Simuler la connexion GitHub
        const integration = {
            _id: Date.now().toString(),
            type: 'github',
            connected: true,
            userId: req.user.id,
            workspaceId,
            channelId,
            repositoryUrl,
            createdAt: new Date(),
        }

        res.status(200).json({ integration })
    } catch (error) {
        res.status(500).json({ message: 'Failed to connect GitHub', error })
    }
}

exports.githubWebhook = async (req, res) => {
    try {
        const { action, repository, commits } = req.body
        const Message = require('../models/Message')
        const Channel = require('../models/Channel')

        if (action === 'push' && commits && commits.length > 0) {
            // Trouver un channel par défaut pour les notifications GitHub
            const channel = await Channel.findOne().limit(1)

            if (channel) {
                // Créer un message d'intégration
                await Message.create({
                    content: `🔄 Push sur ${repository.name}: ${commits[0].message}`,
                    type: 'integration',
                    channel: channel._id,
                    userId: null, // Message système
                    createdAt: new Date(),
                })
            }
        }

        res.status(200).json({ message: 'Webhook processed' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to process webhook', error })
    }
}

exports.connectTeams = async (req, res) => {
    try {
        const { tenantId, accessToken, workspaceId } = req.body

        // Simuler la connexion Microsoft Teams
        const integration = {
            _id: Date.now().toString(),
            type: 'microsoft-teams',
            connected: true,
            userId: req.user.id,
            workspaceId,
            tenantId,
            createdAt: new Date(),
        }

        res.status(200).json({ integration })
    } catch (error) {
        res.status(500).json({ message: 'Failed to connect Teams', error })
    }
}

exports.deleteIntegration = async (req, res) => {
    try {
        const { id } = req.params

        // Simuler la suppression
        res.status(200).json({ message: 'Integration supprimée avec succès' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete integration', error })
    }
}
