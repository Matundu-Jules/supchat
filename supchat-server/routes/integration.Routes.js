const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const {
    linkGoogleDrive,
    unlinkGoogleDrive,
    linkGithub,
    unlinkGithub,
    listIntegrations,
    linkGoogleAccount,
    unlinkGoogleAccount,
    linkFacebookAccount,
    unlinkFacebookAccount,
} = require('../controllers/integrationController')

const router = express.Router()

router.get('/', authMiddleware, listIntegrations)
router.post('/google-drive', authMiddleware, linkGoogleDrive)
router.delete('/google-drive', authMiddleware, unlinkGoogleDrive)
router.post('/github', authMiddleware, linkGithub)
router.delete('/github', authMiddleware, unlinkGithub)
router.post('/google', authMiddleware, linkGoogleAccount)
router.delete('/google', authMiddleware, unlinkGoogleAccount)
router.post('/facebook', authMiddleware, linkFacebookAccount)
router.delete('/facebook', authMiddleware, unlinkFacebookAccount)

// Route de test pour simuler les intégrations (développement uniquement)
if (process.env.NODE_ENV !== 'production') {
    router.post('/test/google-drive', authMiddleware, async (req, res) => {
        try {
            const fakeTokens = {
                access_token: 'fake_google_drive_token_' + Date.now(),
                refresh_token: 'fake_refresh_token_' + Date.now(),
            }
            const integrationService = require('../services/integrationService')
            await integrationService.setGoogleDrive(req.user.id, fakeTokens)
            res.status(200).json({
                message: 'Google Drive connecté (mode test)',
            })
        } catch (error) {
            res.status(500).json({ message: 'Erreur test Google Drive', error })
        }
    })

    router.post('/test/github', authMiddleware, async (req, res) => {
        try {
            const fakeToken = 'fake_github_token_' + Date.now()
            const integrationService = require('../services/integrationService')
            await integrationService.setGithub(req.user.id, fakeToken)
            res.status(200).json({ message: 'GitHub connecté (mode test)' })
        } catch (error) {
            res.status(500).json({ message: 'Erreur test GitHub', error })
        }
    })
}

module.exports = router
