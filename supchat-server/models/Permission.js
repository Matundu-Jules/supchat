const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "membre", "invité"],
      default: "membre",
    },
    permissions: {
      canPost: { type: Boolean, default: true },
      canDeleteMessages: { type: Boolean, default: false },
      canManageMembers: { type: Boolean, default: false },
      canManageChannels: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", PermissionSchema);
