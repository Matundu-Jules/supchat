const Message = require("../models/Message"); // Assure-toi que le modèle Message existe
const Channel = require("../models/Channel"); // Assure-toi que le modèle Channel existe

// ✅ Envoyer un message dans un canal
exports.sendMessage = async (req, res) => {
  try {
    const { channelId, text } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ message: "Le message ne peut pas être vide." });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Canal non trouvé." });
    }

    const message = new Message({
      channelId,
      userId: req.user.id, // L'ID de l'utilisateur qui envoie le message
      text,
    });

    await message.save();

    return res.status(201).json({ message: "Message envoyé.", data: message });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Récupérer tous les messages d'un canal
exports.getMessagesByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await Message.find({ channelId }).populate(
      "userId",
      "username email"
    );

    return res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Récupérer un message spécifique par son ID
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id).populate(
      "userId",
      "username email"
    );

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé." });
    }

    return res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Supprimer un message (Seul l'auteur ou un admin peut le faire)
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé." });
    }

    // Vérifier si l'utilisateur est l'auteur ou un admin
    if (
      message.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    await Message.findByIdAndDelete(id);
    return res.status(200).json({ message: "Message supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};
