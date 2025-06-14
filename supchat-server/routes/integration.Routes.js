const express = require("express")
const { authMiddleware } = require("../middlewares/authMiddleware")
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
} = require("../controllers/integrationController")

const router = express.Router()

router.get("/", authMiddleware, listIntegrations)
router.post("/google-drive", authMiddleware, linkGoogleDrive)
router.delete("/google-drive", authMiddleware, unlinkGoogleDrive)
router.post("/github", authMiddleware, linkGithub)
router.delete("/github", authMiddleware, unlinkGithub)
router.post("/google", authMiddleware, linkGoogleAccount)
router.delete("/google", authMiddleware, unlinkGoogleAccount)
router.post("/facebook", authMiddleware, linkFacebookAccount)
router.delete("/facebook", authMiddleware, unlinkFacebookAccount)

module.exports = router
