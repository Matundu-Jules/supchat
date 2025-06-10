const express = require("express");
const {
  createChannel,
  getChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
} = require("../controllers/channelController");

const router = express.Router();

router.post("/", createChannel);
router.get("/", getChannels);
router.get("/:id", getChannelById);
router.put("/:id", updateChannel);
router.delete("/:id", deleteChannel);

module.exports = router;
