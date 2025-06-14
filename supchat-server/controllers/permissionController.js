const Permission = require("../models/Permission");
const Workspace = require("../models/Workspace");
const User = require("../models/User");

// ✅ Assigner une permission à un utilisateur dans un workspace
exports.setPermission = async (req, res) => {
  try {
    const { userId, workspaceId, role, permissions, channelRoles } = req.body;

    // Vérifier si le workspace existe
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Espace de travail non trouvé." });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier si l'utilisateur actuel est admin du workspace
    const isAdmin = await Permission.findOne({
      userId: req.user.id,
      workspaceId,
      role: "admin",
    });

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Seuls les admins peuvent gérer les permissions." });
    }

    // Créer ou mettre à jour la permission
    let permission = await Permission.findOne({ userId, workspaceId });
    if (permission) {
      permission.role = role;
      permission.permissions = permissions;
      if (channelRoles) permission.channelRoles = channelRoles;
    } else {
      permission = new Permission({
        userId,
        workspaceId,
        role,
        permissions,
        channelRoles,
      });
    }

    await permission.save();
    res.status(201).json({ message: "Permission assignée.", permission });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Récupérer toutes les permissions (accessible aux admins seulement)
exports.getPermissions = async (req, res) => {
  try {
    // Vérifier si l'utilisateur actuel est admin d'au moins un workspace
    const isAdmin = await Permission.findOne({
      userId: req.user.id,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { workspaceId } = req.query;
    const query = workspaceId ? { workspaceId } : {};
    const permissions = await Permission.find(query)
      .populate("userId", "username email")
      .populate("workspaceId", "name");
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Récupérer une permission spécifique par ID
exports.getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findById(id)
      .populate("userId", "username email")
      .populate("workspaceId", "name");

    if (!permission) {
      return res.status(404).json({ message: "Permission non trouvée." });
    }

    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Modifier une permission (seuls les admins du workspace peuvent modifier)
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions, channelRoles } = req.body;

    const permission = await Permission.findById(id);
    if (!permission) {
      return res.status(404).json({ message: "Permission non trouvée." });
    }

    // Vérifier si l'utilisateur actuel est admin du workspace
    const isAdmin = await Permission.findOne({
      userId: req.user.id,
      workspaceId: permission.workspaceId,
      role: "admin",
    });

    if (!isAdmin) {
      return res
        .status(403)
        .json({
          message: "Seuls les admins peuvent modifier les permissions.",
        });
    }

    permission.role = role || permission.role;
    permission.permissions = permissions || permission.permissions;
    if (channelRoles) permission.channelRoles = channelRoles;

    await permission.save();
    res.status(200).json({ message: "Permission mise à jour.", permission });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✅ Supprimer une permission (seuls les admins du workspace peuvent supprimer)
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id);
    if (!permission) {
      return res.status(404).json({ message: "Permission non trouvée." });
    }

    // Vérifier si l'utilisateur actuel est admin du workspace
    const isAdmin = await Permission.findOne({
      userId: req.user.id,
      workspaceId: permission.workspaceId,
      role: "admin",
    });

    if (!isAdmin) {
      return res
        .status(403)
        .json({
          message: "Seuls les admins peuvent supprimer des permissions.",
        });
    }

    await Permission.findByIdAndDelete(id);
    res.status(200).json({ message: "Permission supprimée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};
