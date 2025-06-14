const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

ReactionSchema.index({ messageId: 1, userId: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", ReactionSchema);
