const Message = require("../models/Message"); // Assure-toi que le modèle Message existe
const Channel = require("../models/Channel"); // Assure-toi que le modèle Channel existe
const { getIo } = require("../socket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const NotificationEmail = require("../emails/NotificationEmail");

// ✅ Envoyer un message dans un canal
exports.sendMessage = async (req, res) => {
  try {
    const { channelId, text } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ message: "Le message ne peut pas être vide." });
    }

    const channel = await Channel.findById(channelId).populate("members");
    if (!channel) {
      return res.status(404).json({ message: "Canal non trouvé." });
    }

    const message = new Message({
      channelId,
      userId: req.user.id, // L'ID de l'utilisateur qui envoie le message
      text,
    });

    await message.save();
    const io = getIo();
    try {
      io.to(channelId).emit("newMessage", message);
    } catch (e) {
      console.error("Socket emit error", e);
    }

    const mentions = Array.from(
      new Set(text.match(/@([a-zA-Z0-9_-]+)/g)?.map((m) => m.slice(1)) || [])
    );
    const mentionedUsers = await User.find({ name: { $in: mentions } });
    for (const user of mentionedUsers) {
      const notif = new Notification({
        userId: user._id,
        messageId: message._id,
        channelId,
        type: "mention",
      });
      await notif.save();
      io.to(`user_${user._id}`).emit("notification", notif);
      const room = io.sockets.adapter.rooms.get(`user_${user._id}`);
      if (!room || room.size === 0) {
        const html = renderToStaticMarkup(
          React.createElement(NotificationEmail, {
            userName: user.name || user.email,
            messageText: text,
          })
        );
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });
        await transporter.sendMail({
          from: `"SupChat" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: "Nouvelle mention SupChat",
          html,
        });
      }
    }

    if (channel.members && channel.members.length) {
      for (const member of channel.members) {
        if (String(member._id) === String(req.user.id)) continue;
        if (mentionedUsers.find((u) => String(u._id) === String(member._id))) {
          continue;
        }
        const notif = new Notification({
          userId: member._id,
          messageId: message._id,
          channelId,
          type: "message",
        });
        await notif.save();
        io.to(`user_${member._id}`).emit("notification", notif);
      }
    }

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
