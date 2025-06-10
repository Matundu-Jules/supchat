const express = require("express");
const workspaceController = require("../controllers/workspaceController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  workspaceController.createWorkspace
); // Seuls les admins peuvent créer
router.get("/", authMiddleware, workspaceController.getAllWorkspaces);
router.get("/:id", authMiddleware, workspaceController.getWorkspaceById);
router.put("/:id", authMiddleware, workspaceController.updateWorkspace);
router.delete("/:id", authMiddleware, workspaceController.deleteWorkspace);

module.exports = router;
