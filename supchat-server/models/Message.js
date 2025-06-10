const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  createdAt: { type: Date, default: Date.now },
  file: String,
});

module.exports = mongoose.model("Message", MessageSchema);
