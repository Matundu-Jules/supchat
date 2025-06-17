const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  addReaction,
  removeReaction,
  getReactionsByMessage,
} = require("../controllers/reactionController");

const router = express.Router();

router.post("/", authMiddleware, addReaction);
router.get("/:messageId", authMiddleware, getReactionsByMessage);
router.delete("/:id", authMiddleware, removeReaction);

module.exports = router;
