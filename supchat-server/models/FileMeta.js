const mongoose = require("mongoose");

const FileMetaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  mimetype: String,
  size: Number,
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

FileMetaSchema.index({ filename: "text", originalName: "text" });

module.exports = mongoose.model("FileMeta", FileMetaSchema);
