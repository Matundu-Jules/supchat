const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  type: {
    type: String,
    enum: ["mention", "message", "workspace_invite", "channel_invite"],
    required: true,
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
