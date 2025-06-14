const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text: String,
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  createdAt: { type: Date, default: Date.now },
  file: String,
});

MessageSchema.index({ text: "text", content: "text" });

module.exports = mongoose.model("Message", MessageSchema);
