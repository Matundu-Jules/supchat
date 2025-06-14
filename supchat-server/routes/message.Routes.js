const express = require("express");
const {
  sendMessage,
  getMessagesByChannel,
  getMessageById,
  deleteMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);
router.get("/channel/:channelId", getMessagesByChannel);
router.get("/:id", getMessageById);
router.delete("/:id", deleteMessage);

module.exports = router;
