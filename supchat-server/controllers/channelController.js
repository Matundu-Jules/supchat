const channelService = require("../services/channelService");

// ✅ Créer un canal
exports.createChannel = async (req, res) => {
  try {
    const { name, workspaceId, description, type } = req.body

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Nom et ID du workspace requis" })
    }

    const newChannel = await channelService.create({
      name,
      workspaceId,
      description,
      type,
    })

    return res
      .status(201)
      .json({ message: "Canal créé avec succès", channel: newChannel })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error })
  }
};

// ✅ Récupérer tous les canaux d'un workspace
exports.getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.query; // On récupère workspaceId depuis les paramètres de requête

    if (!workspaceId) {
      return res.status(400).json({ message: "ID du workspace requis" });
    }

    const channels = await channelService.findByWorkspace(workspaceId)
    return res.status(200).json(channels)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error })
  }
};

// ✅ Récupérer un canal par ID
exports.getChannelById = async (req, res) => {
  try {
    const { id } = req.params;

    const channel = await channelService.findById(id)
    if (!channel) {
      return res.status(404).json({ message: "Canal non trouvé" })
    }

    return res.status(200).json(channel)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error })
  }
};

// ✅ Modifier un canal
exports.updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const channel = await channelService.update(id, { name, description })
    if (!channel) {
      return res.status(404).json({ message: "Canal non trouvé" })
    }

    return res.status(200).json({ message: "Canal mis à jour", channel })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error })
  }
};

// ✅ Supprimer un canal
exports.deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await channelService.remove(id)
    if (!deleted) {
      return res.status(404).json({ message: "Canal non trouvé" })
    }

    return res.status(200).json({ message: "Canal supprimé" })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error })
  }
};
