const express = require("express")
const { authMiddleware } = require("../middlewares/authMiddleware")
const {
  linkGoogleDrive,
  unlinkGoogleDrive,
  linkGithub,
  unlinkGithub,
  listIntegrations,
} = require("../controllers/integrationController")

const router = express.Router()

router.get("/", authMiddleware, listIntegrations)
router.post("/google-drive", authMiddleware, linkGoogleDrive)
router.delete("/google-drive", authMiddleware, unlinkGoogleDrive)
router.post("/github", authMiddleware, linkGithub)
router.delete("/github", authMiddleware, unlinkGithub)

module.exports = router
