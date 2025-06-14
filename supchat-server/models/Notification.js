const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  type: { type: String, enum: ["mention", "message"], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
