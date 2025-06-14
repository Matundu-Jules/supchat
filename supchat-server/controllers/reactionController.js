const Reaction = require("../models/Reaction");
const Message = require("../models/Message");
const { getIo } = require("../socket");

exports.addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    if (!messageId || !emoji) {
      return res.status(400).json({ message: "messageId et emoji requis" });
    }
    const existing = await Reaction.findOne({ messageId, userId: req.user.id, emoji });
    if (existing) {
      return res.status(409).json({ message: "Deja react" });
    }
    const reaction = new Reaction({ messageId, userId: req.user.id, emoji });
    await reaction.save();
    const msg = await Message.findById(messageId);
    if (msg) {
      getIo().to(String(msg.channelId || msg.channel)).emit("reactionAdded", reaction);
    }
    return res.status(201).json(reaction);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const reaction = await Reaction.findById(id);
    if (!reaction) {
      return res.status(404).json({ message: "Reaction non trouv\u00e9e" });
    }
    if (String(reaction.userId) !== req.user.id) {
      return res.status(403).json({ message: "Action non autorisee" });
    }
    await Reaction.findByIdAndDelete(id);
    const msg = await Message.findById(reaction.messageId);
    if (msg) {
      getIo()
        .to(String(msg.channelId || msg.channel))
        .emit("reactionRemoved", { _id: id, messageId: reaction.messageId });
    }
    res.status(200).json({ message: "Reaction supprimee" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.getReactionsByMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const reactions = await Reaction.find({ messageId });
    res.status(200).json(reactions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};
