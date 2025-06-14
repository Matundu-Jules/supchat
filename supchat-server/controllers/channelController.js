const channelService = require("../services/channelService");
const Notification = require("../models/Notification");
const { getIo } = require("../socket");
const User = require("../models/User");

// ✅ Créer un canal
exports.createChannel = async (req, res) => {
  try {
    const { name, workspaceId, description, type } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Nom et ID du workspace requis" });
    }

    const newChannel = await channelService.create(
      { name, workspaceId, description, type },
      req.user
    );

    return res
      .status(201)
      .json({ message: "Canal créé avec succès", channel: newChannel });
  } catch (error) {
    if (error.message === "NOT_ALLOWED") {
      return res
        .status(403)
        .json({ message: "Accès refusé. Droits insuffisants." });
    }
    if (error.message === "WORKSPACE_NOT_FOUND") {
      return res.status(404).json({ message: "Workspace non trouvé" });
    }
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Récupérer tous les canaux d'un workspace
exports.getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.query; // On récupère workspaceId depuis les paramètres de requête

    if (!workspaceId) {
      return res.status(400).json({ message: "ID du workspace requis" });
    }

    const channels = await channelService.findByWorkspace(
      workspaceId,
      req.user
    );
    return res.status(200).json(channels);
  } catch (error) {
    if (error.message === "WORKSPACE_NOT_FOUND") {
      return res.status(404).json({ message: "Workspace non trouvé" });
    }
    if (error.message === "NOT_ALLOWED") {
      return res
        .status(403)
        .json({ message: "Accès refusé. Droits insuffisants." });
    }
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Récupérer un canal par ID
exports.getChannelById = async (req, res) => {
  try {
    const { id } = req.params;

    const channel = await channelService.findById(id);
    if (!channel) {
      return res.status(404).json({ message: "Canal non trouvé" });
    }

    return res.status(200).json(channel);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Modifier un canal
exports.updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const channel = await channelService.update(
      id,
      { name, description },
      req.user
    );
    if (!channel) {
      return res.status(404).json({ message: "Canal non trouvé" });
    }

    return res.status(200).json({ message: "Canal mis à jour", channel });
  } catch (error) {
    if (error.message === "NOT_ALLOWED") {
      return res
        .status(403)
        .json({ message: "Accès refusé. Droits insuffisants." });
    }
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Supprimer un canal
exports.deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await channelService.remove(id, req.user);
    if (!deleted) {
      return res.status(404).json({ message: "Canal non trouvé" });
    }

    return res.status(200).json({ message: "Canal supprimé" });
  } catch (error) {
    if (error.message === "NOT_ALLOWED") {
      return res
        .status(403)
        .json({ message: "Accès refusé. Droits insuffisants." });
    }
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Inviter un utilisateur dans un canal
exports.inviteToChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    let channel;
    try {
      channel = await channelService.invite(id, email, req.user);
    } catch (err) {
      if (err.message === "NOT_ALLOWED") {
        return res
          .status(403)
          .json({ message: "Accès refusé. Droits insuffisants." });
      }
      if (err.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Canal non trouvé" });
      }
      if (err.message === "USER_NOT_FOUND") {
        return res.status(400).json({ message: "USER_NOT_FOUND" });
      }
      if (err.message === "ALREADY_MEMBER") {
        return res.status(400).json({ message: "ALREADY_MEMBER" });
      }
      throw err;
    }

    const invitedUser = await User.findOne({ email });
    if (invitedUser) {
      const io = getIo();
      const notif = new Notification({
        type: "channel_invite",
        userId: invitedUser._id,
        channelId: channel._id,
      });
      await notif.save();
      io.to(`user_${invitedUser._id}`).emit("notification", notif);
    }
    return res
      .status(200)
      .json({ message: `Invitation envoyée à ${email}`, channel });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'invitation", error });
  }
};

// ✅ Rejoindre un canal
exports.joinChannel = async (req, res) => {
  try {
    const { id } = req.params;
    let channel;
    try {
      channel = await channelService.join(id, req.user);
    } catch (err) {
      if (err.message === "INVALID_INVITE") {
        return res
          .status(404)
          .json({ message: "Invitation invalide ou expirée" });
      }
      if (err.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Canal non trouvé" });
      }
      if (err.message === "ALREADY_MEMBER") {
        return res.status(400).json({ message: "ALREADY_MEMBER" });
      }
      throw err;
    }
    return res.status(200).json({ message: "Vous avez rejoint le canal", channel });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la jointure", error });
  }
};

// ✅ Quitter un canal
exports.leaveChannel = async (req, res) => {
  try {
    const { id } = req.params;
    let channel;
    try {
      channel = await channelService.leave(id, req.user);
    } catch (err) {
      if (err.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Canal non trouvé" });
      }
      throw err;
    }
    return res.status(200).json({ message: "Vous avez quitté le canal", channel });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors du départ", error });
  }
};
