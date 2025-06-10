const Workspace = require("../models/Workspace");
const Permission = require("../models/Permission");

// ✅ Seuls les admins peuvent récupérer tous les espaces de travail
exports.getAllWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin sur au moins un workspace
    const isAdmin = await Permission.findOne({
      userId,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(403).json({
        message:
          "Accès refusé. Seuls les admins peuvent voir tous les espaces de travail.",
      });
    }

    const workspaces = await Workspace.find().populate(
      "owner",
      "username email"
    );
    return res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Créer un espace de travail (Tous les utilisateurs authentifiés peuvent le faire)
exports.createWorkspace = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Le nom est requis" });
    }

    const workspace = new Workspace({ name, description, owner: req.user.id });
    await workspace.save();

    // Assigner l'utilisateur comme admin du workspace
    await Permission.create({
      userId: req.user.id,
      workspaceId: workspace._id,
      role: "admin",
      permissions: {
        canPost: true,
        canDeleteMessages: true,
        canManageMembers: true,
        canManageChannels: true,
      },
    });

    res.status(201).json({ message: "Espace de travail créé", workspace });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Récupérer un espace de travail par ID (Tous les membres du workspace peuvent voir)
exports.getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findById(id).populate(
      "owner",
      "username email"
    );

    if (!workspace) {
      return res.status(404).json({ message: "Espace de travail non trouvé" });
    }

    return res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Modifier un workspace (Seulement les admins de ce workspace)
exports.updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Vérifier si le workspace existe
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Espace de travail non trouvé" });
    }

    // Vérifier si l'utilisateur est admin du workspace
    const isAdmin = await Permission.findOne({
      userId: req.user.id,
      workspaceId: id,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent modifier cet espace.",
      });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();

    res
      .status(200)
      .json({ message: "Espace de travail mis à jour", workspace });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Supprimer un workspace (Seulement les admins de ce workspace)
exports.deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le workspace existe
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Espace non trouvé" });
    }

    // Vérifier si l'utilisateur est admin du workspace
    const isAdmin = await Permission.findOne({
      userId: req.user.id,
      workspaceId: id,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent supprimer cet espace.",
      });
    }

    await Workspace.findByIdAndDelete(id);
    await Permission.deleteMany({ workspaceId: id });

    res.status(200).json({ message: "Espace de travail supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
