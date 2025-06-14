const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  sendMessage,
  getMessagesByChannel,
  getMessageById,
  deleteMessage,
} = require("../controllers/messageController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const uploadDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), sendMessage);
router.get("/channel/:channelId", authMiddleware, getMessagesByChannel);
router.get("/:id", authMiddleware, getMessageById);
router.delete("/:id", authMiddleware, deleteMessage);

module.exports = router;
