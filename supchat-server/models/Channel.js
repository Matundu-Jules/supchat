const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  name: String,
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  type: { type: String, enum: ["public", "private"], required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("Channel", ChannelSchema);
